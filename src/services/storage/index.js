const LocalStorageService = require('./LocalStorageService');
const S3StorageService = require('./S3StorageService');

/**
 * Storage Service Factory
 * Creates and returns appropriate storage service instance
 */
class StorageServiceFactory {
  static services = {
    local: LocalStorageService,
    s3: S3StorageService,
  };

  /**
   * Get storage service instance
   * @param {String} type - Storage type (local, s3)
   * @param {Object} config - Service configuration
   * @returns {Object} - Storage service instance
   */
  static getService(type = 'local', config = {}) {
    const storageType = (type || process.env.STORAGE_TYPE || 'local').toLowerCase();
    const ServiceClass = this.services[storageType];

    if (!ServiceClass) {
      throw new Error(
        `Unknown storage type: ${storageType}. Available: ${Object.keys(this.services).join(', ')}`
      );
    }

    return new ServiceClass(config);
  }

  /**
   * Register custom storage service
   * @param {String} name - Service name
   * @param {Class} ServiceClass - Service class extending BaseStorageService
   */
  static registerService(name, ServiceClass) {
    this.services[name.toLowerCase()] = ServiceClass;
  }

  /**
   * Get list of supported storage types
   * @returns {Array<String>} - Array of supported types
   */
  static getSupportedTypes() {
    return Object.keys(this.services);
  }
}

// Default instance
const defaultStorage = StorageServiceFactory.getService();

module.exports = {
  StorageServiceFactory,
  defaultStorage,
};
