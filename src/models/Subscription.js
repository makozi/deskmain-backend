const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Subscription = db.define('Subscription', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  buyer_id: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
  product_id: { type: DataTypes.INTEGER, references: { model: 'products', key: 'id' } },
  merchant_id: { type: DataTypes.INTEGER, references: { model: 'merchants', key: 'id' } },
  status: { type: DataTypes.ENUM('active', 'paused', 'cancelled', 'expired'), defaultValue: 'active' },
  interval_type: { type: DataTypes.STRING(20) },
  amount: { type: DataTypes.DECIMAL(15, 2) },
  currency: { type: DataTypes.STRING(3) },
  current_period_start: { type: DataTypes.DATE },
  current_period_end: { type: DataTypes.DATE },
  cancelled_at: { type: DataTypes.DATE },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'subscriptions', timestamps: false });

module.exports = Subscription;
