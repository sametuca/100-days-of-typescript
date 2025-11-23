import { subtaskRepository } from '../repositories/subtask.repository';
import { taskRepository } from '../repositories/task.repository';
import { Subtask, CreateSubtaskDto, UpdateSubtaskDto } from '../types/subtask.types';
import { NotFoundError } from '../utils/errors';

export class SubtaskService {
    public static async createSubtask(taskId: string, data: CreateSubtaskDto): Promise<Subtask> {
        const task = await taskRepository.findById(taskId);
        if (!task) {
            throw new NotFoundError('Task bulunamadı', 'TASK_NOT_FOUND');
        }

        return await subtaskRepository.create(data, taskId);
    }

    public static async getSubtasksByTask(taskId: string): Promise<Subtask[]> {
        const task = await taskRepository.findById(taskId);
        if (!task) {
            throw new NotFoundError('Task bulunamadı', 'TASK_NOT_FOUND');
        }

        return await subtaskRepository.findByTaskId(taskId);
    }

    public static async updateSubtask(id: string, data: UpdateSubtaskDto): Promise<Subtask> {
        const subtask = await subtaskRepository.update(id, data);
        if (!subtask) {
            throw new NotFoundError('Alt görev bulunamadı', 'SUBTASK_NOT_FOUND');
        }
        return subtask;
    }

    public static async deleteSubtask(id: string): Promise<boolean> {
        const deleted = await subtaskRepository.delete(id);
        if (!deleted) {
            throw new NotFoundError('Alt görev bulunamadı', 'SUBTASK_NOT_FOUND');
        }
        return true;
    }

    public static async toggleComplete(id: string): Promise<Subtask> {
        const subtask = await subtaskRepository.toggleComplete(id);
        if (!subtask) {
            throw new NotFoundError('Alt görev bulunamadı', 'SUBTASK_NOT_FOUND');
        }
        return subtask;
    }
}
