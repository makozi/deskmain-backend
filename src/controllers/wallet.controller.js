const { Wallet, WalletTransaction } = require('../models');
const logger = require('../config/logger');

// Get Wallet Balance
exports.getBalance = async (req, res) => {
  try {
    const { merchant_id } = req.params;

    const wallets = await Wallet.findAll({ where: { merchant_id } });
    if (!wallets.length) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No wallets found' } });

    const balances = {};
    wallets.forEach(w => {
      balances[w.currency] = {
        available: w.available_balance,
        pending: w.pending_balance,
        reserve: w.reserve_balance,
      };
    });

    res.json({ balances });
  } catch (error) {
    logger.error('Wallet fetch error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch wallet' } });
  }
};

// Get Wallet Transactions
exports.getTransactions = async (req, res) => {
  try {
    const { merchant_id } = req.params;
    const { currency, limit = 50 } = req.query;

    const wallet = await Wallet.findOne({
      where: { merchant_id, currency: currency || 'USD' },
    });

    if (!wallet) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Wallet not found' } });

    const transactions = await WalletTransaction.findAll({
      where: { wallet_id: wallet.id },
      limit,
      order: [['created_at', 'DESC']],
    });

    res.json({ transactions });
  } catch (error) {
    logger.error('Transactions fetch error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch transactions' } });
  }
};

// Deposit (Manual Credit)
exports.deposit = async (req, res) => {
  try {
    const { merchant_id } = req.params;
    const { amount, currency } = req.body;

    const wallet = await Wallet.findOne({ where: { merchant_id, currency } });
    if (!wallet) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Wallet not found' } });

    await wallet.increment('available_balance', { by: amount });

    await WalletTransaction.create({
      wallet_id: wallet.id,
      amount,
      currency,
      type: 'deposit',
      status: 'completed',
      description: 'Manual deposit',
      reference: 'DEPOSIT-' + Date.now(),
    });

    logger.info(`Deposit processed: ${merchant_id} (${amount} ${currency})`);

    res.json({ message: 'Deposit completed', wallet });
  } catch (error) {
    logger.error('Deposit error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to process deposit' } });
  }
};
