import bcrypt from 'bcrypt';
import config from '../config/env';

export class PasswordUtil {
  
  public static async hash(password: string): Promise<string> {
    const saltRounds = config.security.bcryptRounds;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  public static async compare(password: string, hash: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  }

  public static validate(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Şifre en az 8 karakter olmalıdır');
    }

    if (password.length > 100) {
      errors.push('Şifre en fazla 100 karakter olmalıdır');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Şifre en az bir büyük harf içermelidir');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Şifre en az bir küçük harf içermelidir');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Şifre en az bir rakam içermelidir');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}