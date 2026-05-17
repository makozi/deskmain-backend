const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Setting = db.define('Setting', {
  key: { type: DataTypes.STRING(255), primaryKey: true },
  value: { type: DataTypes.JSONB },
  description: { type: DataTypes.TEXT },
  updated_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, onUpdate: DataTypes.NOW },
}, { tableName: 'settings', timestamps: false });

module.exports = Setting;
