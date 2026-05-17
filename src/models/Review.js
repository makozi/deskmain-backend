const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Review = db.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.INTEGER, references: { model: 'products', key: 'id' } },
  buyer_id: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
  order_id: { type: DataTypes.INTEGER, references: { model: 'orders', key: 'id' } },
  rating: { type: DataTypes.INTEGER, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT },
  is_verified_purchase: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_approved: { type: DataTypes.BOOLEAN, defaultValue: false },
  merchant_reply: { type: DataTypes.TEXT },
  reply_at: { type: DataTypes.DATE },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'reviews', timestamps: false });

module.exports = Review;
