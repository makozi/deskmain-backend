const AWS = require('aws-sdk');
const BaseStorageService = require('./BaseStorageService');
const logger = require('../../config/logger');

/**
 * AWS S3 Storage Service
 */
class S3StorageService extends BaseStorageService {
  constructor(config = {}) {
    super();
    this.bucket = config.bucket || process.env.AWS_S3_BUCKET;
    this.region = config.region || process.env.AWS_REGION || 'us-east-1';
    this.accessKeyId = config.accessKeyId || process.env.AWS_ACCESS_KEY_ID;
    this.secretAccessKey = config.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY;

    this.s3 = new AWS.S3({
      region: this.region,
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
    });
  }

  /**
   * Upload file to S3
   */
  async uploadFile(key, data, options = {}) {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: options.contentType || 'application/octet-stream',
        Metadata: options.metadata || {},
        ...options.s3Params,
      };

      const result = await this.s3.upload(params).promise();

      logger.info(`File uploaded to S3: ${key}`);

      return {
        key,
        url: result.Location,
        eTag: result.ETag,
        size: data.length,
        uploadedAt: new Date(),
      };
    } catch (error) {
      logger.error(`S3 upload failed for ${key}:`, error);
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  /**
   * Download file from S3
   */
  async downloadFile(key) {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
      };

      const result = await this.s3.getObject(params).promise();

      logger.info(`File downloaded from S3: ${key}`);
      return result.Body;
    } catch (error) {
      logger.error(`S3 download failed for ${key}:`, error);
      throw new Error(`S3 download failed: ${error.message}`);
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key) {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
      };

      await this.s3.deleteObject(params).promise();

      logger.info(`File deleted from S3: ${key}`);
      return true;
    } catch (error) {
      logger.error(`S3 delete failed for ${key}:`, error);
      throw new Error(`S3 delete failed: ${error.message}`);
    }
  }

  /**
   * List files in S3 bucket
   */
  async listFiles(prefix = '', options = {}) {
    try {
      const params = {
        Bucket: this.bucket,
        Prefix: prefix,
        MaxKeys: options.limit || 100,
        Marker: options.marker,
      };

      const result = await this.s3.listObjects(params).promise();

      return (result.Contents || []).map((item) => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
      }));
    } catch (error) {
      logger.error(`S3 list failed for ${prefix}:`, error);
      throw new Error(`S3 list failed: ${error.message}`);
    }
  }

  /**
   * Check if file exists in S3
   */
  async fileExists(key) {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
      };

      await this.s3.headObject(params).promise();
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      logger.error(`S3 head failed for ${key}:`, error);
      throw new Error(`Failed to check file existence: ${error.message}`);
    }
  }

  /**
   * Get file metadata from S3
   */
  async getFileMetadata(key) {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
      };

      const result = await this.s3.headObject(params).promise();

      return {
        key,
        size: result.ContentLength,
        contentType: result.ContentType,
        eTag: result.ETag,
        lastModified: result.LastModified,
        metadata: result.Metadata || {},
      };
    } catch (error) {
      logger.error(`S3 metadata failed for ${key}:`, error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }

  /**
   * Generate signed download URL
   */
  async getDownloadUrl(key, options = {}) {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
        Expires: options.expiration || 3600, // 1 hour default
      };

      const url = await this.s3.getSignedUrlPromise('getObject', params);

      return url;
    } catch (error) {
      logger.error(`S3 download URL failed for ${key}:`, error);
      throw new Error(`Failed to generate download URL: ${error.message}`);
    }
  }

  /**
   * Generate signed upload URL
   */
  async getUploadUrl(key, options = {}) {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
        Expires: options.expiration || 3600, // 1 hour default
        ContentType: options.contentType || 'application/octet-stream',
      };

      const url = await this.s3.getSignedUrlPromise('putObject', params);

      return url;
    } catch (error) {
      logger.error(`S3 upload URL failed for ${key}:`, error);
      throw new Error(`Failed to generate upload URL: ${error.message}`);
    }
  }

  /**
   * Copy file within S3
   */
  async copyFile(sourceKey, destinationKey) {
    try {
      const params = {
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${sourceKey}`,
        Key: destinationKey,
      };

      await this.s3.copyObject(params).promise();

      logger.info(`File copied in S3 from ${sourceKey} to ${destinationKey}`);
      return true;
    } catch (error) {
      logger.error(`S3 copy failed from ${sourceKey} to ${destinationKey}:`, error);
      throw new Error(`S3 copy failed: ${error.message}`);
    }
  }

  /**
   * Move file within S3 (copy + delete)
   */
  async moveFile(sourceKey, destinationKey) {
    try {
      await this.copyFile(sourceKey, destinationKey);
      await this.deleteFile(sourceKey);

      logger.info(`File moved in S3 from ${sourceKey} to ${destinationKey}`);
      return true;
    } catch (error) {
      logger.error(`S3 move failed from ${sourceKey} to ${destinationKey}:`, error);
      throw new Error(`S3 move failed: ${error.message}`);
    }
  }
}

module.exports = S3StorageService;
