const { DataTypes } = require('sequelize');
const db = require('../config/database');

const ProductFile = db.define('ProductFile', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.INTEGER, references: { model: 'products', key: 'id' } },
  file_name: { type: DataTypes.STRING(255) },
  file_path: { type: DataTypes.STRING(500), allowNull: false },
  file_size: { type: DataTypes.BIGINT },
  mime_type: { type: DataTypes.STRING(100) },
  download_limit: { type: DataTypes.INTEGER },
  is_main_download: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'product_files', timestamps: false });

module.exports = ProductFile;
