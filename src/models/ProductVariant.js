const { DataTypes } = require('sequelize');
const db = require('../config/database');

const ProductVariant = db.define('ProductVariant', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.INTEGER, references: { model: 'products', key: 'id' } },
  name: { type: DataTypes.STRING(100) },
  sku: { type: DataTypes.STRING(100), unique: true },
  prices: { type: DataTypes.JSONB },
  stock_quantity: { type: DataTypes.INTEGER },
  attributes: { type: DataTypes.JSONB },
}, { tableName: 'product_variants', timestamps: false });

module.exports = ProductVariant;
