const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Payout = db.define('Payout', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  merchant_id: { type: DataTypes.INTEGER, references: { model: 'merchants', key: 'id' } },
  amount: { type: DataTypes.DECIMAL(15, 2) },
  currency: { type: DataTypes.STRING(3) },
  wallet_id: { type: DataTypes.INTEGER, references: { model: 'wallets', key: 'id' } },
  bank_account_id: { type: DataTypes.INTEGER },
  status: { type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'), defaultValue: 'pending' },
  provider: { type: DataTypes.STRING(50) },
  provider_reference: { type: DataTypes.STRING(255) },
  failure_reason: { type: DataTypes.TEXT },
  requested_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  processed_at: { type: DataTypes.DATE },
  completed_at: { type: DataTypes.DATE },
}, { tableName: 'payouts', timestamps: false });

module.exports = Payout;
