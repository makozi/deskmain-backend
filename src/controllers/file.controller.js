const fileService = require('../services/fileService');
const logger = require('../config/logger');

/**
 * Upload user avatar
 */
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No file provided',
        error_code: 'NO_FILE_PROVIDED',
      });
    }

    const userId = req.user.id;
    const result = await fileService.uploadAvatar(userId, req.file);

    res.status(200).json({
      message: 'Avatar uploaded successfully',
      data: result,
    });
  } catch (error) {
    logger.error('Avatar upload error:', error);
    res.status(400).json({
      message: error.message || 'Avatar upload failed',
      error_code: 'AVATAR_UPLOAD_FAILED',
    });
  }
};

/**
 * Upload product image
 */
const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No file provided',
        error_code: 'NO_FILE_PROVIDED',
      });
    }

    const { productId } = req.params;

    const result = await fileService.uploadProductImage(productId, req.file);

    res.status(200).json({
      message: 'Product image uploaded successfully',
      data: result,
    });
  } catch (error) {
    logger.error('Product image upload error:', error);
    res.status(400).json({
      message: error.message || 'Product image upload failed',
      error_code: 'PRODUCT_IMAGE_UPLOAD_FAILED',
    });
  }
};

/**
 * Upload product file (digital product)
 */
const uploadProductFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No file provided',
        error_code: 'NO_FILE_PROVIDED',
      });
    }

    const { productId } = req.params;

    const result = await fileService.uploadProductFile(productId, req.file);

    res.status(200).json({
      message: 'Product file uploaded successfully',
      data: result,
    });
  } catch (error) {
    logger.error('Product file upload error:', error);
    res.status(400).json({
      message: error.message || 'Product file upload failed',
      error_code: 'PRODUCT_FILE_UPLOAD_FAILED',
    });
  }
};

/**
 * Upload course material
 */
const uploadCourseMaterial = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No file provided',
        error_code: 'NO_FILE_PROVIDED',
      });
    }

    const { courseId } = req.params;

    const result = await fileService.uploadCourseMaterial(courseId, req.file);

    res.status(200).json({
      message: 'Course material uploaded successfully',
      data: result,
    });
  } catch (error) {
    logger.error('Course material upload error:', error);
    res.status(400).json({
      message: error.message || 'Course material upload failed',
      error_code: 'COURSE_MATERIAL_UPLOAD_FAILED',
    });
  }
};

/**
 * Download file
 */
const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const fileData = await fileService.downloadFile(fileId);

    res.download(fileData.filepath, fileData.filename, (err) => {
      if (err) {
        logger.error('File download error:', err);
      }
    });
  } catch (error) {
    logger.error('File download error:', error);
    res.status(404).json({
      message: error.message || 'File download failed',
      error_code: 'FILE_DOWNLOAD_FAILED',
    });
  }
};

/**
 * Get file details
 */
const getFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await fileService.getFile(fileId);

    res.status(200).json({
      message: 'File retrieved successfully',
      data: file,
    });
  } catch (error) {
    logger.error('Get file error:', error);
    res.status(404).json({
      message: error.message || 'File not found',
      error_code: 'FILE_NOT_FOUND',
    });
  }
};

/**
 * Get user avatar
 */
const getUserAvatar = async (req, res) => {
  try {
    const { userId } = req.params;

    const avatar = await fileService.getUserAvatar(userId);

    if (!avatar) {
      return res.status(404).json({
        message: 'Avatar not found',
        error_code: 'AVATAR_NOT_FOUND',
      });
    }

    res.status(200).json({
      message: 'Avatar retrieved successfully',
      data: avatar,
    });
  } catch (error) {
    logger.error('Get user avatar error:', error);
    res.status(500).json({
      message: error.message || 'Failed to retrieve avatar',
      error_code: 'GET_AVATAR_FAILED',
    });
  }
};

/**
 * Delete file
 */
const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const success = await fileService.deleteFile(fileId);

    res.status(200).json({
      message: 'File deleted successfully',
      data: { success },
    });
  } catch (error) {
    logger.error('File delete error:', error);
    res.status(400).json({
      message: error.message || 'File deletion failed',
      error_code: 'FILE_DELETE_FAILED',
    });
  }
};

/**
 * Get product images
 */
const getProductImages = async (req, res) => {
  try {
    const { productId } = req.params;

    const images = await fileService.getProductImages(productId);

    res.status(200).json({
      message: 'Product images retrieved successfully',
      data: images,
    });
  } catch (error) {
    logger.error('Get product images error:', error);
    res.status(500).json({
      message: error.message || 'Failed to retrieve product images',
      error_code: 'GET_PRODUCT_IMAGES_FAILED',
    });
  }
};

/**
 * Get product files
 */
const getProductFiles = async (req, res) => {
  try {
    const { productId } = req.params;

    const files = await fileService.getProductFiles(productId);

    res.status(200).json({
      message: 'Product files retrieved successfully',
      data: files,
    });
  } catch (error) {
    logger.error('Get product files error:', error);
    res.status(500).json({
      message: error.message || 'Failed to retrieve product files',
      error_code: 'GET_PRODUCT_FILES_FAILED',
    });
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
};
