// Day 28: Cache Controller

import { Request, Response } from 'express';
import { cacheService } from '../services/cache.service';

export class CacheController {
  // Get cache statistics
  static getStats = (_req: Request, res: Response): void => {
    const stats = cacheService.getStats();
    res.json({ success: true, data: stats });
  };

  // Clear all cache
  static clearAll = (_req: Request, res: Response): void => {
    cacheService.clear();
    res.json({ success: true, message: 'Cache cleared' });
  };

  // Clear cache by pattern
  static clearPattern = (req: Request, res: Response): void => {
    const { pattern } = req.params;
    cacheService.deletePattern(pattern);
    res.json({ success: true, message: `Cache cleared for pattern: ${pattern}` });
  };
}