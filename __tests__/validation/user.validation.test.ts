import { 
  registerSchema, 
  loginSchema, 
  refreshTokenSchema 
} from '../../src/validation/user.validation';

describe('User Validation Schemas', () => {

  describe('registerSchema', () => {
    it('should validate valid registration data', () => {
      const validData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'TestPass123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const result = registerSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.username).toBe('testuser');
      }
    });

    it('should validate registration without optional fields', () => {
      const validData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'TestPass123'
      };

      const result = registerSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should convert email and username to lowercase', () => {
      const data = {
        email: 'TEST@EXAMPLE.COM',
        username: 'TestUser',
        password: 'TestPass123'
      };

      const result = registerSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.username).toBe('testuser');
      }
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        username: 'testuser',
        password: 'TestPass123'
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Geçerli bir email');
      }
    });

    it('should reject username shorter than 3 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'ab',
        password: 'TestPass123'
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('en az 3 karakter');
      }
    });

    it('should reject username longer than 30 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'a'.repeat(31),
        password: 'TestPass123'
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('en fazla 30 karakter');
      }
    });

    it('should reject username with invalid characters', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'test user!',
        password: 'TestPass123'
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('sadece harf, rakam');
      }
    });

    it('should reject password shorter than 8 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Short1'
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('en az 8 karakter');
      }
    });

    it('should reject password longer than 100 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'a'.repeat(101)
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('en fazla 100 karakter');
      }
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        email: 'test@example.com'
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'TestPass123'
      };

      const result = loginSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.password).toBe('TestPass123');
      }
    });

    it('should convert email to lowercase', () => {
      const data = {
        email: 'TEST@EXAMPLE.COM',
        password: 'TestPass123'
      };

      const result = loginSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
      }
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'TestPass123'
      };

      const result = loginSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: ''
      };

      const result = loginSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('boş olamaz');
      }
    });

    it('should reject missing fields', () => {
      const invalidData = {};

      const result = loginSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('refreshTokenSchema', () => {
    it('should validate valid refresh token', () => {
      const validData = {
        refreshToken: 'valid.refresh.token'
      };

      const result = refreshTokenSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.refreshToken).toBe('valid.refresh.token');
      }
    });

    it('should reject empty refresh token', () => {
      const invalidData = {
        refreshToken: ''
      };

      const result = refreshTokenSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('boş olamaz');
      }
    });

    it('should reject missing refresh token', () => {
      const invalidData = {};

      const result = refreshTokenSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });
});
