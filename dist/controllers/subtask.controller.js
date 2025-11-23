"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubtaskController = void 0;
const subtask_service_1 = require("../services/subtask.service");
const error_middleware_1 = require("../middleware/error.middleware");
class SubtaskController {
}
exports.SubtaskController = SubtaskController;
_a = SubtaskController;
SubtaskController.createSubtask = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const { taskId } = req.params;
    const subtask = await subtask_service_1.SubtaskService.createSubtask(taskId, req.body);
    res.status(201).json({
        success: true,
        data: subtask
    });
});
SubtaskController.getTaskSubtasks = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const { taskId } = req.params;
    const subtasks = await subtask_service_1.SubtaskService.getSubtasksByTask(taskId);
    res.status(200).json({
        success: true,
        data: subtasks
    });
});
SubtaskController.updateSubtask = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const subtask = await subtask_service_1.SubtaskService.updateSubtask(id, req.body);
    res.status(200).json({
        success: true,
        data: subtask
    });
});
SubtaskController.deleteSubtask = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    await subtask_service_1.SubtaskService.deleteSubtask(id);
    res.status(200).json({
        success: true,
        message: 'Alt görev silindi'
    });
});
SubtaskController.toggleComplete = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const subtask = await subtask_service_1.SubtaskService.toggleComplete(id);
    res.status(200).json({
        success: true,
        data: subtask
    });
});
//# sourceMappingURL=subtask.controller.js.map