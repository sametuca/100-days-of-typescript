import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../utils/jwt';
import { AuthenticationError, AuthorizationError } from '../utils/errors';
import { UserRole } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AuthenticationError('Authorization header eksik', 'NO_AUTH_HEADER');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Bearer token gerekli', 'INVALID_AUTH_FORMAT');
    }

    const token = authHeader.substring(7);

    if (!token) {
      throw new AuthenticationError('Token bulunamadı', 'NO_TOKEN');
    }

    const decoded = JwtUtil.verifyAccessToken(token);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
    } else {
      next(new AuthenticationError('Geçersiz veya süresi dolmuş token', 'INVALID_TOKEN'));
    }
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError('Kullanıcı kimliği doğrulanmamış', 'NOT_AUTHENTICATED');
    }

    const userRole = req.user.role as UserRole;

    if (!allowedRoles.includes(userRole)) {
      throw new AuthorizationError(
        `Bu işlem için ${allowedRoles.join(' veya ')} yetkisi gereklidir`,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    next();
  };
};

export const authMiddleware = {
  authenticate,
  authorize
};