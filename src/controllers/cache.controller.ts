// Day 48: Enhanced Cache Controller

import { Request, Response } from 'express';
import { cacheService } from '../services/cache.service';

export class CacheController {
  // Get cache statistics
  static getStats = (_req: Request, res: Response): void => {
    const stats = cacheService.getStats();
    res.json({
      success: true,
      data: stats
    });
  };

  // Get cache health status
  static getHealth = (_req: Request, res: Response): void => {
    const health = cacheService.getHealth();
    res.json({
      success: true,
      data: health
    });
  };

  // Clear all cache
  static clearAll = (_req: Request, res: Response): void => {
    cacheService.clear();
    res.json({
      success: true,
      message: 'All cache layers cleared successfully'
    });
  };

  // Clear cache by pattern
  static clearPattern = (req: Request, res: Response): void => {
    const { pattern } = req.params;

    if (!pattern) {
      res.status(400).json({
        success: false,
        message: 'Pattern parameter is required'
      });
      return;
    }

    cacheService.deletePattern(pattern);
    res.json({
      success: true,
      message: `Cache cleared for pattern: ${pattern}`
    });
  };

  // Get all cache keys
  static getKeys = (_req: Request, res: Response): void => {
    const keys = cacheService.keys();
    res.json({
      success: true,
      data: {
        count: keys.length,
        keys
      }
    });
  };

  // Warm cache with predefined data
  static warmCache = async (_req: Request, res: Response): Promise<void> => {
    try {
      // Predefined cache warming data
      const warmupData = [
        { key: 'system:config', data: { version: '1.0.0', env: 'production' }, ttl: 3600 },
        { key: 'system:features', data: { caching: true, monitoring: true }, ttl: 3600 },
        { key: 'system:limits', data: { maxUsers: 10000, maxTasks: 100000 }, ttl: 3600 }
      ];

      for (const item of warmupData) {
        cacheService.set(item.key, item.data, item.ttl);
      }

      res.json({
        success: true,
        message: `Cache warmed with ${warmupData.length} items`,
        data: {
          itemsWarmed: warmupData.length,
          keys: warmupData.map(item => item.key)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Cache warming failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Delete specific cache key
  static deleteKey = (req: Request, res: Response): void => {
    const { key } = req.params;

    if (!key) {
      res.status(400).json({
        success: false,
        message: 'Key parameter is required'
      });
      return;
    }

    cacheService.delete(key);
    res.json({
      success: true,
      message: `Cache key deleted: ${key}`
    });
  };
}