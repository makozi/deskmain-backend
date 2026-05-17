const { DataTypes } = require('sequelize');
const db = require('../config/database');

const MerchantStaff = db.define('MerchantStaff', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  merchant_id: { type: DataTypes.INTEGER, references: { model: 'merchants', key: 'id' } },
  user_id: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
  role: { type: DataTypes.ENUM('admin', 'support', 'fulfillment'), allowNull: false },
  permissions: { type: DataTypes.JSONB },
  invited_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  accepted_at: { type: DataTypes.DATE },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'merchant_staff', timestamps: false });

module.exports = MerchantStaff;
