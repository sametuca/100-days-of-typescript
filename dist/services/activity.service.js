"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityService = exports.ActivityService = void 0;
const activity_repository_1 = require("../repositories/activity.repository");
class ActivityService {
    async logActivity(data) {
        return await activity_repository_1.activityRepository.create(data);
    }
    async getTaskHistory(taskId) {
        return await activity_repository_1.activityRepository.findByTaskId(taskId);
    }
}
exports.ActivityService = ActivityService;
exports.activityService = new ActivityService();
//# sourceMappingURL=activity.service.js.map