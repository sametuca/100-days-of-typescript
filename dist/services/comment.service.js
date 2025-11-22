"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentService = exports.CommentService = void 0;
const comment_repository_1 = require("../repositories/comment.repository");
const activity_repository_1 = require("../repositories/activity.repository");
const task_repository_1 = require("../repositories/task.repository");
const errors_1 = require("../utils/errors");
class CommentService {
    async createComment(taskId, userId, data) {
        const task = await task_repository_1.taskRepository.findById(taskId);
        if (!task) {
            throw new errors_1.ApiError('Task not found', 404);
        }
        const comment = await comment_repository_1.commentRepository.create(data, taskId, userId);
        await activity_repository_1.activityRepository.create({
            task_id: taskId,
            user_id: userId,
            action_type: 'COMMENT_ADDED',
            details: { comment_id: comment.id }
        });
        return comment;
    }
    async getTaskComments(taskId) {
        return await comment_repository_1.commentRepository.findByTaskId(taskId);
    }
    async updateComment(id, userId, data) {
        const comment = await comment_repository_1.commentRepository.findById(id);
        if (!comment) {
            throw new errors_1.ApiError('Comment not found', 404);
        }
        if (comment.user_id !== userId) {
            throw new errors_1.ApiError('You are not authorized to update this comment', 403);
        }
        return await comment_repository_1.commentRepository.update(id, data);
    }
    async deleteComment(id, userId) {
        const comment = await comment_repository_1.commentRepository.findById(id);
        if (!comment) {
            throw new errors_1.ApiError('Comment not found', 404);
        }
        if (comment.user_id !== userId) {
            throw new errors_1.ApiError('You are not authorized to delete this comment', 403);
        }
        return await comment_repository_1.commentRepository.delete(id);
    }
}
exports.CommentService = CommentService;
exports.commentService = new CommentService();
//# sourceMappingURL=comment.service.js.map