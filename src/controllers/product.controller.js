const { Product, ProductFile, Merchant } = require('../models');
const logger = require('../config/logger');

// Create Product
exports.create = async (req, res) => {
  try {
    const { merchant_id, product_type, title, description, prices } = req.body;

    const merchant = await Merchant.findByPk(merchant_id);
    if (!merchant) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Merchant not found' } });

    const slug = title.toLowerCase().replace(/\s+/g, '-');

    const product = await Product.create({
      merchant_id,
      product_type,
      title,
      slug,
      description,
      prices,
      status: 'draft',
    });

    logger.info(`Product created: ${product.id} (${title})`);

    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    logger.error('Product creation error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to create product' } });
  }
};

// Get Products
exports.list = async (req, res) => {
  try {
    const { merchant_id } = req.query;
    const products = await Product.findAll({ where: { merchant_id } });
    res.json({ products });
  } catch (error) {
    logger.error('Products fetch error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch products' } });
  }
};

// Get Single Product
exports.get = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, { include: [ProductFile] });
    if (!product) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
    res.json({ product });
  } catch (error) {
    logger.error('Product fetch error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch product' } });
  }
};

// Update Product
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, prices, status } = req.body;

    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });

    await product.update({ title, description, prices, status });
    logger.info(`Product updated: ${id}`);

    res.json({ message: 'Product updated', product });
  } catch (error) {
    logger.error('Product update error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to update product' } });
  }
};

// Delete Product
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });

    await product.destroy();
    logger.info(`Product deleted: ${id}`);

    res.json({ message: 'Product deleted' });
  } catch (error) {
    logger.error('Product deletion error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to delete product' } });
  }
};

// Get Product Reviews
exports.getReviews = async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Fetch product reviews
    res.json({ reviews: [] });
  } catch (error) {
    logger.error('Reviews fetch error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch reviews' } });
  }
};
