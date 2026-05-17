const { Payout, PayoutAccount, Wallet } = require('../models');
const logger = require('../config/logger');

// Request Payout
exports.create = async (req, res) => {
  try {
    const { merchant_id, amount, currency, account_id } = req.body;

    const account = await PayoutAccount.findByPk(account_id);
    if (!account) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Bank account not found' } });

    const wallet = await Wallet.findOne({ where: { merchant_id, currency } });
    if (!wallet) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Wallet not found' } });

    if (wallet.available_balance < amount) {
      return res.status(422).json({ error: { code: 'INSUFFICIENT_BALANCE', message: 'Insufficient balance' } });
    }

    const payout = await Payout.create({
      merchant_id,
      amount,
      currency,
      wallet_id: wallet.id,
      bank_account_id: account_id,
      status: 'pending',
    });

    // Deduct from available balance
    await wallet.decrement('available_balance', { by: amount });

    logger.info(`Payout requested: ${payout.id}`);

    res.status(201).json({ message: 'Payout request submitted', payout });
  } catch (error) {
    logger.error('Payout creation error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to request payout' } });
  }
};

// Get Payouts
exports.list = async (req, res) => {
  try {
    const { merchant_id } = req.query;
    const payouts = await Payout.findAll({ where: { merchant_id } });
    res.json({ payouts });
  } catch (error) {
    logger.error('Payouts fetch error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch payouts' } });
  }
};

// Get Single Payout
exports.get = async (req, res) => {
  try {
    const { id } = req.params;
    const payout = await Payout.findByPk(id);
    if (!payout) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Payout not found' } });
    res.json({ payout });
  } catch (error) {
    logger.error('Payout fetch error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch payout' } });
  }
};

// Get Bank Accounts
exports.getBankAccounts = async (req, res) => {
  try {
    const { merchant_id } = req.query;
    const accounts = await PayoutAccount.findAll({ where: { merchant_id } });
    res.json({ accounts });
  } catch (error) {
    logger.error('Accounts fetch error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch bank accounts' } });
  }
};
