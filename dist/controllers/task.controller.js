"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const task_service_1 = require("../services/task.service");
const error_middleware_1 = require("../middleware/error.middleware");
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
            const userId = req.user.userId;
            const updatedTask = await task_service_1.TaskService.updateTask(id, taskData, userId);
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
TaskController.getAllTasks = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const queryParams = {
        status: req.query.status ?
            (Array.isArray(req.query.status) ?
                req.query.status :
                [req.query.status]) :
            undefined,
        priority: req.query.priority ?
            (Array.isArray(req.query.priority) ?
                req.query.priority :
                [req.query.priority]) :
            undefined,
        search: req.query.search,
        userId: req.query.userId,
        projectId: req.query.projectId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        page: req.query.page ? parseInt(req.query.page, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
    };
    logger_1.default.info('Task query received', { queryParams });
    const result = await task_service_1.TaskService.getAllTasks(queryParams);
    res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        filters: {
            applied: Object.keys(queryParams).filter(key => queryParams[key] !== undefined),
            totalResults: result.data.length
        }
    });
});
TaskController.uploadAttachment = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const file = req.file;
    if (!file) {
        res.status(400).json({
            success: false,
            message: 'Dosya yüklenmedi'
        });
        return;
    }
    const task = await task_service_1.TaskService.uploadAttachment(id, userId, file);
    res.status(200).json({
        success: true,
        message: 'Dosya başarıyla yüklendi',
        data: task
    });
});
TaskController.getDashboard = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const { userId } = req.query;
    logger_1.default.info('Dashboard analytics requested', { userId });
    const analytics = await task_service_1.TaskService.getDashboardAnalytics(userId);
    res.status(200).json({
        success: true,
        message: 'Dashboard analytics retrieved successfully',
        data: analytics
    });
});
//# sourceMappingURL=task.controller.js.map