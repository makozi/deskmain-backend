const { DataTypes } = require('sequelize');
const db = require('../config/database');

const KYCDocument = db.define('KYCDocument', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  merchant_id: { type: DataTypes.INTEGER, references: { model: 'merchants', key: 'id' } },
  document_type: { type: DataTypes.STRING(50) },
  file_path: { type: DataTypes.STRING(500), allowNull: false },
  file_name: { type: DataTypes.STRING(255) },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
  rejection_reason: { type: DataTypes.TEXT },
  verified_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
  verified_at: { type: DataTypes.DATE },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'kyc_documents', timestamps: false });

module.exports = KYCDocument;
