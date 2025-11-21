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
    static async getAllTasks(queryParams) {
        const validatedParams = pagination_1.PaginationUtil.validateParams({
            page: queryParams.page,
            limit: queryParams.limit
        });
        const filters = {
            userId: queryParams.userId,
            search: queryParams.search,
            startDate: queryParams.startDate ? new Date(queryParams.startDate) : undefined,
            endDate: queryParams.endDate ? new Date(queryParams.endDate) : undefined,
            status: Array.isArray(queryParams.status) ? queryParams.status :
                queryParams.status ? [queryParams.status] : undefined,
            priority: Array.isArray(queryParams.priority) ? queryParams.priority :
                queryParams.priority ? [queryParams.priority] : undefined,
        };
        const { tasks, total } = await task_repository_1.taskRepository.findAllPaginated(validatedParams.page, validatedParams.limit, filters, {
            sortBy: queryParams.sortBy || 'createdAt',
            sortOrder: queryParams.sortOrder || 'desc'
        });
        const paginationMeta = pagination_1.PaginationUtil.createMeta(validatedParams.page, validatedParams.limit, total);
        logger_1.default.info(`Retrieved ${tasks.length} tasks with filters`, { filters, total });
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
    static async getDashboardAnalytics(userId) {
        const allTasksQuery = {
            userId: userId,
            page: 1,
            limit: 1000
        };
        const { data: allTasks } = await this.getAllTasks(allTasksQuery);
        const taskStats = {
            total: allTasks.length,
            completed: allTasks.filter(t => t.status === types_1.TaskStatus.DONE).length,
            inProgress: allTasks.filter(t => t.status === types_1.TaskStatus.IN_PROGRESS).length,
            todo: allTasks.filter(t => t.status === types_1.TaskStatus.TODO).length,
            cancelled: allTasks.filter(t => t.status === types_1.TaskStatus.CANCELLED).length,
            completionRate: 0
        };
        taskStats.completionRate = taskStats.total > 0
            ? Math.round((taskStats.completed / taskStats.total) * 100)
            : 0;
        const priorityStats = {
            low: allTasks.filter(t => t.priority === types_1.TaskPriority.LOW).length,
            medium: allTasks.filter(t => t.priority === types_1.TaskPriority.MEDIUM).length,
            high: allTasks.filter(t => t.priority === types_1.TaskPriority.HIGH).length,
            urgent: allTasks.filter(t => t.priority === types_1.TaskPriority.URGENT).length,
        };
        const recentTasks = allTasks
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const completedTasks = allTasks.filter(t => t.status === types_1.TaskStatus.DONE);
        const productivity = {
            tasksCompletedToday: completedTasks.filter(t => new Date(t.updatedAt) >= todayStart).length,
            tasksCompletedThisWeek: completedTasks.filter(t => new Date(t.updatedAt) >= weekStart).length,
            tasksCompletedThisMonth: completedTasks.filter(t => new Date(t.updatedAt) >= monthStart).length,
            averageCompletionTime: undefined
        };
        logger_1.default.info('Dashboard analytics generated', {
            userId,
            totalTasks: taskStats.total,
            completionRate: taskStats.completionRate
        });
        return {
            taskStats,
            priorityStats,
            recentTasks,
            productivity
        };
    }
}
exports.TaskService = TaskService;
//# sourceMappingURL=task.service.js.map