const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Merchant = db.define('Merchant', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
  business_name: { type: DataTypes.STRING(255), allowNull: false },
  slug: { type: DataTypes.STRING(255), unique: true, allowNull: false },
  logo_path: { type: DataTypes.STRING(500) },
  cover_image_path: { type: DataTypes.STRING(500) },
  description: { type: DataTypes.TEXT },
  address: { type: DataTypes.TEXT },
  city: { type: DataTypes.STRING(100) },
  state: { type: DataTypes.STRING(100) },
  country: { type: DataTypes.STRING(2) },
  postal_code: { type: DataTypes.STRING(20) },
  tax_id: { type: DataTypes.STRING(100) },
  kyc_tier: { type: DataTypes.INTEGER, defaultValue: 0 },
  kyc_status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
  custom_domain: { type: DataTypes.STRING(255) },
  platform_fee_percentage: { type: DataTypes.DECIMAL(5, 2), defaultValue: 4.00 },
  is_suspended: { type: DataTypes.BOOLEAN, defaultValue: false },
  suspension_reason: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, onUpdate: DataTypes.NOW },
}, { tableName: 'merchants', timestamps: false });

module.exports = Merchant;
