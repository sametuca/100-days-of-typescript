import { userRepository } from '../repositories/user.repository';
import { PasswordUtil } from '../utils/password';
import { ConflictError, ValidationError, AuthenticationError } from '../utils/errors';
import { User } from '../types';
import logger from '../utils/logger';
import { JwtUtil } from '@/utils/jwt';

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export class AuthService {
  
  public static async register(data: RegisterData): Promise<Omit<User, 'passwordHash'>> {
    const { email, username, password, firstName, lastName } = data;

    const emailExists = await userRepository.emailExists(email);
    if (emailExists) {
      throw new ConflictError('Bu email adresi zaten kullanılıyor', 'EMAIL_EXISTS');
    }

    const usernameExists = await userRepository.usernameExists(username);
    if (usernameExists) {
      throw new ConflictError('Bu kullanıcı adı zaten kullanılıyor', 'USERNAME_EXISTS');
    }

    const passwordValidation = PasswordUtil.validate(password);
    if (!passwordValidation.valid) {
      throw new ValidationError(
        'Şifre gereksinimleri karşılanmıyor',
        passwordValidation.errors,
        'WEAK_PASSWORD'
      );
    }

    const passwordHash = await PasswordUtil.hash(password);

    const user = await userRepository.create({
      email,
      username,
      passwordHash,
      firstName,
      lastName
    });

    logger.info(`User registered: ${user.id} (${user.email})`);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  public static async login(email: string, password: string): Promise<{
    user: Omit<User, 'passwordHash'>;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AuthenticationError('Email veya şifre hatalı', 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Hesabınız aktif değil', 'ACCOUNT_INACTIVE');
    }

    const isPasswordValid = await PasswordUtil.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AuthenticationError('Email veya şifre hatalı', 'INVALID_CREDENTIALS');
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = JwtUtil.generateAccessToken(payload);
    const refreshToken = JwtUtil.generateRefreshToken(payload);

    logger.info(`User logged in: ${user.id} (${user.email})`);

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    };
  }
}