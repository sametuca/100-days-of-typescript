"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const task_service_1 = require("../services/task.service");
const logger_1 = __importDefault(require("../utils/logger"));
class TaskController {
    static async getTaskById(req, res) {
        try {
            const { id } = req.params;
            const task = await task_service_1.TaskService.getTaskById(id);
            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: `ID ${id} ile task bulunamadı`
                });
            }
            res.status(200).json({
                success: true,
                data: task
            });
        }
        catch (error) {
            console.error('Error in getTaskById:', error);
            res.status(500).json({
                success: false,
                message: 'Task getirilemedi',
                error: error instanceof Error ? error.message : 'Bilinmeyen hata'
            });
        }
    }
    static async createTask(req, res) {
        try {
            const taskData = req.body;
            const userId = req.user.userId;
            const newTask = await task_service_1.TaskService.createTask(taskData, userId);
            logger_1.default.info(`Task created: ${newTask.id} by user ${userId}`);
            res.status(201).json({
                success: true,
                message: 'Task başarıyla oluşturuldu',
                data: newTask
            });
        }
        catch (error) {
            console.error('Error in createTask:', error);
            res.status(500).json({
                success: false,
                message: 'Task oluşturulamadı',
                error: error instanceof Error ? error.message : 'Bilinmeyen hata'
            });
        }
    }
    static async updateTask(req, res) {
        try {
            const { id } = req.params;
            const taskData = req.body;
            if (Object.keys(taskData).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Güncellenecek alan belirtilmedi'
                });
            }
            const updatedTask = await task_service_1.TaskService.updateTask(id, taskData);
            if (!updatedTask) {
                return res.status(404).json({
                    success: false,
                    message: `ID ${id} ile task bulunamadı`
                });
            }
            res.status(200).json({
                success: true,
                message: 'Task başarıyla güncellendi',
                data: updatedTask
            });
        }
        catch (error) {
            console.error('Error in updateTask:', error);
            res.status(500).json({
                success: false,
                message: 'Task güncellenemedi',
                error: error instanceof Error ? error.message : 'Bilinmeyen hata'
            });
        }
    }
    static async deleteTask(req, res) {
        try {
            const { id } = req.params;
            const deleted = await task_service_1.TaskService.deleteTask(id);
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: `ID ${id} ile task bulunamadı`
                });
            }
            res.status(200).json({
                success: true,
                message: 'Task başarıyla silindi'
            });
        }
        catch (error) {
            console.error('Error in deleteTask:', error);
            res.status(500).json({
                success: false,
                message: 'Task silinemedi',
                error: error instanceof Error ? error.message : 'Bilinmeyen hata'
            });
        }
    }
}
exports.TaskController = TaskController;
_a = TaskController;
TaskController.getAllTasks = catchAsync(async (req, res) => {
    const { status, priority, search, userId, projectId, page, limit } = req.query;
    const filters = {};
    if (status)
        filters.status = status;
    if (priority)
        filters.priority = priority;
    if (search)
        filters.search = search;
    if (userId)
        filters.userId = userId;
    if (projectId)
        filters.projectId = projectId;
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const result = await task_service_1.TaskService.getAllTasks(pageNum, limitNum, filters);
    res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
    });
});
function catchAsync(fn) {
    return (req, res) => {
        fn(req, res).catch((error) => {
            console.error('Async error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        });
    };
}
//# sourceMappingURL=task.controller.js.map