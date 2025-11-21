import { activityRepository } from '../repositories/activity.repository';
import { CreateActivityLogDTO } from '../types/activity.types';

export class ActivityService {
    public async logActivity(data: CreateActivityLogDTO) {
        return await activityRepository.create(data);
    }

    public async getTaskHistory(taskId: string) {
        return await activityRepository.findByTaskId(taskId);
    }
}

export const activityService = new ActivityService();
