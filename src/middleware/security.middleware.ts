import { Request, Response, NextFunction } from 'express';
import mongoSanitize from 'express-mongo-sanitize';

const sanitizeOptions = {
  replaceWith: '_',
  onSanitize: ({ key }: { key: string }) => {
    console.warn(`Sanitized input detected: ${key}`);
  }
};

// Express 5 exposes req.query as a getter, so the stock middleware cannot
// replace it. Sanitize each container in place instead.
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  const containers = [req.body, req.params, req.headers, req.query];
  for (const container of containers) {
    if (container) {
      mongoSanitize.sanitize(container, sanitizeOptions);
    }
  }
  next();
};

export const preventXSS = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key]
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      }
    });
  }
  next();
};

export const addSecurityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
};

export const preventParameterPollution = (req: Request, _res: Response, next: NextFunction): void => {
  const whitelist = ['status', 'priority', 'role', 'sort', 'order'];
  
  Object.keys(req.query).forEach(key => {
    if (Array.isArray(req.query[key]) && !whitelist.includes(key)) {
      req.query[key] = (req.query[key] as string[])[0];
    }
  });
  
  next();
};