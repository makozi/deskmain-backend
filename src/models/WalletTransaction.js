const { DataTypes } = require('sequelize');
const db = require('../config/database');

const WalletTransaction = db.define('WalletTransaction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  wallet_id: { type: DataTypes.INTEGER, references: { model: 'wallets', key: 'id' } },
  order_id: { type: DataTypes.INTEGER, references: { model: 'orders', key: 'id' } },
  payout_id: { type: DataTypes.INTEGER },
  amount: { type: DataTypes.DECIMAL(15, 2) },
  currency: { type: DataTypes.STRING(3) },
  type: { type: DataTypes.STRING(50) },
  status: { type: DataTypes.STRING(50) },
  description: { type: DataTypes.TEXT },
  reference: { type: DataTypes.STRING(255), unique: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'wallet_transactions', timestamps: false });

module.exports = WalletTransaction;
