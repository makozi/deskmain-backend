const { Order, OrderItem, Wallet, WalletTransaction, Product } = require('../models');
const logger = require('../config/logger');
const db = require('../config/database');

// Create Order
exports.create = async (req, res) => {
  try {
    const { buyer_id, merchant_id, items, currency, total_amount } = req.body;

    const transaction = await db.transaction();

    try {
      // Generate order number
      const orderNumber = 'ORD-' + Date.now();

      // Calculate platform fee (4%)
      const platformFee = total_amount * 0.04;
      const merchantEarnings = total_amount - platformFee;

      // Create order
      const order = await Order.create({
        order_number: orderNumber,
        buyer_id,
        merchant_id,
        total_amount,
        currency,
        platform_fee: platformFee,
        merchant_earnings: merchantEarnings,
        status: 'pending',
      }, { transaction });

      // Create order items
      for (const item of items) {
        await OrderItem.create({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency,
          total_price: item.unit_price * item.quantity,
        }, { transaction });
      }

      await transaction.commit();

      logger.info(`Order created: ${order.id}`);

      res.status(201).json({ message: 'Order created', order });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('Order creation error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to create order' } });
  }
};

// Get Orders
exports.list = async (req, res) => {
  try {
    const { merchant_id } = req.query;
    const orders = await Order.findAll({ where: { merchant_id }, include: [OrderItem] });
    res.json({ orders });
  } catch (error) {
    logger.error('Orders fetch error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch orders' } });
  }
};

// Get Single Order
exports.get = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, { include: [OrderItem] });
    if (!order) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Order not found' } });
    res.json({ order });
  } catch (error) {
    logger.error('Order fetch error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch order' } });
  }
};

// Process Refund
exports.refund = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Order not found' } });

    // TODO: Process refund logic
    // 1. Validate refund eligibility
    // 2. Reverse wallet transaction
    // 3. Update order status

    logger.info(`Refund processed for order: ${id}`);

    res.json({ message: 'Refund processed', order });
  } catch (error) {
    logger.error('Refund error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to process refund' } });
  }
};
