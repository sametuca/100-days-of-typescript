import { userRepository } from '../repositories/user.repository';
import { PasswordUtil } from '../utils/password';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors';
import { User, UserRole } from '../types';
import logger from '../utils/logger';
import { PaginatedResult, PaginationUtil } from '../utils/pagination';
import { FileUtil } from '../utils/file-upload';
import { emailService } from './email.service';

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

    emailService.sendPasswordChangedEmail(
      user.email,
      user.firstName || user.username
    ).catch(err => logger.error('Password changed email failed:', err));
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

  public static async listUsers(
    page?: number,
    limit?: number,
    filters?: {
      role?: UserRole;
      isActive?: boolean;
      search?: string;
    }
  ): Promise<PaginatedResult<Omit<User, 'passwordHash'>>> {
    const validatedParams = PaginationUtil.validateParams({ page, limit });

    const { users, total } = await userRepository.findAllPaginated(
      validatedParams.page,
      validatedParams.limit,
      filters
    );

    const usersWithoutPassword = users.map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    const paginationMeta = PaginationUtil.createMeta(
      validatedParams.page,
      validatedParams.limit,
      total
    );

    return {
      data: usersWithoutPassword,
      pagination: paginationMeta
    };
  }

  public static async uploadAvatar(
    userId: string,
    file: Express.Multer.File
  ): Promise<Omit<User, 'passwordHash'>> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
    }

    if (user.avatar) {
      const oldAvatarPath = FileUtil.getFilePath(user.avatar, 'avatar');
      FileUtil.deleteFile(oldAvatarPath);
    }

    const updatedUser = await userRepository.update(userId, {
      avatar: file.filename
    });

    if (!updatedUser) {
      throw new NotFoundError('Avatar güncellenemedi', 'UPDATE_FAILED');
    }

    logger.info(`Avatar uploaded for user: ${userId}`);

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  public static async deleteAvatar(userId: string): Promise<void> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
    }

    if (!user.avatar) {
      throw new ValidationError('Kullanıcının avatarı yok', undefined, 'NO_AVATAR');
    }

    const avatarPath = FileUtil.getFilePath(user.avatar, 'avatar');
    FileUtil.deleteFile(avatarPath);

    await userRepository.update(userId, { avatar: null as any });

    logger.info(`Avatar deleted for user: ${userId}`);
  }

}