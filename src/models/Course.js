const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Course = db.define('Course', {
  product_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: 'products', key: 'id' } },
  level: { type: DataTypes.STRING(50) },
  estimated_duration_minutes: { type: DataTypes.INTEGER },
  completion_certificate: { type: DataTypes.BOOLEAN, defaultValue: false },
  prerequisites: { type: DataTypes.TEXT },
}, { tableName: 'courses', timestamps: false });

module.exports = Course;
