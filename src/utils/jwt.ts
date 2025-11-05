import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import config from '../config/env';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export class JwtUtil {
  
  public static generateAccessToken(payload: JwtPayload): string {
    const options: SignOptions = { expiresIn: config.jwt.expiresIn as any };
    return jwt.sign(payload, config.jwt.secret, options);
  }

  public static generateRefreshToken(payload: JwtPayload): string {
    const options: SignOptions = { expiresIn: config.jwt.refreshExpiresIn as any };
    return jwt.sign(payload, config.jwt.refreshSecret, options);
  }

  public static verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  public static verifyRefreshToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  public static decodeToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.decode(token) as JwtPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}