import { Request, Response } from 'express';
import { SubtaskService } from '../services/subtask.service';
import { catchAsync } from '../middleware/error.middleware';

export class SubtaskController {
    public static createSubtask = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const { taskId } = req.params;
        const subtask = await SubtaskService.createSubtask(taskId, req.body);

        res.status(201).json({
            success: true,
            data: subtask
        });
    });

    public static getTaskSubtasks = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const { taskId } = req.params;
        const subtasks = await SubtaskService.getSubtasksByTask(taskId);

        res.status(200).json({
            success: true,
            data: subtasks
        });
    });

    public static updateSubtask = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const subtask = await SubtaskService.updateSubtask(id, req.body);

        res.status(200).json({
            success: true,
            data: subtask
        });
    });

    public static deleteSubtask = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        await SubtaskService.deleteSubtask(id);

        res.status(200).json({
            success: true,
            message: 'Alt görev silindi'
        });
    });

    public static toggleComplete = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const subtask = await SubtaskService.toggleComplete(id);

        res.status(200).json({
            success: true,
            data: subtask
        });
    });
}
