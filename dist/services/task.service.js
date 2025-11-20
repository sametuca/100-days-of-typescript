"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const pagination_1 = require("../utils/pagination");
const task_repository_1 = require("../repositories/task.repository");
const types_1 = require("../types");
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
class TaskService {
    static async getAllTasks(page, limit, filters) {
        const validatedParams = pagination_1.PaginationUtil.validateParams({ page, limit });
        const { tasks, total } = await task_repository_1.taskRepository.findAllPaginated(validatedParams.page, validatedParams.limit, filters);
        const paginationMeta = pagination_1.PaginationUtil.createMeta(validatedParams.page, validatedParams.limit, total);
        return {
            data: tasks,
            pagination: paginationMeta
        };
    }
    static async getTaskById(id) {
        return await task_repository_1.taskRepository.findById(id);
    }
    static async createTask(taskData, userId) {
        return await task_repository_1.taskRepository.create(taskData, userId);
    }
    static async updateTask(id, taskData) {
        return await task_repository_1.taskRepository.update(id, taskData);
    }
    static async deleteTask(id) {
        return await task_repository_1.taskRepository.delete(id);
    }
    static async getTasksByUser(userId) {
        return await task_repository_1.taskRepository.findByUserId(userId);
    }
    static async getTasksByProject(projectId) {
        return await task_repository_1.taskRepository.findByProjectId(projectId);
    }
    static async getTasksByStatus(status) {
        return await task_repository_1.taskRepository.findByStatus(status);
    }
    static async searchTasks(query) {
        return await task_repository_1.taskRepository.search(query);
    }
    static async getTasksWithFilters(filters) {
        return await task_repository_1.taskRepository.findWithFilters(filters);
    }
    static async getTaskStatistics(userId) {
        const tasks = userId
            ? await task_repository_1.taskRepository.findByUserId(userId)
            : await task_repository_1.taskRepository.findAll();
        return {
            total: tasks.length,
            byStatus: {
                todo: tasks.filter(t => t.status === types_1.TaskStatus.TODO).length,
                inProgress: tasks.filter(t => t.status === types_1.TaskStatus.IN_PROGRESS).length,
                done: tasks.filter(t => t.status === types_1.TaskStatus.DONE).length,
                cancelled: tasks.filter(t => t.status === types_1.TaskStatus.CANCELLED).length
            },
            byPriority: {
                low: tasks.filter(t => t.priority === types_1.TaskPriority.LOW).length,
                medium: tasks.filter(t => t.priority === types_1.TaskPriority.MEDIUM).length,
                high: tasks.filter(t => t.priority === types_1.TaskPriority.HIGH).length,
                urgent: tasks.filter(t => t.priority === types_1.TaskPriority.URGENT).length
            },
            overdue: tasks.filter(t => {
                if (!t.dueDate)
                    return false;
                if (t.status === types_1.TaskStatus.DONE || t.status === types_1.TaskStatus.CANCELLED)
                    return false;
                return new Date(t.dueDate) < new Date();
            }).length
        };
    }
    static async uploadAttachment(taskId, userId, _file) {
        const task = await task_repository_1.taskRepository.findById(taskId);
        if (!task) {
            throw new errors_1.NotFoundError('Task bulunamadı', 'TASK_NOT_FOUND');
        }
        if (task.userId !== userId) {
            throw new errors_1.AuthorizationError('Bu task size ait değil', 'UNAUTHORIZED');
        }
        logger_1.default.info(`Attachment uploaded for task: ${taskId}`);
        return task;
    }
}
exports.TaskService = TaskService;
//# sourceMappingURL=task.service.js.map