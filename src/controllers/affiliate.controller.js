const { Affiliate, AffiliateTransaction, Order } = require('../models');
const logger = require('../config/logger');
const db = require('../config/database');

// Join Affiliate Program
exports.join = async (req, res) => {
  try {
    const { merchant_id, user_id } = req.body;

    const existingAffiliate = await Affiliate.findOne({ where: { merchant_id, user_id } });
    if (existingAffiliate) return res.status(422).json({ error: { code: 'ALREADY_AFFILIATE', message: 'Already an affiliate' } });

    const referralCode = 'AFF-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const affiliate = await Affiliate.create({
      merchant_id,
      user_id,
      referral_code: referralCode,
    });

    logger.info(`Affiliate joined: ${affiliate.id}`);

    res.status(201).json({ message: 'Affiliate program joined', affiliate });
  } catch (error) {
    logger.error('Affiliate join error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to join affiliate program' } });
  }
};

// Get Affiliate Dashboard
exports.getDashboard = async (req, res) => {
  try {
    const { affiliate_id } = req.params;

    const affiliate = await Affiliate.findByPk(affiliate_id);
    if (!affiliate) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Affiliate not found' } });

    const dashboard = {
      total_earned: affiliate.total_commission,
      total_clicks: affiliate.total_clicks,
      total_sales: affiliate.total_sales,
      conversion_rate: affiliate.total_clicks > 0 ? (affiliate.total_sales / affiliate.total_clicks * 100).toFixed(2) : 0,
      referral_code: affiliate.referral_code,
    };

    res.json({ dashboard });
  } catch (error) {
    logger.error('Dashboard fetch error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch dashboard' } });
  }
};

// Get Commissions
exports.getCommissions = async (req, res) => {
  try {
    const { affiliate_id } = req.params;

    const transactions = await AffiliateTransaction.findAll({
      where: { affiliate_id },
      include: [Order],
      limit: 50,
      order: [['created_at', 'DESC']],
    });

    res.json({ commissions: transactions });
  } catch (error) {
    logger.error('Commissions fetch error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch commissions' } });
  }
};

// Request Payout
exports.withdraw = async (req, res) => {
  try {
    const { affiliate_id } = req.params;
    const { amount } = req.body;

    const affiliate = await Affiliate.findByPk(affiliate_id);
    if (!affiliate) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Affiliate not found' } });

    if (affiliate.total_commission < amount) {
      return res.status(422).json({ error: { code: 'INSUFFICIENT_BALANCE', message: 'Insufficient commission balance' } });
    }

    // TODO: Process payout request
    logger.info(`Payout requested: ${affiliate_id} (${amount})`);

    res.json({ message: 'Payout request submitted' });
  } catch (error) {
    logger.error('Withdrawal error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to request withdrawal' } });
  }
};
