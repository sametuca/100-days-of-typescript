import { Request, Response } from 'express';
import { commentService } from '../services/comment.service';
import { catchAsync } from '../middleware/error.middleware';

export class CommentController {
    public static createComment = catchAsync(async (req: Request, res: Response) => {
        const { taskId } = req.params;
        const userId = req.user!.userId;
        const comment = await commentService.createComment(taskId, userId, req.body);

        res.status(201).json({
            success: true,
            data: comment
        });
    });

    public static getTaskComments = catchAsync(async (req: Request, res: Response) => {
        const { taskId } = req.params;
        const comments = await commentService.getTaskComments(taskId);

        res.status(200).json({
            success: true,
            data: comments
        });
    });

    public static updateComment = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = req.user!.userId;
        const comment = await commentService.updateComment(id, userId, req.body);

        res.status(200).json({
            success: true,
            data: comment
        });
    });

    public static deleteComment = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = req.user!.userId;
        await commentService.deleteComment(id, userId);

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
        });
    });
}
