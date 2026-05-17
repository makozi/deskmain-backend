const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Module = db.define('Module', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  course_id: { type: DataTypes.INTEGER, references: { model: 'courses', key: 'product_id' } },
  title: { type: DataTypes.STRING(255) },
  sort_order: { type: DataTypes.INTEGER },
  is_published: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'modules', timestamps: false });

module.exports = Module;
