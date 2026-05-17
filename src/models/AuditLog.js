const { DataTypes } = require('sequelize');
const db = require('../config/database');

const AuditLog = db.define('AuditLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
  action: { type: DataTypes.STRING(255) },
  entity_type: { type: DataTypes.STRING(100) },
  entity_id: { type: DataTypes.INTEGER },
  old_values: { type: DataTypes.JSONB },
  new_values: { type: DataTypes.JSONB },
  ip_address: { type: DataTypes.INET },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'audit_logs', timestamps: false });

module.exports = AuditLog;
