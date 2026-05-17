const { DataTypes } = require('sequelize');
const db = require('../config/database');

const OrderItem = db.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, references: { model: 'orders', key: 'id' } },
  product_id: { type: DataTypes.INTEGER, references: { model: 'products', key: 'id' } },
  variant_id: { type: DataTypes.INTEGER, references: { model: 'product_variants', key: 'id' } },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  unit_price: { type: DataTypes.DECIMAL(15, 2) },
  currency: { type: DataTypes.STRING(3) },
  total_price: { type: DataTypes.DECIMAL(15, 2) },
}, { tableName: 'order_items', timestamps: false });

module.exports = OrderItem;
