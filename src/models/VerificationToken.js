const { DataTypes } = require('sequelize');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const VerificationToken = db.define('VerificationToken', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: () => uuidv4(),
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  token: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.ENUM('email_verification', 'password_reset', '2fa_setup'),
    allowNull: false,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  used_at: {
    type: DataTypes.DATE,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'verification_tokens',
  timestamps: false,
});

// Check if token is expired
VerificationToken.prototype.isExpired = function() {
  return new Date() > new Date(this.expires_at);
};

// Check if token is already used
VerificationToken.prototype.isUsed = function() {
  return this.used_at !== null;
};

module.exports = VerificationToken;
