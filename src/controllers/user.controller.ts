import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { catchAsync } from '../middleware/error.middleware';
import logger from '../utils/logger';

export class UserController {
  
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
}