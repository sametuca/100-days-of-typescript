import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { catchAsync } from '../middleware/error.middleware';
import logger from '../utils/logger';
import { ValidationError } from '../utils/errors';
import { FileUtil } from '../utils/file-upload';

export class UserController {
  
  public static listUsers = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { role, isActive, search, page, limit } = req.query;

    const filters: any = {};

    if (role) filters.role = role;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (search) filters.search = search as string;

    const pageNum = page ? parseInt(page as string, 10) : undefined;
    const limitNum = limit ? parseInt(limit as string, 10) : undefined;

    const result = await UserService.listUsers(pageNum, limitNum, filters);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  });
  
  public static getProfile = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;

    const user = await UserService.getProfile(userId);

    res.status(200).json({
      success: true,
      data: { user }
    });
  });

  public static updateProfile = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const updateData = req.body;

    const user = await UserService.updateProfile(userId, updateData);

    logger.info(`Profile updated for user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Profil güncellendi',
      data: { user }
    });
  });

  public static changePassword = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;

    await UserService.changePassword(userId, { currentPassword, newPassword });

    logger.info(`Password changed for user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Şifre değiştirildi'
    });
  });

  public static deleteAccount = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { password } = req.body;

    await UserService.deleteAccount(userId, password);

    logger.info(`Account deleted: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Hesap silindi'
    });
  });

  public static uploadAvatar = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;

    if (!req.file) {
      throw new ValidationError('Dosya yüklenmedi', undefined, 'NO_FILE');
    }

    const user = await UserService.uploadAvatar(userId, req.file);

    const avatarUrl = FileUtil.getFileUrl(req, user.avatar!, 'avatar');

    res.status(200).json({
      success: true,
      message: 'Avatar yüklendi',
      data: {
        user: {
          ...user,
          avatarUrl
        }
      }
    });
  });

  public static deleteAvatar = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;

    await UserService.deleteAvatar(userId);

    res.status(200).json({
      success: true,
      message: 'Avatar silindi'
    });
  });
}