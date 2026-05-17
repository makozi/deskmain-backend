const { DataTypes } = require('sequelize');
const db = require('../config/database');

const EmailCampaign = db.define('EmailCampaign', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  merchant_id: { type: DataTypes.INTEGER, references: { model: 'merchants', key: 'id' } },
  name: { type: DataTypes.STRING(255) },
  subject: { type: DataTypes.STRING(255) },
  content: { type: DataTypes.TEXT },
  audience_segment: { type: DataTypes.JSONB },
  sent_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  open_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  click_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.STRING(50) },
  scheduled_for: { type: DataTypes.DATE },
  sent_at: { type: DataTypes.DATE },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'email_campaigns', timestamps: false });

module.exports = EmailCampaign;
