import { userRepository } from '../repositories/user.repository';
import { PasswordUtil } from '../utils/password';
import { ConflictError, ValidationError, AuthenticationError } from '../utils/errors';
import { User } from '../types';
import logger from '../utils/logger';
import { JwtUtil } from '../utils/jwt';
import { refreshTokenRepository } from '../repositories/refresh-token.repository';

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
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt
    });
    logger.info(`User logged in: ${user.id} (${user.email})`);

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    };
  }

  public static async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const decoded = JwtUtil.verifyRefreshToken(refreshToken);

    const storedToken = await refreshTokenRepository.findByToken(refreshToken);

    if (!storedToken) {
      throw new AuthenticationError('Refresh token bulunamadı', 'REFRESH_TOKEN_NOT_FOUND');
    }

    if (storedToken.revoked) {
      throw new AuthenticationError('Refresh token iptal edilmiş', 'REFRESH_TOKEN_REVOKED');
    }

    if (new Date() > storedToken.expiresAt) {
      throw new AuthenticationError('Refresh token süresi dolmuş', 'REFRESH_TOKEN_EXPIRED');
    }

    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      throw new AuthenticationError('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Hesap aktif değil', 'ACCOUNT_INACTIVE');
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const newAccessToken = JwtUtil.generateAccessToken(payload);
    const newRefreshToken = JwtUtil.generateRefreshToken(payload);

    await refreshTokenRepository.revoke(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await refreshTokenRepository.create({
      userId: user.id,
      token: newRefreshToken,
      expiresAt
    });

    logger.info(`Tokens refreshed for user: ${user.id}`);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  public static async logout(refreshToken: string): Promise<void> {
    const revoked = await refreshTokenRepository.revoke(refreshToken);

    if (!revoked) {
      throw new AuthenticationError('Refresh token bulunamadı', 'REFRESH_TOKEN_NOT_FOUND');
    }

    logger.info('User logged out');
  }

  public static async logoutAll(userId: string): Promise<void> {
    const count = await refreshTokenRepository.revokeAllForUser(userId);

    logger.info(`All sessions logged out for user: ${userId} (${count} tokens revoked)`);
  }
}