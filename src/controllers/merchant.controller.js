const { Merchant, User, KYCDocument, Product, Order, Wallet, WalletTransaction } = require('../models');
const logger = require('../config/logger');
const db = require('../config/database');

// Create Merchant Account
exports.create = async (req, res) => {
  try {
    const { business_name, country, currency } = req.body;
    const userId = req.user.id;

    // Check if user already has merchant account
    const existingMerchant = await Merchant.findOne({ where: { user_id: userId } });
    if (existingMerchant) {
      return res.status(422).json({ error: { code: 'MERCHANT_EXISTS', message: 'User already has merchant account' } });
    }

    // Generate slug
    const slug = business_name.toLowerCase().replace(/\s+/g, '-');

    // Create merchant
    const merchant = await Merchant.create({
      user_id: userId,
      business_name,
      slug,
      country,
      kyc_tier: 0,
      kyc_status: 'pending',
    });

    // Create wallets for each supported currency
    const currencies = [currency || 'USD', 'NGN', 'GBP', 'EUR'];
    for (const curr of currencies) {
      await Wallet.create({
        merchant_id: merchant.id,
        currency: curr,
        available_balance: 0,
        pending_balance: 0,
        reserve_balance: 0,
      });
    }

    logger.info(`Merchant account created: ${merchant.id} (${business_name})`);

    res.status(201).json({
      message: 'Merchant account created',
      merchant: {
        id: merchant.id,
        business_name: merchant.business_name,
        slug: merchant.slug,
        kyc_tier: merchant.kyc_tier,
        kyc_status: merchant.kyc_status,
      },
    });
  } catch (error) {
    logger.error('Merchant creation error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to create merchant account' } });
  }
};

// Get Merchant Profile
exports.get = async (req, res) => {
  try {
    const { id } = req.params;

    const merchant = await Merchant.findByPk(id, {
      include: [{ model: User, attributes: ['email', 'first_name', 'last_name'] }],
    });

    if (!merchant) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Merchant not found' } });
    }

    res.json({ merchant });
  } catch (error) {
    logger.error('Fetch merchant error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch merchant' } });
  }
};

// Update Merchant Profile
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { business_name, description, address, city, state, country, postal_code, tax_id } = req.body;

    const merchant = await Merchant.findByPk(id);
    if (!merchant) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Merchant not found' } });
    }

    // Update merchant
    await merchant.update({
      business_name: business_name || merchant.business_name,
      description,
      address,
      city,
      state,
      country,
      postal_code,
      tax_id,
    });

    logger.info(`Merchant updated: ${id}`);

    res.json({ message: 'Merchant profile updated', merchant });
  } catch (error) {
    logger.error('Merchant update error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to update merchant' } });
  }
};

// Submit KYC Documents
exports.submitKYC = async (req, res) => {
  try {
    const { merchant_id } = req.params;
    const { kyc_tier, documents } = req.body;

    const merchant = await Merchant.findByPk(merchant_id);
    if (!merchant) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Merchant not found' } });
    }

    // Create KYC documents
    for (const doc of documents) {
      await KYCDocument.create({
        merchant_id: merchant_id,
        document_type: doc.type,
        file_path: doc.file_path,
        file_name: doc.file_name,
        status: 'pending',
      });
    }

    // Update merchant KYC status
    await merchant.update({ kyc_status: 'pending', kyc_tier: kyc_tier || 1 });

    logger.info(`KYC documents submitted for merchant: ${merchant_id}`);

    res.json({
      message: 'KYC documents submitted for verification',
      merchant,
    });
  } catch (error) {
    logger.error('KYC submission error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to submit KYC' } });
  }
};

// Get Merchant Dashboard
exports.getDashboard = async (req, res) => {
  try {
    const { id } = req.params;

    const merchant = await Merchant.findByPk(id);
    if (!merchant) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Merchant not found' } });
    }

    // Get dashboard metrics
    const totalOrders = await Order.count({ where: { merchant_id: id } });
    const totalProducts = await Product.count({ where: { merchant_id: id } });

    const paidOrders = await Order.findAll({
      where: { merchant_id: id, status: 'paid' },
      attributes: [[db.fn('SUM', db.col('total_amount')), 'total_revenue']],
      raw: true,
    });

    const wallets = await Wallet.findAll({ where: { merchant_id: id } });

    const dashboard = {
      merchant_id: id,
      total_orders: totalOrders,
      total_products: totalProducts,
      total_revenue: paidOrders[0]?.total_revenue || 0,
      wallets: wallets,
      kyc_tier: merchant.kyc_tier,
      kyc_status: merchant.kyc_status,
    };

    res.json({ dashboard });
  } catch (error) {
    logger.error('Dashboard fetch error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch dashboard' } });
  }
};

// Invite Team Member
exports.inviteTeam = async (req, res) => {
  try {
    const { merchant_id } = req.params;
    const { email, role } = req.body;

    // TODO: Implement team member invitation logic
    // 1. Send invitation email
    // 2. Create pending staff record
    // 3. Generate invitation token

    res.json({ message: 'Team member invited' });
  } catch (error) {
    logger.error('Team invite error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to invite team member' } });
  }
};

// Get Team Members
exports.getTeam = async (req, res) => {
  try {
    const { merchant_id } = req.params;

    // TODO: Get merchant staff members
    const team = [];

    res.json({ team });
  } catch (error) {
    logger.error('Get team error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch team' } });
  }
};
