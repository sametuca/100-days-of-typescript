import rateLimit from 'express-rate-limit';
import config from '../config/env';

export const generalLimiter = rateLimit({
  windowMs: config.security.rateLimit.windowMs,
  max: config.security.rateLimit.max,
  message: {
    success: false,
    error: {
      message: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
        code: 'RATE_LIMIT_EXCEEDED',
        statusCode: 429
      }
    });
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: false,
  message: {
    success: false,
    error: {
      message: 'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      statusCode: 429
    }
  },
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        statusCode: 429
      }
    });
  }
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: {
    success: false,
    error: {
      message: 'API rate limit aşıldı. Dakikada maksimum 60 istek.',
      code: 'API_RATE_LIMIT_EXCEEDED',
      statusCode: 429
    }
  }
});

export const createTaskLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: {
      message: 'Saatte maksimum 20 task oluşturabilirsiniz.',
      code: 'CREATE_TASK_LIMIT_EXCEEDED',
      statusCode: 429
    }
  }
});