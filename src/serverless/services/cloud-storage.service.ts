import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../utils/logger';

export interface UploadOptions {
  bucket?: string;
  contentType?: string;
  isPublic?: boolean;
  metadata?: Record<string, string>;
}

export class CloudStorageService {
  private s3: AWS.S3;
  private defaultBucket: string;

  constructor(region: string = 'us-east-1') {
    this.s3 = new AWS.S3({ region });
    this.defaultBucket = process.env.S3_BUCKET || 'task-management-uploads';
  }

  /**
   * Upload file to cloud storage
   */
  async uploadFile(
    file: Buffer,
    filename: string,
    options: UploadOptions = {}
  ): Promise<{ url: string; key: string }> {
    try {
      const key = `${Date.now()}-${uuidv4()}-${filename}`;
      const bucket = options.bucket || this.defaultBucket;

      const params = {
        Bucket: bucket,
        Key: key,
        Body: file,
        ContentType: options.contentType || 'application/octet-stream',
        ACL: (options.isPublic ? 'public-read' : 'private') as any,
        Metadata: options.metadata || {}
      };

      await this.s3.putObject(params).promise();

      const url = this.getFileUrl(key, bucket);

      logger.info(`File uploaded successfully: ${key}`);

      return { url, key };
    } catch (error: any) {
      logger.error('File upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Download file from cloud storage
   */
  async downloadFile(key: string, bucket?: string): Promise<Buffer> {
    try {
      const bucketName = bucket || this.defaultBucket;

      const params = {
        Bucket: bucketName,
        Key: key
      };

      const data = await this.s3.getObject(params).promise();

      return data.Body as Buffer;
    } catch (error: any) {
      logger.error('File download error:', error);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  /**
   * Delete file from cloud storage
   */
  async deleteFile(key: string, bucket?: string): Promise<void> {
    try {
      const bucketName = bucket || this.defaultBucket;

      const params = {
        Bucket: bucketName,
        Key: key
      };

      await this.s3.deleteObject(params).promise();

      logger.info(`File deleted successfully: ${key}`);
    } catch (error: any) {
      logger.error('File delete error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get signed URL for temporary access
   */
  async getSignedUrl(
    key: string,
    expirationSeconds: number = 3600,
    bucket?: string
  ): Promise<string> {
    try {
      const bucketName = bucket || this.defaultBucket;

      const params = {
        Bucket: bucketName,
        Key: key,
        Expires: expirationSeconds
      };

      const url = await this.s3.getSignedUrlPromise('getObject', params);

      return url;
    } catch (error: any) {
      logger.error('Get signed URL error:', error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * List files in bucket
   */
  async listFiles(prefix: string = '', bucket?: string): Promise<Array<{
    key: string;
    size: number;
    lastModified: Date;
  }>> {
    try {
      const bucketName = bucket || this.defaultBucket;

      const params = {
        Bucket: bucketName,
        Prefix: prefix
      };

      const data = await this.s3.listObjectsV2(params).promise();

      return (data.Contents || []).map(obj => ({
        key: obj.Key!,
        size: obj.Size || 0,
        lastModified: obj.LastModified || new Date()
      }));
    } catch (error: any) {
      logger.error('List files error:', error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  /**
   * Get file URL
   */
  private getFileUrl(key: string, bucket: string): string {
    return `https://${bucket}.s3.amazonaws.com/${key}`;
  }
}
