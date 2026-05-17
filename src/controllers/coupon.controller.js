import db from '../config/database.js';
import logger from '../config/logger.js';

export const createCoupon = async (req, res) => {
  try {
    const { code, description, discountType, discountValue, minAmount, maxAmount, usageLimit, expiryDate } = req.body;

    const result = await db.query(
      `INSERT INTO coupons (code, description, discount_type, discount_value, min_amount, max_amount, usage_limit, expiry_date, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [code, description, discountType, discountValue, minAmount, maxAmount, usageLimit, expiryDate]
    );

    logger.info(`Coupon created: ${result.rows[0].id}`);
    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error creating coupon:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getCoupon = async (req, res) => {
  try {
    const { code } = req.params;

    const result = await db.query(
      'SELECT * FROM coupons WHERE code = $1',
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching coupon:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllCoupons = async (req, res) => {
  try {
    const { status = 'active' } = req.query;

    let query = 'SELECT * FROM coupons WHERE 1=1';
    const params = [];

    if (status === 'active') {
      query += ' AND expiry_date > NOW() AND status = true';
    } else if (status === 'expired') {
      query += ' AND expiry_date <= NOW()';
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching coupons:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const { description, discountValue, minAmount, maxAmount, usageLimit, expiryDate } = req.body;

    const result = await db.query(
      `UPDATE coupons SET description = $1, discount_value = $2, min_amount = $3,
       max_amount = $4, usage_limit = $5, expiry_date = $6, updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [description, discountValue, minAmount, maxAmount, usageLimit, expiryDate, couponId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    logger.info(`Coupon updated: ${couponId}`);
    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating coupon:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;

    const result = await db.query(
      'DELETE FROM coupons WHERE id = $1 RETURNING *',
      [couponId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    logger.info(`Coupon deleted: ${couponId}`);
    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting coupon:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code, amount } = req.body;

    const result = await db.query(
      'SELECT * FROM coupons WHERE code = $1 AND status = true AND expiry_date > NOW()',
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Coupon is invalid or expired'
      });
    }

    const coupon = result.rows[0];

    // Check minimum amount
    if (coupon.min_amount && amount < coupon.min_amount) {
      return res.status(400).json({
        success: false,
        message: `Minimum amount required: $${coupon.min_amount}`
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (amount * coupon.discount_value) / 100;
      if (coupon.max_amount && discount > coupon.max_amount) {
        discount = coupon.max_amount;
      }
    } else if (coupon.discount_type === 'fixed') {
      discount = coupon.discount_value;
    }

    res.json({
      success: true,
      message: 'Coupon is valid',
      data: {
        coupon,
        discount: discount.toFixed(2),
        finalAmount: (amount - discount).toFixed(2)
      }
    });
  } catch (error) {
    logger.error('Error validating coupon:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const applyCoupon = async (req, res) => {
  try {
    const { code, orderId } = req.body;
    const userId = req.user.id;

    // Get coupon
    const couponResult = await db.query(
      'SELECT * FROM coupons WHERE code = $1 AND status = true AND expiry_date > NOW()',
      [code]
    );

    if (couponResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Coupon is invalid or expired'
      });
    }

    const coupon = couponResult.rows[0];

    // Update order with coupon
    const result = await db.query(
      `UPDATE orders SET coupon_id = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [coupon.id, orderId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Increment usage count
    await db.query(
      'UPDATE coupons SET usage_count = usage_count + 1 WHERE id = $1',
      [coupon.id]
    );

    logger.info(`Coupon ${code} applied to order ${orderId}`);
    res.json({
      success: true,
      message: 'Coupon applied successfully',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error applying coupon:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
