const { Review, Order, Product } = require('../models');
const logger = require('../config/logger');

// Create Review
exports.create = async (req, res) => {
  try {
    const { product_id, order_id, buyer_id, rating, comment } = req.body;

    // Verify purchase
    const order = await Order.findByPk(order_id, { include: [{ association: 'items' }] });
    if (!order || order.status !== 'paid') {
      return res.status(422).json({ error: { code: 'INVALID_ORDER', message: 'Order not found or not completed' } });
    }

    const review = await Review.create({
      product_id,
      buyer_id,
      order_id,
      rating,
      comment,
      is_verified_purchase: true,
    });

    logger.info(`Review created: ${review.id}`);

    res.status(201).json({ message: 'Review submitted', review });
  } catch (error) {
    logger.error('Review creation error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to create review' } });
  }
};

// Delete Review
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);
    if (!review) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Review not found' } });

    await review.destroy();
    logger.info(`Review deleted: ${id}`);

    res.json({ message: 'Review deleted' });
  } catch (error) {
    logger.error('Review deletion error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to delete review' } });
  }
};
