// Day 28: Cache Middleware

import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache.service';

export const cacheMiddleware = (ttl: number = 300) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      next();
      return;
    }

    const cacheKey = `${req.originalUrl}_${req.user?.userId || 'anonymous'}`;
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
      res.json(cachedData);
      return;
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data: any) {
      if (res.statusCode === 200) {
        cacheService.set(cacheKey, data, ttl);
      }
      return originalJson.call(this, data);
    };

    next();
  };
};

// Cache invalidation middleware
export const invalidateCache = (patterns: string[]) => {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    patterns.forEach(pattern => {
      cacheService.deletePattern(pattern);
    });
    next();
  };
};