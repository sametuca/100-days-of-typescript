import { taskRepository } from '../repositories/task.repository';
import { userRepository } from '../repositories/user.repository';
import { emailService } from '../services/email.service';
import { TaskStatus } from '../types';
import logger from '../utils/logger';

export class TaskReminderJob {
  
  public static async sendReminders(): Promise<void> {
    logger.info('📧 Starting task reminder job...');

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);

      const allTasks = await taskRepository.findAll();

      const upcomingTasks = allTasks.filter(task => {
        if (!task.dueDate) return false;
        if (task.status === TaskStatus.DONE) return false;
        if (task.status === TaskStatus.CANCELLED) return false;

        const dueDate = new Date(task.dueDate);
        return dueDate >= tomorrow && dueDate < dayAfter;
      });

      logger.info(`Found ${upcomingTasks.length} tasks with upcoming deadlines`);

      let sentCount = 0;

      for (const task of upcomingTasks) {
        const user = await userRepository.findById(task.userId);

        if (!user || !user.isActive) continue;

        const sent = await emailService.sendTaskReminderEmail(
          user.email,
          user.firstName || user.username,
          task.title,
          new Date(task.dueDate!)
        );

        if (sent) {
          sentCount++;
          logger.info(`📧 Reminder sent to ${user.email} for task: ${task.title}`);
        }

        await this.delay(1000);
      }

      logger.info(`✅ Task reminder job completed: ${sentCount}/${upcomingTasks.length} emails sent`);
    } catch (error) {
      logger.error('❌ Task reminder job failed:', error);
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}