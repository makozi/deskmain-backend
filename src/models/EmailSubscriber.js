const { DataTypes } = require('sequelize');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const EmailSubscriber = db.define('EmailSubscriber', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: () => uuidv4(),
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('subscribed', 'unsubscribed', 'bounced', 'invalid'),
    defaultValue: 'subscribed',
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {
      email_frequency: 'weekly',
      newsletter: true,
      promotional: true,
      product_updates: true,
    },
  },
  subscription_source: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  last_engagement_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  bounce_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  complaint_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
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
  tableName: 'email_subscribers',
  timestamps: false,
});

module.exports = EmailSubscriber;
