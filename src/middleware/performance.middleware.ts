import { Request, Response, NextFunction } from 'express';
import { PerformanceMonitorService } from '../services/performance-monitor.service';

export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    PerformanceMonitorService.recordAPIPerformance({
      endpoint: req.path,
      method: req.method,
      responseTime,
      statusCode: res.statusCode,
      timestamp: new Date(),
      userId: (req as any).user?.userId
    });
  });
  
  next();
};