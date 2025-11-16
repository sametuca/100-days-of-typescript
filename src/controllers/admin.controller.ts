import { Request, Response } from 'express';
import { catchAsync } from '../middleware/error.middleware';
import { scheduler } from '../jobs';

export class AdminController {
  
  public static getJobsStatus = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const status = scheduler.getStatus();

    res.status(200).json({
      success: true,
      data: { jobs: status }
    });
  });
}