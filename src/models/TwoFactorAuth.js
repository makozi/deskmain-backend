const { DataTypes } = require('sequelize');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const TwoFactorAuth = db.define('TwoFactorAuth', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: () => uuidv4(),
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  method: {
    type: DataTypes.ENUM('email', 'sms', 'authenticator'),
    allowNull: false,
  },
  secret_key: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  is_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verified_at: {
    type: DataTypes.DATE,
  },
  backup_codes: {
    type: DataTypes.JSON,
    defaultValue: [],
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
  tableName: 'two_factor_auths',
  timestamps: false,
});

module.exports = TwoFactorAuth;
