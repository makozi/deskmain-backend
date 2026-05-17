const { DataTypes } = require('sequelize');
const db = require('../config/database');

const AffiliateTransaction = db.define('AffiliateTransaction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  affiliate_id: { type: DataTypes.INTEGER, references: { model: 'affiliates', key: 'id' } },
  order_id: { type: DataTypes.INTEGER, references: { model: 'orders', key: 'id' } },
  click_id: { type: DataTypes.STRING(255) },
  buyer_ip: { type: DataTypes.INET },
  commission_amount: { type: DataTypes.DECIMAL(15, 2) },
  status: { type: DataTypes.STRING(50), defaultValue: 'pending' },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'affiliate_transactions', timestamps: false });

module.exports = AffiliateTransaction;
