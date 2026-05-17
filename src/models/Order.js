const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Order = db.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_number: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  buyer_id: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
  merchant_id: { type: DataTypes.INTEGER, references: { model: 'merchants', key: 'id' } },
  total_amount: { type: DataTypes.DECIMAL(15, 2) },
  currency: { type: DataTypes.STRING(3) },
  platform_fee: { type: DataTypes.DECIMAL(15, 2) },
  merchant_earnings: { type: DataTypes.DECIMAL(15, 2) },
  payment_method: { type: DataTypes.STRING(50) },
  payment_provider: { type: DataTypes.STRING(50) },
  payment_reference: { type: DataTypes.STRING(255) },
  status: { type: DataTypes.ENUM('pending', 'paid', 'fulfilled', 'refunded', 'cancelled'), defaultValue: 'pending' },
  shipping_address: { type: DataTypes.JSONB },
  billing_address: { type: DataTypes.JSONB },
  paid_at: { type: DataTypes.DATE },
  fulfilled_at: { type: DataTypes.DATE },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, onUpdate: DataTypes.NOW },
}, { tableName: 'orders', timestamps: false });

module.exports = Order;
