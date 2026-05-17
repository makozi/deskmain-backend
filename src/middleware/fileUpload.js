const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const logger = require('../config/logger');

/**
 * Configure storage for different file types
 */
const storageConfigs = {
  // Product files (downloads, digital products)
  products: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = 'uploads/products';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = `${crypto.randomBytes(12).toString('hex')}${ext}`;
      cb(null, name);
    },
  }),

  // KYC documents (verification)
  kyc: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = 'uploads/kyc';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = `${crypto.randomBytes(12).toString('hex')}${ext}`;
      cb(null, name);
    },
  }),

  // Avatar/Profile images
  avatars: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = 'uploads/avatars';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = `avatar-${req.user?.id}-${Date.now()}${ext}`;
      cb(null, name);
    },
  }),

  // Course/Lesson materials
  courses: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = 'uploads/courses';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = `${crypto.randomBytes(12).toString('hex')}${ext}`;
      cb(null, name);
    },
  }),
};

/**
 * File type validators
 */
const fileValidators = {
  // Documents
  documents: {
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },

  // Images
  images: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },

  // Videos
  videos: {
    mimeTypes: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'],
    maxSize: 500 * 1024 * 1024, // 500MB
  },

  // Audio
  audio: {
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
    maxSize: 50 * 1024 * 1024, // 50MB
  },

  // Archives
  archives: {
    mimeTypes: ['application/zip', 'application/x-rar-compressed', 'application/x-tar'],
    maxSize: 500 * 1024 * 1024, // 500MB
  },
};

/**
 * Create multer upload handler with validation
 * @param {String} fileType - Type of files (products, kyc, avatars, courses)
 * @param {String} validatorType - Validator type (documents, images, videos, audio, archives)
 * @param {Number} maxFiles - Maximum number of files
 * @returns {Object} - Multer middleware
 */
function createUploadHandler(fileType, validatorType, maxFiles = 1) {
  const storage = storageConfigs[fileType];
  const validator = fileValidators[validatorType];

  if (!storage) {
    throw new Error(`Unknown file type: ${fileType}`);
  }

  if (!validator) {
    throw new Error(`Unknown validator type: ${validatorType}`);
  }

  const upload = multer({
    storage,
    limits: {
      fileSize: validator.maxSize,
      files: maxFiles,
    },
    fileFilter: (req, file, cb) => {
      // Validate MIME type
      if (!validator.mimeTypes.includes(file.mimetype)) {
        const error = new Error(`Invalid file type. Allowed: ${validator.mimeTypes.join(', ')}`);
        error.code = 'INVALID_FILE_TYPE';
        return cb(error);
      }

      // Validate file size
      if (file.size > validator.maxSize) {
        const error = new Error(`File too large. Maximum size: ${validator.maxSize / 1024 / 1024}MB`);
        error.code = 'FILE_TOO_LARGE';
        return cb(error);
      }

      cb(null, true);
    },
  });

  return upload;
}

/**
 * Error handler for file uploads
 * @param {Error} error - Multer error
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
function handleUploadError(error, req, res, next) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'File size exceeds maximum limit',
        },
      });
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: {
          code: 'TOO_MANY_FILES',
          message: 'Too many files uploaded',
        },
      });
    }

    logger.error('Multer error:', error);
    return res.status(400).json({
      error: {
        code: 'UPLOAD_ERROR',
        message: error.message,
      },
    });
  }

  if (error.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      error: {
        code: 'INVALID_FILE_TYPE',
        message: error.message,
      },
    });
  }

  if (error.code === 'FILE_TOO_LARGE') {
    return res.status(400).json({
      error: {
        code: 'FILE_TOO_LARGE',
        message: error.message,
      },
    });
  }

  // Unknown error
  logger.error('File upload error:', error);
  res.status(500).json({
    error: {
      code: 'SERVER_ERROR',
      message: 'File upload failed',
    },
  });
}

/**
 * Delete uploaded file
 * @param {String} filePath - Path to file
 */
async function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`File deleted: ${filePath}`);
    }
  } catch (error) {
    logger.error(`Failed to delete file ${filePath}:`, error);
  }
}

module.exports = {
  createUploadHandler,
  handleUploadError,
  deleteFile,
  fileValidators,
  storageConfigs,
};
