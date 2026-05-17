const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Coupon = db.define('Coupon', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  merchant_id: { type: DataTypes.INTEGER, references: { model: 'merchants', key: 'id' } },
  code: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  discount_type: { type: DataTypes.STRING(20) },
  discount_value: { type: DataTypes.DECIMAL(10, 2) },
  min_purchase_amount: { type: DataTypes.DECIMAL(15, 2) },
  max_uses: { type: DataTypes.INTEGER },
  used_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  valid_from: { type: DataTypes.DATE },
  valid_to: { type: DataTypes.DATE },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'coupons', timestamps: false });

module.exports = Coupon;
