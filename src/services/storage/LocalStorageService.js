const fs = require('fs').promises;
const path = require('path');
const BaseStorageService = require('./BaseStorageService');
const logger = require('../../config/logger');

/**
 * Local File System Storage Service
 */
class LocalStorageService extends BaseStorageService {
  constructor(basePath = 'uploads') {
    super();
    this.basePath = basePath;
  }

  /**
   * Get full file path
   * @private
   */
  getFilePath(key) {
    return path.join(this.basePath, key);
  }

  /**
   * Ensure directory exists
   * @private
   */
  async ensureDir(dir) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      logger.error(`Failed to create directory ${dir}:`, error);
      throw error;
    }
  }

  /**
   * Upload file
   */
  async uploadFile(key, data, options = {}) {
    try {
      const filePath = this.getFilePath(key);
      const dir = path.dirname(filePath);

      await this.ensureDir(dir);
      await fs.writeFile(filePath, data);

      logger.info(`File uploaded: ${key}`);

      return {
        key,
        path: filePath,
        url: `/uploads/${key}`,
        size: Buffer.isBuffer(data) ? data.length : data.length,
        uploadedAt: new Date(),
      };
    } catch (error) {
      logger.error(`Upload failed for ${key}:`, error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Download file
   */
  async downloadFile(key) {
    try {
      const filePath = this.getFilePath(key);
      const data = await fs.readFile(filePath);

      logger.info(`File downloaded: ${key}`);
      return data;
    } catch (error) {
      logger.error(`Download failed for ${key}:`, error);
      throw new Error(`File download failed: ${error.message}`);
    }
  }

  /**
   * Delete file
   */
  async deleteFile(key) {
    try {
      const filePath = this.getFilePath(key);
      await fs.unlink(filePath);

      logger.info(`File deleted: ${key}`);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false; // File doesn't exist
      }
      logger.error(`Delete failed for ${key}:`, error);
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  /**
   * List files
   */
  async listFiles(prefix = '', options = {}) {
    try {
      const dir = this.getFilePath(prefix);
      const files = await fs.readdir(dir, { recursive: true });

      return files.map((file) => ({
        key: path.join(prefix, file),
        name: path.basename(file),
      }));
    } catch (error) {
      if (error.code === 'ENOENT') {
        return []; // Directory doesn't exist
      }
      logger.error(`List files failed for ${prefix}:`, error);
      throw new Error(`List files failed: ${error.message}`);
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(key) {
    try {
      const filePath = this.getFilePath(key);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key) {
    try {
      const filePath = this.getFilePath(key);
      const stats = await fs.stat(filePath);

      return {
        key,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
      };
    } catch (error) {
      logger.error(`Get metadata failed for ${key}:`, error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }

  /**
   * Generate download URL (for local storage, just returns file path)
   */
  async getDownloadUrl(key, options = {}) {
    // For local storage, return a relative URL that can be served
    return `/uploads/${key}`;
  }

  /**
   * Generate upload URL (local storage doesn't support direct uploads)
   */
  async getUploadUrl(key, options = {}) {
    throw new Error('Direct uploads not supported for local storage');
  }

  /**
   * Copy file
   */
  async copyFile(sourceKey, destinationKey) {
    try {
      const sourcePath = this.getFilePath(sourceKey);
      const destPath = this.getFilePath(destinationKey);
      const destDir = path.dirname(destPath);

      await this.ensureDir(destDir);
      await fs.copyFile(sourcePath, destPath);

      logger.info(`File copied from ${sourceKey} to ${destinationKey}`);
      return true;
    } catch (error) {
      logger.error(`Copy failed from ${sourceKey} to ${destinationKey}:`, error);
      throw new Error(`File copy failed: ${error.message}`);
    }
  }

  /**
   * Move file
   */
  async moveFile(sourceKey, destinationKey) {
    try {
      const sourcePath = this.getFilePath(sourceKey);
      const destPath = this.getFilePath(destinationKey);
      const destDir = path.dirname(destPath);

      await this.ensureDir(destDir);
      await fs.rename(sourcePath, destPath);

      logger.info(`File moved from ${sourceKey} to ${destinationKey}`);
      return true;
    } catch (error) {
      logger.error(`Move failed from ${sourceKey} to ${destinationKey}:`, error);
      throw new Error(`File move failed: ${error.message}`);
    }
  }
}

module.exports = LocalStorageService;
