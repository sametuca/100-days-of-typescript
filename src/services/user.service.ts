import { userRepository } from '../repositories/user.repository';
import { PasswordUtil } from '../utils/password';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors';
import { User } from '../types';
import logger from '../utils/logger';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export class UserService {
  
  public static async getProfile(userId: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  public static async updateProfile(
    userId: string,
    data: UpdateProfileData
  ): Promise<Omit<User, 'passwordHash'>> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
    }

    if (data.email && data.email !== user.email) {
      const emailExists = await userRepository.emailExists(data.email);
      if (emailExists) {
        throw new ConflictError('Bu email adresi zaten kullanılıyor', 'EMAIL_EXISTS');
      }
    }

    if (data.username && data.username !== user.username) {
      const usernameExists = await userRepository.usernameExists(data.username);
      if (usernameExists) {
        throw new ConflictError('Bu kullanıcı adı zaten kullanılıyor', 'USERNAME_EXISTS');
      }
    }

    const updatedUser = await userRepository.update(userId, data);

    if (!updatedUser) {
      throw new NotFoundError('Kullanıcı güncellenemedi', 'UPDATE_FAILED');
    }

    logger.info(`User profile updated: ${userId}`);

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  public static async changePassword(
    userId: string,
    data: ChangePasswordData
  ): Promise<void> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
    }

    const isCurrentPasswordValid = await PasswordUtil.compare(
      data.currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      throw new ValidationError('Mevcut şifre hatalı', undefined, 'INVALID_PASSWORD');
    }

    if (data.currentPassword === data.newPassword) {
      throw new ValidationError(
        'Yeni şifre eski şifre ile aynı olamaz',
        undefined,
        'SAME_PASSWORD'
      );
    }

    const passwordValidation = PasswordUtil.validate(data.newPassword);
    if (!passwordValidation.valid) {
      throw new ValidationError(
        'Şifre gereksinimleri karşılanmıyor',
        passwordValidation.errors,
        'WEAK_PASSWORD'
      );
    }

    const newPasswordHash = await PasswordUtil.hash(data.newPassword);

    await userRepository.updatePassword(userId, newPasswordHash);

    logger.info(`Password changed for user: ${userId}`);
  }

  public static async deleteAccount(userId: string, password: string): Promise<void> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
    }

    const isPasswordValid = await PasswordUtil.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new ValidationError('Şifre hatalı', undefined, 'INVALID_PASSWORD');
    }

    await userRepository.delete(userId);

    logger.info(`User account deleted: ${userId}`);
  }
}