import db from '../config/database.js';
import logger from '../config/logger.js';

export const createDispute = async (req, res) => {
  try {
    const { orderId, reason, description, evidenceUrls } = req.body;
    const userId = req.user.id;

    // Get order details
    const orderResult = await db.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orderResult.rows[0];

    // Create dispute
    const result = await db.query(
      `INSERT INTO disputes (order_id, buyer_id, seller_id, reason, description, evidence_urls, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
       RETURNING *`,
      [orderId, userId, order.merchant_id, reason, description, JSON.stringify(evidenceUrls || [])]
    );

    logger.info(`Dispute created: ${result.rows[0].id}`);
    res.status(201).json({
      success: true,
      message: 'Dispute created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error creating dispute:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      `SELECT * FROM disputes WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2 OR $3 = true)`,
      [disputeId, userId, req.user.role === 'admin']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    const dispute = result.rows[0];
    dispute.evidenceUrls = JSON.parse(dispute.evidence_urls || '[]');

    res.json({
      success: true,
      data: dispute
    });
  } catch (error) {
    logger.error('Error fetching dispute:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getUserDisputes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 20, offset = 0 } = req.query;

    let query = `SELECT * FROM disputes WHERE (buyer_id = $1 OR seller_id = $1)`;
    const params = [userId];

    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching disputes:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllDisputes = async (req, res) => {
  try {
    const { status = 'pending', limit = 20, offset = 0 } = req.query;

    let query = 'SELECT * FROM disputes WHERE 1=1';
    const params = [];

    if (status !== 'all') {
      query += ' AND status = $1';
      params.push(status);
      query += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
    } else {
      query += ` ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
      params.push(limit, offset);
    }

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching disputes:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateDisputeStatus = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { status, resolution, outcome } = req.body;

    const result = await db.query(
      `UPDATE disputes SET status = $1, resolution = $2, outcome = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [status, resolution, outcome, disputeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    logger.info(`Dispute ${disputeId} updated: ${status}`);
    res.json({
      success: true,
      message: 'Dispute updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating dispute:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const addDisputeComment = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    const result = await db.query(
      `INSERT INTO dispute_comments (dispute_id, user_id, comment, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [disputeId, userId, comment]
    );

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error adding comment:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getDisputeComments = async (req, res) => {
  try {
    const { disputeId } = req.params;

    const result = await db.query(
      `SELECT dc.*, u.first_name, u.last_name FROM dispute_comments dc
       LEFT JOIN users u ON dc.user_id = u.id
       WHERE dc.dispute_id = $1
       ORDER BY dc.created_at ASC`,
      [disputeId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching dispute comments:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
