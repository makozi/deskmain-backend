const { DataTypes } = require('sequelize');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const EmailCampaign = db.define('EmailCampaign', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: () => uuidv4(),
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  template_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'email_templates',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('draft', 'scheduled', 'in_progress', 'completed', 'paused', 'cancelled'),
    defaultValue: 'draft',
  },
  campaign_type: {
    type: DataTypes.ENUM('newsletter', 'promotional', 'transactional', 'announcement', 're_engagement'),
    allowNull: false,
  },
  subject_line: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  preview_text: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  from_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  from_email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  reply_to: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  scheduled_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  total_recipients: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  sent_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  delivered_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  opened_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  clicked_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  unsubscribed_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  bounced_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  complained_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  estimated_open_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  estimated_click_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  variables: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW,
  },
}, {
  tableName: 'email_campaigns',
  timestamps: false,
});

module.exports = EmailCampaign;
