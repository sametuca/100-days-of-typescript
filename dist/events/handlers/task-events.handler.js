"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskEventHandler = void 0;
const event_emitter_1 = require("../event-emitter");
const email_service_1 = require("../../services/email.service");
const user_service_1 = require("../../services/user.service");
const logger_1 = __importDefault(require("../../utils/logger"));
class TaskEventHandler {
    static init() {
        event_emitter_1.eventEmitter.on('task.created', this.handleTaskCreated);
        event_emitter_1.eventEmitter.on('task.updated', this.handleTaskUpdated);
        event_emitter_1.eventEmitter.on('task.completed', this.handleTaskCompleted);
        event_emitter_1.eventEmitter.on('task.assigned', this.handleTaskAssigned);
    }
    static async handleTaskCreated(event) {
        try {
            const { task, createdBy } = event.payload;
            logger_1.default.info(`Task created: ${task.title}`, { taskId: task.id, createdBy });
            if (task.assignedToId && task.assignedToId !== createdBy) {
                const assignee = await user_service_1.UserService.getProfile(task.assignedToId);
                if (assignee?.email) {
                    await email_service_1.emailService.sendTaskAssignedEmail(assignee.email, task);
                }
            }
        }
        catch (error) {
            logger_1.default.error('Error handling task created event:', error);
        }
    }
    static async handleTaskUpdated(event) {
        try {
            const { task, updatedBy, changes } = event.payload;
            logger_1.default.info(`Task updated: ${task.title}`, { taskId: task.id, updatedBy, changes });
        }
        catch (error) {
            logger_1.default.error('Error handling task updated event:', error);
        }
    }
    static async handleTaskCompleted(event) {
        try {
            const { task, completedBy } = event.payload;
            logger_1.default.info(`Task completed: ${task.title}`, { taskId: task.id, completedBy });
            const user = await user_service_1.UserService.getProfile(completedBy);
            if (user?.email) {
                await email_service_1.emailService.sendTaskCompletedEmail(user.email, task);
            }
        }
        catch (error) {
            logger_1.default.error('Error handling task completed event:', error);
        }
    }
    static async handleTaskAssigned(event) {
        try {
            const { task, assignedTo, assignedBy } = event.payload;
            logger_1.default.info(`Task assigned: ${task.title}`, { taskId: task.id, assignedTo, assignedBy });
            const assignee = await user_service_1.UserService.getProfile(assignedTo);
            if (assignee?.email) {
                await email_service_1.emailService.sendTaskAssignedEmail(assignee.email, task);
            }
        }
        catch (error) {
            logger_1.default.error('Error handling task assigned event:', error);
        }
    }
}
exports.TaskEventHandler = TaskEventHandler;
//# sourceMappingURL=task-events.handler.js.map