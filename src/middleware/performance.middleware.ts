// Day 26: Performance Tracking Middleware

import { Request, Response, NextFunction } from 'express';
import { metricsService } from '../services/metrics.service';

export const performanceMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // Track request count
  metricsService.incrementRequestCount(req.method, req.route?.path || req.path);
  
  // Track memory usage periodically
  if (Math.random() < 0.1) { // 10% sampling
    metricsService.recordMemoryUsage();
  }

  // Track response time when request completes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    metricsService.recordResponseTime(req.route?.path || req.path, duration);
  });

  next();
};