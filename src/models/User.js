const { DataTypes } = require('sequelize');
const db = require('../config/database');
const bcrypt = require('bcryptjs');

const User = db.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false,
    validate: { isEmail: true },
  },
  password_hash: {
    type: DataTypes.STRING(255),
  },
  first_name: {
    type: DataTypes.STRING(100),
  },
  last_name: {
    type: DataTypes.STRING(100),
  },
  phone: {
    type: DataTypes.STRING(20),
  },
  role: {
    type: DataTypes.ENUM('buyer', 'merchant', 'affiliate', 'super_admin'),
    defaultValue: 'buyer',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  email_verified_at: {
    type: DataTypes.DATE,
  },
  last_login_at: {
    type: DataTypes.DATE,
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
  tableName: 'users',
  timestamps: false,
});

// Hash password before saving
User.beforeCreate(async (user) => {
  if (user.password_hash) {
    user.password_hash = await bcrypt.hash(user.password_hash, 10);
  }
});

// Instance method to verify password
User.prototype.verifyPassword = async function(password) {
  return bcrypt.compare(password, this.password_hash);
};

module.exports = User;
