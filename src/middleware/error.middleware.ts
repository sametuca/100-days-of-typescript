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
  
  // Hatayı logla
  
  // ApiError ise (bizim custom error)
  if (err instanceof ApiError) {
    // Operational error = Beklenen hata (uyarı seviyesi)
    if (err.isOperational) {
      logger.warn(`[${req.method}] ${req.path} - ${err.message}`, {
        statusCode: err.statusCode,
        errorCode: err.errorCode,
        stack: err.stack
      });
    } else {
      // Non-operational error = Beklenmeyen hata (error seviyesi)
      logger.error(`[${req.method}] ${req.path} - ${err.message}`, {
        statusCode: err.statusCode,
        errorCode: err.errorCode,
        stack: err.stack
      });
    }
  } else {
    // Normal Error (beklenmeyen)
    logger.error(`[${req.method}] ${req.path} - ${err.message}`, {
      stack: err.stack
    });
  }
  
  // Hata response'u hazırla
  
  // Default error values
  let statusCode = 500;
  let message = 'Sunucu hatası';
  let errorCode: string | undefined;
  let errors: any;
  
  // ApiError ise değerleri al
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.errorCode;
    
    // ValidationError ise errors field'ı ekle
    if ('errors' in err) {
      errors = (err as any).errors;
    }
  }
  
  // Hata cevabını gönder
  
  // Development vs Production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Error response objesi
  const errorResponse: any = {
    success: false,
    error: {
      message,
      code: errorCode,
      statusCode
    }
  };
  
  // Validation errors varsa ekle
  if (errors) {
    errorResponse.error.errors = errors;
  }
  
  // Development'taysa stack trace ekle
  if (isDevelopment) {
    errorResponse.error.stack = err.stack;
  }
  
  // Response gönder
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

// Async function'ları wrap eder, hata olursa yakalar

// AsyncFunction = Async function tipi
type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

// catchAsync = Async function'u wrap et
export const catchAsync = (fn: AsyncFunction) => {
  // Yeni bir function döndür
  return (req: Request, res: Response, next: NextFunction) => {
    // fn'i çalıştır, promise döner
    // .catch(next) = Hata olursa next(error) çağır
    // next(error) = Error middleware'e git
    fn(req, res, next).catch(next);
  };
};