import db from '../config/database.js';
import logger from '../config/logger.js';

export const createSubscriptionPlan = async (req, res) => {
  try {
    const { name, description, price, billingCycle, features } = req.body;

    const result = await db.query(
      `INSERT INTO subscription_plans (name, description, price, billing_cycle, features, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [name, description, price, billingCycle, JSON.stringify(features)]
    );

    logger.info(`Subscription plan created: ${result.rows[0].id}`);
    res.status(201).json({
      success: true,
      message: 'Subscription plan created',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error creating subscription plan:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getSubscriptionPlan = async (req, res) => {
  try {
    const { planId } = req.params;

    const result = await db.query(
      'SELECT * FROM subscription_plans WHERE id = $1',
      [planId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    const plan = result.rows[0];
    plan.features = JSON.parse(plan.features || '[]');

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    logger.error('Error fetching subscription plan:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllPlans = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM subscription_plans ORDER BY created_at DESC'
    );

    const plans = result.rows.map(plan => ({
      ...plan,
      features: JSON.parse(plan.features || '[]')
    }));

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    logger.error('Error fetching plans:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateSubscriptionPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const { name, description, price, billingCycle, features } = req.body;

    const result = await db.query(
      `UPDATE subscription_plans SET name = $1, description = $2, price = $3,
       billing_cycle = $4, features = $5, updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [name, description, price, billingCycle, JSON.stringify(features), planId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    logger.info(`Subscription plan updated: ${planId}`);
    res.json({
      success: true,
      message: 'Plan updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating subscription plan:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteSubscriptionPlan = async (req, res) => {
  try {
    const { planId } = req.params;

    const result = await db.query(
      'DELETE FROM subscription_plans WHERE id = $1 RETURNING *',
      [planId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    logger.info(`Subscription plan deleted: ${planId}`);
    res.json({
      success: true,
      message: 'Plan deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting subscription plan:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const subscribeUser = async (req, res) => {
  try {
    const { planId } = req.params;
    const userId = req.user.id;

    // Check active subscription
    const activeResult = await db.query(
      `SELECT * FROM user_subscriptions WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );

    if (activeResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already has active subscription'
      });
    }

    // Get plan details
    const planResult = await db.query(
      'SELECT * FROM subscription_plans WHERE id = $1',
      [planId]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    const plan = planResult.rows[0];
    const now = new Date();
    const expiryDate = new Date();

    if (plan.billing_cycle === 'monthly') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (plan.billing_cycle === 'quarterly') {
      expiryDate.setMonth(expiryDate.getMonth() + 3);
    } else if (plan.billing_cycle === 'annual') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    const result = await db.query(
      `INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, expiry_date, created_at)
       VALUES ($1, $2, 'active', NOW(), $3, NOW())
       RETURNING *`,
      [userId, planId, expiryDate]
    );

    logger.info(`User ${userId} subscribed to plan ${planId}`);
    res.status(201).json({
      success: true,
      message: 'Subscription activated',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error subscribing user:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      `UPDATE user_subscriptions SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      [subscriptionId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    logger.info(`User ${userId} cancelled subscription ${subscriptionId}`);
    res.json({
      success: true,
      message: 'Subscription cancelled',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error cancelling subscription:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getUserSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT us.*, sp.name, sp.description, sp.price, sp.billing_cycle, sp.features
       FROM user_subscriptions us
       LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
       WHERE us.user_id = $1 AND us.status = 'active'
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: null
      });
    }

    const subscription = result.rows[0];
    subscription.features = JSON.parse(subscription.features || '[]');

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    logger.error('Error fetching user subscription:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
