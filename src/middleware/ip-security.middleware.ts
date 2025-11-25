// Day 29: IP Security Middleware

import { Request, Response, NextFunction } from 'express';
import { securityService } from '../services/security.service';

export const ipSecurityMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Check if IP is blocked
  if (securityService.isBlocked(ip)) {
    securityService.logEvent({
      type: 'SUSPICIOUS_ACTIVITY',
      ip,
      details: { reason: 'Blocked IP attempted access', path: req.path }
    });
    
    res.status(403).json({
      success: false,
      message: 'Access denied'
    });
    return;
  }

  next();
};