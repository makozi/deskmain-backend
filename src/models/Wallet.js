const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Wallet = db.define('Wallet', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  merchant_id: { type: DataTypes.INTEGER, references: { model: 'merchants', key: 'id' } },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  available_balance: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  pending_balance: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  reserve_balance: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
}, { tableName: 'wallets', timestamps: false, indexes: [{ unique: true, fields: ['merchant_id', 'currency'] }] });

module.exports = Wallet;
