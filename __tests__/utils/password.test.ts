import { PasswordUtil } from '../../src/utils/password';
import bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');

describe('PasswordUtil', () => {
  
  describe('hash', () => {
    it('should hash password successfully', async () => {
      const password = 'TestPassword123';
      const hashedPassword = 'hashedPassword123';
      
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      
      const result = await PasswordUtil.hash(password);
      
      expect(result).toBe(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, expect.any(Number));
    });
    
    it('should throw error when hashing fails', async () => {
      const password = 'TestPassword123';
      
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hashing failed'));
      
      await expect(PasswordUtil.hash(password)).rejects.toThrow('Hashing failed');
    });
  });

  describe('compare', () => {
    it('should return true for matching password', async () => {
      const password = 'TestPassword123';
      const hash = 'hashedPassword123';
      
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      
      const result = await PasswordUtil.compare(password, hash);
      
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
    });
    
    it('should return false for non-matching password', async () => {
      const password = 'WrongPassword123';
      const hash = 'hashedPassword123';
      
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      
      const result = await PasswordUtil.compare(password, hash);
      
      expect(result).toBe(false);
    });
  });

  describe('validate', () => {
    it('should validate a strong password', () => {
      const password = 'StrongPass123';
      
      const result = PasswordUtil.validate(password);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject password shorter than 8 characters', () => {
      const password = 'Short1';
      
      const result = PasswordUtil.validate(password);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Şifre en az 8 karakter olmalıdır');
    });
    
    it('should reject password longer than 100 characters', () => {
      const password = 'A'.repeat(101) + 'a1';
      
      const result = PasswordUtil.validate(password);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Şifre en fazla 100 karakter olmalıdır');
    });
    
    it('should reject password without uppercase letter', () => {
      const password = 'lowercase123';
      
      const result = PasswordUtil.validate(password);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Şifre en az bir büyük harf içermelidir');
    });
    
    it('should reject password without lowercase letter', () => {
      const password = 'UPPERCASE123';
      
      const result = PasswordUtil.validate(password);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Şifre en az bir küçük harf içermelidir');
    });
    
    it('should reject password without number', () => {
      const password = 'NoNumbersHere';
      
      const result = PasswordUtil.validate(password);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Şifre en az bir rakam içermelidir');
    });
    
    it('should return multiple errors for weak password', () => {
      const password = 'weak';
      
      const result = PasswordUtil.validate(password);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
