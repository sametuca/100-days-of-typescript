"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskReminderJob = void 0;
const task_repository_1 = require("../repositories/task.repository");
const user_repository_1 = require("../repositories/user.repository");
const email_service_1 = require("../services/email.service");
const types_1 = require("../types");
const logger_1 = __importDefault(require("../utils/logger"));
class TaskReminderJob {
    static async sendReminders() {
        logger_1.default.info('Starting task reminder job...');
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const dayAfter = new Date(tomorrow);
            dayAfter.setDate(dayAfter.getDate() + 1);
            const allTasks = await task_repository_1.taskRepository.findAll();
            const upcomingTasks = allTasks.filter(task => {
                if (!task.dueDate)
                    return false;
                if (task.status === types_1.TaskStatus.DONE)
                    return false;
                if (task.status === types_1.TaskStatus.CANCELLED)
                    return false;
                const dueDate = new Date(task.dueDate);
                return dueDate >= tomorrow && dueDate < dayAfter;
            });
            logger_1.default.info(`Found ${upcomingTasks.length} tasks with upcoming deadlines`);
            let sentCount = 0;
            for (const task of upcomingTasks) {
                const user = await user_repository_1.userRepository.findById(task.userId);
                if (!user || !user.isActive)
                    continue;
                const sent = await email_service_1.emailService.sendTaskReminderEmail(user.email, user.firstName || user.username, task.title, new Date(task.dueDate));
                if (sent) {
                    sentCount++;
                    logger_1.default.info(`Reminder sent to ${user.email} for task: ${task.title}`);
                }
                await this.delay(1000);
            }
            logger_1.default.info(`Task reminder job completed: ${sentCount}/${upcomingTasks.length} emails sent`);
        }
        catch (error) {
            logger_1.default.error('Task reminder job failed:', error);
        }
    }
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.TaskReminderJob = TaskReminderJob;
//# sourceMappingURL=task-reminder.job.js.map