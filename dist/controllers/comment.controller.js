"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const comment_service_1 = require("../services/comment.service");
const error_middleware_1 = require("../middleware/error.middleware");
class CommentController {
}
exports.CommentController = CommentController;
_a = CommentController;
CommentController.createComment = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const { taskId } = req.params;
    const userId = req.user.userId;
    const comment = await comment_service_1.commentService.createComment(taskId, userId, req.body);
    res.status(201).json({
        success: true,
        data: comment
    });
});
CommentController.getTaskComments = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const { taskId } = req.params;
    const comments = await comment_service_1.commentService.getTaskComments(taskId);
    res.status(200).json({
        success: true,
        data: comments
    });
});
CommentController.updateComment = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const comment = await comment_service_1.commentService.updateComment(id, userId, req.body);
    res.status(200).json({
        success: true,
        data: comment
    });
});
CommentController.deleteComment = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    await comment_service_1.commentService.deleteComment(id, userId);
    res.status(200).json({
        success: true,
        message: 'Comment deleted successfully'
    });
});
//# sourceMappingURL=comment.controller.js.map