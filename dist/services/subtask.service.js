"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubtaskService = void 0;
const subtask_repository_1 = require("../repositories/subtask.repository");
const task_repository_1 = require("../repositories/task.repository");
const errors_1 = require("../utils/errors");
class SubtaskService {
    static async createSubtask(taskId, data) {
        const task = await task_repository_1.taskRepository.findById(taskId);
        if (!task) {
            throw new errors_1.NotFoundError('Task bulunamadı', 'TASK_NOT_FOUND');
        }
        return await subtask_repository_1.subtaskRepository.create(data, taskId);
    }
    static async getSubtasksByTask(taskId) {
        const task = await task_repository_1.taskRepository.findById(taskId);
        if (!task) {
            throw new errors_1.NotFoundError('Task bulunamadı', 'TASK_NOT_FOUND');
        }
        return await subtask_repository_1.subtaskRepository.findByTaskId(taskId);
    }
    static async updateSubtask(id, data) {
        const subtask = await subtask_repository_1.subtaskRepository.update(id, data);
        if (!subtask) {
            throw new errors_1.NotFoundError('Alt görev bulunamadı', 'SUBTASK_NOT_FOUND');
        }
        return subtask;
    }
    static async deleteSubtask(id) {
        const deleted = await subtask_repository_1.subtaskRepository.delete(id);
        if (!deleted) {
            throw new errors_1.NotFoundError('Alt görev bulunamadı', 'SUBTASK_NOT_FOUND');
        }
        return true;
    }
    static async toggleComplete(id) {
        const subtask = await subtask_repository_1.subtaskRepository.toggleComplete(id);
        if (!subtask) {
            throw new errors_1.NotFoundError('Alt görev bulunamadı', 'SUBTASK_NOT_FOUND');
        }
        return subtask;
    }
}
exports.SubtaskService = SubtaskService;
//# sourceMappingURL=subtask.service.js.map