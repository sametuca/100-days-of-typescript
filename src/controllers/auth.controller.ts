import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { catchAsync } from '../middleware/error.middleware';
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

    const result = await AuthService.login(email, password);

    logger.info(`Login successful: ${result.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Giriş başarılı',
      data: result
    });
  });
}