import { JwtUtil, JwtPayload } from '../../src/utils/jwt';
import * as jwt from 'jsonwebtoken';

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

describe('JwtUtil', () => {
  const mockPayload: JwtPayload = {
    userId: 'user_123',
    email: 'test@example.com',
    role: 'user'
  };

  const mockToken = 'mock.jwt.token';
  const mockRefreshToken = 'mock.refresh.token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate access token successfully', () => {
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const result = JwtUtil.generateAccessToken(mockPayload);

      expect(result).toBe(mockToken);
      expect(jwt.sign).toHaveBeenCalledWith(
        mockPayload,
        expect.any(String),
        expect.objectContaining({ expiresIn: expect.anything() })
      );
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token successfully', () => {
      (jwt.sign as jest.Mock).mockReturnValue(mockRefreshToken);

      const result = JwtUtil.generateRefreshToken(mockPayload);

      expect(result).toBe(mockRefreshToken);
      expect(jwt.sign).toHaveBeenCalledWith(
        mockPayload,
        expect.any(String),
        expect.objectContaining({ expiresIn: expect.anything() })
      );
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = JwtUtil.verifyAccessToken(mockToken);

      expect(result).toEqual(mockPayload);
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, expect.any(String));
    });

    it('should throw error for invalid token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      expect(() => JwtUtil.verifyAccessToken('invalid.token')).toThrow(
        'Invalid or expired token'
      );
    });

    it('should throw error for expired token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('jwt expired');
      });

      expect(() => JwtUtil.verifyAccessToken(mockToken)).toThrow(
        'Invalid or expired token'
      );
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = JwtUtil.verifyRefreshToken(mockRefreshToken);

      expect(result).toEqual(mockPayload);
      expect(jwt.verify).toHaveBeenCalledWith(mockRefreshToken, expect.any(String));
    });

    it('should throw error for invalid refresh token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      expect(() => JwtUtil.verifyRefreshToken('invalid.token')).toThrow(
        'Invalid or expired refresh token'
      );
    });
  });

  describe('decodeToken', () => {
    it('should decode token successfully', () => {
      (jwt.decode as jest.Mock).mockReturnValue(mockPayload);

      const result = JwtUtil.decodeToken(mockToken);

      expect(result).toEqual(mockPayload);
      expect(jwt.decode).toHaveBeenCalledWith(mockToken);
    });

    it('should return null for invalid token', () => {
      (jwt.decode as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = JwtUtil.decodeToken('invalid.token');

      expect(result).toBeNull();
    });

    it('should return null when decode returns null', () => {
      (jwt.decode as jest.Mock).mockReturnValue(null);

      const result = JwtUtil.decodeToken(mockToken);

      expect(result).toBeNull();
    });
  });
});
