const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Lesson = db.define('Lesson', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  module_id: { type: DataTypes.INTEGER, references: { model: 'modules', key: 'id' } },
  title: { type: DataTypes.STRING(255) },
  content_type: { type: DataTypes.STRING(50) },
  content_url: { type: DataTypes.STRING(500) },
  content_text: { type: DataTypes.TEXT },
  duration_minutes: { type: DataTypes.INTEGER },
  sort_order: { type: DataTypes.INTEGER },
  is_free_preview: { type: DataTypes.BOOLEAN, defaultValue: false },
  drip_days: { type: DataTypes.INTEGER },
}, { tableName: 'lessons', timestamps: false });

module.exports = Lesson;
