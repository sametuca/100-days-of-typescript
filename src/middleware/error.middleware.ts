import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';
import logger from '../utils/logger';

// Express'in error handling middleware'i
// 4 parametre = Error handler middleware

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  
  if (err instanceof ApiError) {
    if (err.isOperational) {
      logger.warn(`[${req.method}] ${req.path} - ${err.message}`, {
        statusCode: err.statusCode,
        errorCode: err.errorCode,
        stack: err.stack
      });
    } else {
      logger.error(`[${req.method}] ${req.path} - ${err.message}`, {
        statusCode: err.statusCode,
        errorCode: err.errorCode,
        stack: err.stack
      });
    }
  } else {
    logger.error(`[${req.method}] ${req.path} - ${err.message}`, {
      stack: err.stack
    });
  }
  
  let statusCode = 500;
  let message = 'Sunucu hatası';
  let errorCode: string | undefined;
  let errors: any;
  
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.errorCode;
    
    if ('errors' in err) {
      errors = (err as any).errors;
    }
  }
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const errorResponse: any = {
    success: false,
    error: {
      message,
      code: errorCode,
      statusCode
    }
  };
  
  if (errors) {
    errorResponse.error.errors = errors;
  }
  
  if (isDevelopment) {
    errorResponse.error.stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  
  // 404 hatası logla
  logger.warn(`Route not found: [${req.method}] ${req.originalUrl}`);
  
  // 404 response gönder
  res.status(404).json({
    success: false,
    error: {
      message: 'Route bulunamadı',
      code: 'ROUTE_NOT_FOUND',
      statusCode: 404,
      path: req.originalUrl
    }
  });
};


type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const catchAsync = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};