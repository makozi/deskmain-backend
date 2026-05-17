const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Affiliate = db.define('Affiliate', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  merchant_id: { type: DataTypes.INTEGER, references: { model: 'merchants', key: 'id' } },
  user_id: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
  commission_type: { type: DataTypes.STRING(20), defaultValue: 'percentage' },
  commission_value: { type: DataTypes.DECIMAL(10, 2), defaultValue: 15.00 },
  cookie_days: { type: DataTypes.INTEGER, defaultValue: 30 },
  referral_code: { type: DataTypes.STRING(100), unique: true },
  total_clicks: { type: DataTypes.INTEGER, defaultValue: 0 },
  total_sales: { type: DataTypes.INTEGER, defaultValue: 0 },
  total_commission: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  status: { type: DataTypes.STRING(50), defaultValue: 'active' },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'affiliates', timestamps: false });

module.exports = Affiliate;
