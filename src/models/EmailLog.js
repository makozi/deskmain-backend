const { DataTypes } = require('sequelize');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const EmailLog = db.define('EmailLog', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: () => uuidv4(),
  },
  campaign_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'email_campaigns',
      key: 'id',
    },
  },
  campaign_subscriber_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'email_campaign_subscribers',
      key: 'id',
    },
  },
  subscriber_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'email_subscribers',
      key: 'id',
    },
  },
  recipient_email: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  message_id: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'failed'),
    defaultValue: 'queued',
  },
  event_type: {
    type: DataTypes.ENUM('send', 'delivery', 'open', 'click', 'bounce', 'complaint', 'unsubscribe'),
    allowNull: false,
  },
  event_data: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  sendgrid_response: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'email_logs',
  timestamps: false,
});

module.exports = EmailLog;
