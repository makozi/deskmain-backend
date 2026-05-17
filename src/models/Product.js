const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Product = db.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  merchant_id: { type: DataTypes.INTEGER, references: { model: 'merchants', key: 'id' } },
  product_type: { type: DataTypes.STRING(50), allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
  slug: { type: DataTypes.STRING(255), allowNull: false },
  short_description: { type: DataTypes.STRING(500) },
  description: { type: DataTypes.TEXT },
  featured_image_path: { type: DataTypes.STRING(500) },
  gallery_images: { type: DataTypes.JSONB },
  base_currency: { type: DataTypes.STRING(3), defaultValue: 'USD' },
  prices: { type: DataTypes.JSONB, allowNull: false },
  compare_at_prices: { type: DataTypes.JSONB },
  is_taxable: { type: DataTypes.BOOLEAN, defaultValue: true },
  tax_class: { type: DataTypes.STRING(50), defaultValue: 'standard' },
  track_inventory: { type: DataTypes.BOOLEAN, defaultValue: false },
  stock_quantity: { type: DataTypes.INTEGER },
  low_stock_threshold: { type: DataTypes.INTEGER, defaultValue: 5 },
  allow_backorders: { type: DataTypes.BOOLEAN, defaultValue: false },
  status: { type: DataTypes.ENUM('draft', 'published', 'archived'), defaultValue: 'draft' },
  seo_title: { type: DataTypes.STRING(255) },
  seo_description: { type: DataTypes.STRING(500) },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, onUpdate: DataTypes.NOW },
}, { tableName: 'products', timestamps: false });

module.exports = Product;
