const { Order, Wallet, WalletTransaction } = require('../models');
const logger = require('../config/logger');
const db = require('../config/database');

// Initialize Payment
exports.initialize = async (req, res) => {
  try {
    const { order_id, payment_method, payment_provider } = req.body;

    const order = await Order.findByPk(order_id);
    if (!order) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Order not found' } });

    // TODO: Initialize payment with provider (Flutterwave, Stripe, etc.)
    // 1. Call payment provider API
    // 2. Get payment reference
    // 3. Create payment record

    const paymentReference = 'PAY-' + Date.now();

    await order.update({
      payment_method,
      payment_provider,
      payment_reference: paymentReference,
      status: 'pending',
    });

    logger.info(`Payment initialized for order: ${order_id}`);

    res.json({
      message: 'Payment initialized',
      payment_reference: paymentReference,
      redirect_url: `https://payment-provider.com/pay/${paymentReference}`,
    });
  } catch (error) {
    logger.error('Payment initialization error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to initialize payment' } });
  }
};

// Verify Payment
exports.verify = async (req, res) => {
  try {
    const { reference } = req.params;

    // TODO: Verify payment with provider
    const order = await Order.findOne({ where: { payment_reference: reference } });
    if (!order) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Payment not found' } });

    // Update order status to paid
    await order.update({ status: 'paid', paid_at: new Date() });

    // Credit merchant wallet
    const wallet = await Wallet.findOne({
      where: { merchant_id: order.merchant_id, currency: order.currency },
    });

    if (wallet) {
      await wallet.increment('pending_balance', { by: order.merchant_earnings });

      await WalletTransaction.create({
        wallet_id: wallet.id,
        order_id: order.id,
        amount: order.merchant_earnings,
        currency: order.currency,
        type: 'sale',
        status: 'pending',
        description: `Sale from order #${order.order_number}`,
        reference: reference,
      });
    }

    logger.info(`Payment verified: ${reference}`);

    res.json({ message: 'Payment verified', order });
  } catch (error) {
    logger.error('Payment verification error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to verify payment' } });
  }
};

// Webhook Handler
exports.webhook = async (req, res) => {
  try {
    const { event, data } = req.body;

    // TODO: Process webhook from payment provider
    // 1. Verify webhook signature
    // 2. Process event (payment.success, payment.failed, etc.)
    // 3. Update order and wallet

    logger.info(`Webhook received: ${event}`);

    res.json({ status: 'ok' });
  } catch (error) {
    logger.error('Webhook error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Webhook processing failed' } });
  }
};
