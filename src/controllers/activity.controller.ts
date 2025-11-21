import { Request, Response } from 'express';
import { activityService } from '../services/activity.service';
import { catchAsync } from '../middleware/error.middleware';

export class ActivityController {
    public static getTaskHistory = catchAsync(async (req: Request, res: Response) => {
        const { taskId } = req.params;
        const history = await activityService.getTaskHistory(taskId);

        res.status(200).json({
            success: true,
            data: history
        });
    });
}
