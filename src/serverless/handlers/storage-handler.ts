import { APIGatewayProxyHandler } from 'aws-lambda';
import { CloudStorageService } from '../services/cloud-storage.service';
import logger from '../../utils/logger';

const storageService = new CloudStorageService();

/**
 * Upload file handler
 */
export const uploadFileHandler: APIGatewayProxyHandler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Request body is required' })
      };
    }

    const { filename, content, contentType } = JSON.parse(event.body);

    if (!filename || !content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Filename and content are required' })
      };
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(content, 'base64');

    const { url, key } = await storageService.uploadFile(buffer, filename, {
      contentType: contentType || 'application/octet-stream'
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        url,
        key,
        filename
      })
    };
  } catch (error: any) {
    logger.error('File upload error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

/**
 * Get signed URL handler
 */
export const getSignedUrlHandler: APIGatewayProxyHandler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const key = event.queryStringParameters?.key;
    const expirationSeconds = parseInt(event.queryStringParameters?.expiration || '3600');

    if (!key) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'File key is required' })
      };
    }

    const signedUrl = await storageService.getSignedUrl(key, expirationSeconds);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: signedUrl,
        expiresIn: expirationSeconds
      })
    };
  } catch (error: any) {
    logger.error('Get signed URL error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

/**
 * Delete file handler
 */
export const deleteFileHandler: APIGatewayProxyHandler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const key = event.pathParameters?.key;

    if (!key) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'File key is required' })
      };
    }

    await storageService.deleteFile(key);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'File deleted successfully'
      })
    };
  } catch (error: any) {
    logger.error('Delete file error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
