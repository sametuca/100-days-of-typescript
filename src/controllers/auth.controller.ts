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
}