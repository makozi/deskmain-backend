const { DataTypes } = require('sequelize');
const db = require('../config/database');

const APILog = db.define('APILog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
  endpoint: { type: DataTypes.STRING(255) },
  method: { type: DataTypes.STRING(10) },
  request_body: { type: DataTypes.TEXT },
  response_status: { type: DataTypes.INTEGER },
  response_time_ms: { type: DataTypes.INTEGER },
  ip_address: { type: DataTypes.INET },
  user_agent: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'api_logs', timestamps: false });

module.exports = APILog;
