const { DataTypes } = require('sequelize');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const File = db.define('File', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: () => uuidv4(),
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'products',
      key: 'id',
    },
  },
  course_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'courses',
      key: 'id',
    },
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  original_filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  file_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  mime_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('avatar', 'product_image', 'product_file', 'course_material', 'document'),
    allowNull: false,
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  download_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
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
  tableName: 'files',
  timestamps: false,
});

module.exports = File;
