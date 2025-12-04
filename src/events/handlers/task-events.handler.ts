import { eventEmitter, AppEvent } from '../event-emitter';
import { emailService } from '../../services/email.service';
import { UserService } from '../../services/user.service';
import logger from '../../utils/logger';

export class TaskEventHandler {
  static init() {
    eventEmitter.on('task.created', this.handleTaskCreated);
    eventEmitter.on('task.updated', this.handleTaskUpdated);
    eventEmitter.on('task.completed', this.handleTaskCompleted);
    eventEmitter.on('task.assigned', this.handleTaskAssigned);
  }

  private static async handleTaskCreated(event: AppEvent) {
    try {
      const { task, createdBy } = event.payload;
      logger.info(`Task created: ${task.title}`, { taskId: task.id, createdBy });
      
      if (task.assignedToId && task.assignedToId !== createdBy) {
        const assignee = await UserService.getProfile(task.assignedToId);
        if (assignee?.email) {
          await emailService.sendTaskAssignedEmail(assignee.email, task);
        }
      }
    } catch (error) {
      logger.error('Error handling task created event:', error);
    }
  }

  private static async handleTaskUpdated(event: AppEvent) {
    try {
      const { task, updatedBy, changes } = event.payload;
      logger.info(`Task updated: ${task.title}`, { taskId: task.id, updatedBy, changes });
    } catch (error) {
      logger.error('Error handling task updated event:', error);
    }
  }

  private static async handleTaskCompleted(event: AppEvent) {
    try {
      const { task, completedBy } = event.payload;
      logger.info(`Task completed: ${task.title}`, { taskId: task.id, completedBy });
      
      const user = await UserService.getProfile(completedBy);
      if (user?.email) {
        await emailService.sendTaskCompletedEmail(user.email, task);
      }
    } catch (error) {
      logger.error('Error handling task completed event:', error);
    }
  }

  private static async handleTaskAssigned(event: AppEvent) {
    try {
      const { task, assignedTo, assignedBy } = event.payload;
      logger.info(`Task assigned: ${task.title}`, { taskId: task.id, assignedTo, assignedBy });
      
      const assignee = await UserService.getProfile(assignedTo);
      if (assignee?.email) {
        await emailService.sendTaskAssignedEmail(assignee.email, task);
      }
    } catch (error) {
      logger.error('Error handling task assigned event:', error);
    }
  }
}