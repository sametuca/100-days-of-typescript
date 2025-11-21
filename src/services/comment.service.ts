import { commentRepository } from '../repositories/comment.repository';
import { activityRepository } from '../repositories/activity.repository';
import { taskRepository } from '../repositories/task.repository';
import { CreateCommentDTO, UpdateCommentDTO } from '../types/comment.types';
import { ApiError } from '../utils/errors';

export class CommentService {
    public async createComment(taskId: string, userId: string, data: CreateCommentDTO) {
        const task = await taskRepository.findById(taskId);
        if (!task) {
            throw new ApiError('Task not found', 404);
        }

        const comment = await commentRepository.create(data, taskId, userId);

        // Log activity
        await activityRepository.create({
            task_id: taskId,
            user_id: userId,
            action_type: 'COMMENT_ADDED',
            details: { comment_id: comment.id }
        });

        return comment;
    }

    public async getTaskComments(taskId: string) {
        return await commentRepository.findByTaskId(taskId);
    }

    public async updateComment(id: string, userId: string, data: UpdateCommentDTO) {
        const comment = await commentRepository.findById(id);
        if (!comment) {
            throw new ApiError('Comment not found', 404);
        }

        if (comment.user_id !== userId) {
            throw new ApiError('You are not authorized to update this comment', 403);
        }

        return await commentRepository.update(id, data);
    }

    public async deleteComment(id: string, userId: string) {
        const comment = await commentRepository.findById(id);
        if (!comment) {
            throw new ApiError('Comment not found', 404);
        }

        if (comment.user_id !== userId) {
            throw new ApiError('You are not authorized to delete this comment', 403);
        }

        return await commentRepository.delete(id);
    }
}

export const commentService = new CommentService();
