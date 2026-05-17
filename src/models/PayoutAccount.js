const { DataTypes } = require('sequelize');
const db = require('../config/database');

const PayoutAccount = db.define('PayoutAccount', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  merchant_id: { type: DataTypes.INTEGER, references: { model: 'merchants', key: 'id' } },
  account_holder_name: { type: DataTypes.STRING(255) },
  bank_name: { type: DataTypes.STRING(255) },
  bank_code: { type: DataTypes.STRING(50) },
  account_number: { type: DataTypes.STRING(100) },
  routing_number: { type: DataTypes.STRING(100) },
  sort_code: { type: DataTypes.STRING(20) },
  currency: { type: DataTypes.STRING(3) },
  country: { type: DataTypes.STRING(2) },
  is_default: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'payout_accounts', timestamps: false });

module.exports = PayoutAccount;
