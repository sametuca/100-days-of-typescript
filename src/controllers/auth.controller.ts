import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { catchAsync } from '../middleware/error.middleware';
import { securityService } from '../services/security.service';
import logger from '../utils/logger';

export class AuthController {

  public static register = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userData = req.body;

    const user = await AuthService.register(userData);

    logger.info(`Registration successful: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı',
      data: {
        user
      }
    });
  });

  public static login = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress || 'unknown';

    try {
      const result = await AuthService.login(email, password);
      logger.info(`Login successful: ${result.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Giriş başarılı',
        data: result
      });
    } catch (error) {
      // Day 29: Log failed login attempt
      securityService.logEvent({
        type: 'FAILED_LOGIN',
        ip,
        details: { email, error: (error as Error).message }
      });
      throw error;
    }
  });

  public static refreshToken = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    const tokens = await AuthService.refreshToken(refreshToken);

    logger.info('Tokens refreshed successfully');

    res.status(200).json({
      success: true,
      message: 'Token yenilendi',
      data: tokens
    });
  });

  public static logout = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    await AuthService.logout(refreshToken);

    logger.info('Logout successful');

    res.status(200).json({
      success: true,
      message: 'Çıkış başarılı'
    });
  });

  public static logoutAll = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;

    await AuthService.logoutAll(userId);

    logger.info(`All sessions logged out for user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Tüm oturumlardan çıkış yapıldı'
    });
  });
}