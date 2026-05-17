/**
 * Abstract base class for storage services
 * All storage providers must implement these methods
 */
class BaseStorageService {
  /**
   * Upload file to storage
   * @param {String} key - File path/key in storage
   * @param {Buffer|Stream} data - File data
   * @param {Object} options - Additional options (contentType, metadata, etc)
   * @returns {Promise<Object>} - Upload result with URL
   */
  async uploadFile(key, data, options = {}) {
    throw new Error('uploadFile must be implemented');
  }

  /**
   * Download file from storage
   * @param {String} key - File path/key in storage
   * @returns {Promise<Buffer>} - File data
   */
  async downloadFile(key) {
    throw new Error('downloadFile must be implemented');
  }

  /**
   * Delete file from storage
   * @param {String} key - File path/key in storage
   * @returns {Promise<Boolean>} - Success status
   */
  async deleteFile(key) {
    throw new Error('deleteFile must be implemented');
  }

  /**
   * List files in storage bucket/folder
   * @param {String} prefix - Prefix/folder path
   * @param {Object} options - Options (limit, marker, etc)
   * @returns {Promise<Array>} - List of files
   */
  async listFiles(prefix = '', options = {}) {
    throw new Error('listFiles must be implemented');
  }

  /**
   * Check if file exists
   * @param {String} key - File path/key in storage
   * @returns {Promise<Boolean>} - File existence status
   */
  async fileExists(key) {
    throw new Error('fileExists must be implemented');
  }

  /**
   * Get file metadata
   * @param {String} key - File path/key in storage
   * @returns {Promise<Object>} - File metadata (size, type, created_at, etc)
   */
  async getFileMetadata(key) {
    throw new Error('getFileMetadata must be implemented');
  }

  /**
   * Generate download URL
   * @param {String} key - File path/key in storage
   * @param {Object} options - Options (expiration, method, etc)
   * @returns {Promise<String>} - Downloadable URL
   */
  async getDownloadUrl(key, options = {}) {
    throw new Error('getDownloadUrl must be implemented');
  }

  /**
   * Generate upload URL (for direct client uploads)
   * @param {String} key - File path/key in storage
   * @param {Object} options - Options (expiration, contentType, etc)
   * @returns {Promise<String>} - URL for uploading directly
   */
  async getUploadUrl(key, options = {}) {
    throw new Error('getUploadUrl must be implemented');
  }

  /**
   * Copy file within storage
   * @param {String} sourceKey - Source file path
   * @param {String} destinationKey - Destination file path
   * @returns {Promise<Boolean>} - Success status
   */
  async copyFile(sourceKey, destinationKey) {
    throw new Error('copyFile must be implemented');
  }

  /**
   * Move file within storage
   * @param {String} sourceKey - Source file path
   * @param {String} destinationKey - Destination file path
   * @returns {Promise<Boolean>} - Success status
   */
  async moveFile(sourceKey, destinationKey) {
    throw new Error('moveFile must be implemented');
  }
}

module.exports = BaseStorageService;
