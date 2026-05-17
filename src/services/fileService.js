const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { File } = require('../models');
const logger = require('../config/logger');

// File storage paths
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const AVATAR_DIR = path.join(UPLOAD_DIR, 'avatars');
const PRODUCT_DIR = path.join(UPLOAD_DIR, 'products');
const COURSE_DIR = path.join(UPLOAD_DIR, 'courses');
const TEMP_DIR = path.join(UPLOAD_DIR, 'temp');

// Ensure directories exist
const ensureDirectories = () => {
  [UPLOAD_DIR, AVATAR_DIR, PRODUCT_DIR, COURSE_DIR, TEMP_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

ensureDirectories();

/**
 * Get directory path based on file category
 */
const getDirectoryForCategory = (category) => {
  const directories = {
    avatar: AVATAR_DIR,
    product_image: PRODUCT_DIR,
    product_file: PRODUCT_DIR,
    course_material: COURSE_DIR,
    document: UPLOAD_DIR,
  };
  return directories[category] || UPLOAD_DIR;
};

/**
 * Validate file upload
 */
const validateFile = (file, allowedMimeTypes, maxSize) => {
  const errors = [];

  if (!file) {
    errors.push('No file provided');
    return errors;
  }

  if (file.size > maxSize) {
    errors.push(`File size exceeds maximum of ${maxSize / 1024 / 1024}MB`);
  }

  if (allowedMimeTypes && !allowedMimeTypes.includes(file.mimetype)) {
    errors.push(`File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`);
  }

  return errors;
};

/**
 * Upload avatar with resizing
 */
const uploadAvatar = async (userId, file) => {
  try {
    const errors = validateFile(
      file,
      ['image/jpeg', 'image/png', 'image/webp'],
      5 * 1024 * 1024 // 5MB max
    );

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const filename = `${userId}-${uuidv4()}.webp`;
    const filepath = path.join(AVATAR_DIR, filename);
    const relativePath = `uploads/avatars/${filename}`;

    // Resize and convert to WebP
    await sharp(file.buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 80 })
      .toFile(filepath);

    // Get file stats
    const stats = fs.statSync(filepath);

    // Save to database
    const fileRecord = await File.create({
      user_id: userId,
      filename: filename,
      original_filename: file.originalname,
      file_type: 'image',
      mime_type: 'image/webp',
      file_size: stats.size,
      file_path: relativePath,
      category: 'avatar',
      is_public: true,
      metadata: {
        width: 400,
        height: 400,
        originalMimetype: file.mimetype,
      },
    });

    logger.info(`Avatar uploaded for user ${userId}: ${filename}`);

    return {
      id: fileRecord.id,
      url: relativePath,
      size: stats.size,
    };
  } catch (error) {
    logger.error('Avatar upload error:', error);
    throw error;
  }
};

/**
 * Upload product image with resizing (multiple sizes)
 */
const uploadProductImage = async (productId, file) => {
  try {
    const errors = validateFile(
      file,
      ['image/jpeg', 'image/png', 'image/webp'],
      10 * 1024 * 1024 // 10MB max
    );

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const baseFilename = `${productId}-${uuidv4()}`;
    const images = {};

    // Generate multiple sizes
    const sizes = [
      { name: 'thumbnail', width: 200, height: 200 },
      { name: 'medium', width: 600, height: 600 },
      { name: 'large', width: 1200, height: 1200 },
    ];

    for (const size of sizes) {
      const filename = `${baseFilename}-${size.name}.webp`;
      const filepath = path.join(PRODUCT_DIR, filename);
      const relativePath = `uploads/products/${filename}`;

      await sharp(file.buffer)
        .resize(size.width, size.height, {
          fit: 'cover',
          position: 'center',
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toFile(filepath);

      const stats = fs.statSync(filepath);
      images[size.name] = {
        filename: filename,
        url: relativePath,
        size: stats.size,
        width: size.width,
        height: size.height,
      };
    }

    // Save original info to database (store with medium image record)
    const fileRecord = await File.create({
      product_id: productId,
      filename: baseFilename,
      original_filename: file.originalname,
      file_type: 'image',
      mime_type: 'image/webp',
      file_size: images.medium.size,
      file_path: images.medium.url,
      category: 'product_image',
      is_public: true,
      metadata: {
        images: images,
        originalMimetype: file.mimetype,
      },
    });

    logger.info(`Product image uploaded for product ${productId}: ${baseFilename}`);

    return {
      id: fileRecord.id,
      images: images,
    };
  } catch (error) {
    logger.error('Product image upload error:', error);
    throw error;
  }
};

/**
 * Upload product file (digital product)
 */
const uploadProductFile = async (productId, file) => {
  try {
    const maxSize = 1 * 1024 * 1024 * 1024; // 1GB max

    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum of ${maxSize / 1024 / 1024 / 1024}GB`);
    }

    const filename = `${productId}-${uuidv4()}-${file.originalname}`;
    const filepath = path.join(PRODUCT_DIR, filename);
    const relativePath = `uploads/products/${filename}`;

    // Save file
    fs.writeFileSync(filepath, file.buffer);

    const stats = fs.statSync(filepath);

    // Save to database
    const fileRecord = await File.create({
      product_id: productId,
      filename: filename,
      original_filename: file.originalname,
      file_type: 'document',
      mime_type: file.mimetype,
      file_size: stats.size,
      file_path: relativePath,
      category: 'product_file',
      is_public: false,
      metadata: {
        uploadedAt: new Date(),
      },
    });

    logger.info(`Product file uploaded for product ${productId}: ${filename}`);

    return {
      id: fileRecord.id,
      url: relativePath,
      size: stats.size,
      filename: file.originalname,
    };
  } catch (error) {
    logger.error('Product file upload error:', error);
    throw error;
  }
};

/**
 * Upload course material
 */
const uploadCourseMaterial = async (courseId, file) => {
  try {
    const maxSize = 500 * 1024 * 1024; // 500MB max

    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum of ${maxSize / 1024 / 1024}MB`);
    }

    const filename = `${courseId}-${uuidv4()}-${file.originalname}`;
    const filepath = path.join(COURSE_DIR, filename);
    const relativePath = `uploads/courses/${filename}`;

    // Save file
    fs.writeFileSync(filepath, file.buffer);

    const stats = fs.statSync(filepath);

    // Save to database
    const fileRecord = await File.create({
      course_id: courseId,
      filename: filename,
      original_filename: file.originalname,
      file_type: path.extname(file.originalname).substring(1),
      mime_type: file.mimetype,
      file_size: stats.size,
      file_path: relativePath,
      category: 'course_material',
      is_public: false,
    });

    logger.info(`Course material uploaded for course ${courseId}: ${filename}`);

    return {
      id: fileRecord.id,
      url: relativePath,
      size: stats.size,
      filename: file.originalname,
    };
  } catch (error) {
    logger.error('Course material upload error:', error);
    throw error;
  }
};

/**
 * Download file
 */
const downloadFile = async (fileId) => {
  try {
    const fileRecord = await File.findByPk(fileId);

    if (!fileRecord) {
      throw new Error('File not found');
    }

    const filepath = path.join(process.cwd(), fileRecord.file_path);

    if (!fs.existsSync(filepath)) {
      throw new Error('File not found on disk');
    }

    // Increment download count
    await fileRecord.increment('download_count');

    return {
      filepath: filepath,
      filename: fileRecord.original_filename,
      mimetype: fileRecord.mime_type,
    };
  } catch (error) {
    logger.error('File download error:', error);
    throw error;
  }
};

/**
 * Get file by ID
 */
const getFile = async (fileId) => {
  try {
    const fileRecord = await File.findByPk(fileId);

    if (!fileRecord) {
      throw new Error('File not found');
    }

    return fileRecord;
  } catch (error) {
    logger.error('Get file error:', error);
    throw error;
  }
};

/**
 * Get user's avatar
 */
const getUserAvatar = async (userId) => {
  try {
    const fileRecord = await File.findOne({
      where: {
        user_id: userId,
        category: 'avatar',
      },
      order: [['created_at', 'DESC']],
    });

    return fileRecord;
  } catch (error) {
    logger.error('Get user avatar error:', error);
    throw error;
  }
};

/**
 * Delete file
 */
const deleteFile = async (fileId) => {
  try {
    const fileRecord = await File.findByPk(fileId);

    if (!fileRecord) {
      throw new Error('File not found');
    }

    const filepath = path.join(process.cwd(), fileRecord.file_path);

    // Delete from disk
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    // Delete related image sizes if product image
    if (fileRecord.category === 'product_image' && fileRecord.metadata?.images) {
      for (const [, imageData] of Object.entries(fileRecord.metadata.images)) {
        const imagePath = path.join(process.cwd(), imageData.url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }

    // Delete from database
    await fileRecord.destroy();

    logger.info(`File deleted: ${fileId}`);

    return true;
  } catch (error) {
    logger.error('File delete error:', error);
    throw error;
  }
};

/**
 * Get product images
 */
const getProductImages = async (productId) => {
  try {
    const images = await File.findAll({
      where: {
        product_id: productId,
        category: 'product_image',
      },
      order: [['created_at', 'DESC']],
    });

    return images;
  } catch (error) {
    logger.error('Get product images error:', error);
    throw error;
  }
};

/**
 * Get product files
 */
const getProductFiles = async (productId) => {
  try {
    const files = await File.findAll({
      where: {
        product_id: productId,
        category: 'product_file',
      },
      order: [['created_at', 'DESC']],
    });

    return files;
  } catch (error) {
    logger.error('Get product files error:', error);
    throw error;
  }
};

module.exports = {
  uploadAvatar,
  uploadProductImage,
  uploadProductFile,
  uploadCourseMaterial,
  downloadFile,
  getFile,
  getUserAvatar,
  deleteFile,
  getProductImages,
  getProductFiles,
  ensureDirectories,
};
