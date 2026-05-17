const { Merchant, KYCDocument, Order, User, Payout, AuditLog } = require('../models');
const logger = require('../config/logger');
const db = require('../config/database');

// Get All Merchants
exports.getMerchants = async (req, res) => {
  try {
    const { status, kyc_tier } = req.query;
    const where = {};
    if (status) where.kyc_status = status;
    if (kyc_tier) where.kyc_tier = kyc_tier;

    const merchants = await Merchant.findAll({ where, include: [User] });
    res.json({ merchants });
  } catch (error) {
    logger.error('Merchants fetch error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch merchants' } });
  }
};

// Approve KYC
exports.approveKYC = async (req, res) => {
  try {
    const { merchant_id } = req.params;
    const { kyc_tier } = req.body;

    const merchant = await Merchant.findByPk(merchant_id);
    if (!merchant) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Merchant not found' } });

    await merchant.update({ kyc_status: 'approved', kyc_tier });

    // Log audit
    await AuditLog.create({
      user_id: req.user.id,
      action: 'KYC_APPROVED',
      entity_type: 'Merchant',
      entity_id: merchant_id,
      old_values: { kyc_status: 'pending' },
      new_values: { kyc_status: 'approved', kyc_tier },
      ip_address: req.ip,
    });

    logger.info(`KYC approved for merchant: ${merchant_id}`);

    res.json({ message: 'KYC approved', merchant });
  } catch (error) {
    logger.error('KYC approval error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to approve KYC' } });
  }
};

// Reject KYC
exports.rejectKYC = async (req, res) => {
  try {
    const { merchant_id } = req.params;
    const { reason } = req.body;

    const merchant = await Merchant.findByPk(merchant_id);
    if (!merchant) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Merchant not found' } });

    await merchant.update({ kyc_status: 'rejected', suspension_reason: reason });

    logger.info(`KYC rejected for merchant: ${merchant_id}`);

    res.json({ message: 'KYC rejected', merchant });
  } catch (error) {
    logger.error('KYC rejection error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to reject KYC' } });
  }
};

// Get Disputes
exports.getDisputes = async (req, res) => {
  try {
    // TODO: Implement dispute list
    res.json({ disputes: [] });
  } catch (error) {
    logger.error('Disputes fetch error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch disputes' } });
  }
};

// Get Audit Logs
exports.getAuditLogs = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const logs = await AuditLog.findAll({ limit, order: [['created_at', 'DESC']] });
    res.json({ logs });
  } catch (error) {
    logger.error('Audit logs fetch error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch audit logs' } });
  }
};

// Get Analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalOrders = await Order.count();
    const totalRevenue = await Order.sum('total_amount', { where: { status: 'paid' } });
    const totalMerchants = await Merchant.count();

    res.json({
      analytics: {
        total_orders: totalOrders,
        total_revenue: totalRevenue || 0,
        total_merchants: totalMerchants,
      },
    });
  } catch (error) {
    logger.error('Analytics fetch error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch analytics' } });
  }
};
