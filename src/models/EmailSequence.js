const { DataTypes } = require('sequelize');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const EmailSequence = db.define('EmailSequence', {
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
  sequence_type: {
    type: DataTypes.ENUM('welcome', 'onboarding', 're_engagement', 'abandoned_cart', 'post_purchase', 'custom'),
    allowNull: false,
  },
  trigger_event: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'paused', 'archived'),
    defaultValue: 'active',
  },
  entry_criteria: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  exit_criteria: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  max_recipients_per_day: {
    type: DataTypes.INTEGER,
    allowNull: true,
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
  tableName: 'email_sequences',
  timestamps: false,
});

module.exports = EmailSequence;
