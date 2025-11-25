// Day 29: Advanced Rate Limiting

import { Request, Response, NextFunction } from 'express';
import { securityService } from '../services/security.service';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
}

class AdvancedRateLimit {
  private requests = new Map<string, number[]>();

  createLimiter(config: RateLimitConfig) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      
      // Check if IP is blocked
      if (securityService.isBlocked(ip)) {
        res.status(403).json({
          success: false,
          message: 'IP blocked due to suspicious activity'
        });
        return;
      }

      const now = Date.now();
      const windowStart = now - config.windowMs;
      
      // Get or create request history for this IP
      let requestTimes = this.requests.get(ip) || [];
      
      // Remove old requests outside the window
      requestTimes = requestTimes.filter(time => time > windowStart);
      
      // Check if limit exceeded
      if (requestTimes.length >= config.maxRequests) {
        securityService.logEvent({
          type: 'RATE_LIMIT_EXCEEDED',
          ip,
          details: { requests: requestTimes.length, limit: config.maxRequests }
        });
        
        res.status(429).json({
          success: false,
          message: 'Too many requests',
          retryAfter: Math.ceil(config.windowMs / 1000)
        });
        return;
      }

      // Add current request
      requestTimes.push(now);
      this.requests.set(ip, requestTimes);

      next();
    };
  }
}

export const advancedRateLimit = new AdvancedRateLimit();

// Predefined limiters
export const strictLimiter = advancedRateLimit.createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10
});

export const authLimiter = advancedRateLimit.createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5
});