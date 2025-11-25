import { PaginatedResult, PaginationUtil } from '../utils/pagination';
import { taskRepository } from '../repositories/task.repository';
import { Task, CreateTaskDto, UpdateTaskDto, TaskStatus, TaskPriority, TaskQueryParams, TaskFilter, DashboardAnalytics } from '../types';
import { NotFoundError, AuthorizationError } from '../utils/errors';
import logger from '../utils/logger';
import { activityService } from './activity.service';
import { webSocketService } from './websocket.service';

export class TaskService {

  public static async getAllTasks(queryParams: TaskQueryParams): Promise<PaginatedResult<Task>> {
    const validatedParams = PaginationUtil.validateParams({
      page: queryParams.page,
      limit: queryParams.limit
    });

    const filters: TaskFilter = {
      userId: queryParams.userId,
      search: queryParams.search,
      startDate: queryParams.startDate ? new Date(queryParams.startDate) : undefined,
      endDate: queryParams.endDate ? new Date(queryParams.endDate) : undefined,
      status: Array.isArray(queryParams.status) ? queryParams.status :
        queryParams.status ? [queryParams.status] : undefined,
      priority: Array.isArray(queryParams.priority) ? queryParams.priority :
        queryParams.priority ? [queryParams.priority] : undefined,
    };

    const { tasks, total } = await taskRepository.findAllPaginated(
      validatedParams.page,
      validatedParams.limit,
      filters,
      {
        sortBy: queryParams.sortBy || 'createdAt',
        sortOrder: queryParams.sortOrder || 'desc'
      }
    );

    const paginationMeta = PaginationUtil.createMeta(
      validatedParams.page,
      validatedParams.limit,
      total
    );

    logger.info(`Retrieved ${tasks.length} tasks with filters`, { filters, total });

    return {
      data: tasks,
      pagination: paginationMeta
    };
  }

  public static async getTaskById(id: string): Promise<Task | null> {
    return await taskRepository.findById(id);
  }

  public static async createTask(
    taskData: CreateTaskDto,
    userId: string
  ): Promise<Task> {
    const task = await taskRepository.create(taskData, userId);
    
    // Day 27: Real-time notification
    if (webSocketService) {
      webSocketService.notifyUser(userId, 'task_created', {
        taskId: task.id,
        title: task.title,
        message: 'Yeni görev oluşturuldu'
      });
    }
    
    return task;
  }

  public static async updateTask(
    id: string,
    taskData: UpdateTaskDto,
    userId?: string
  ): Promise<Task | null> {
    const oldTask = await taskRepository.findById(id);
    if (!oldTask) return null;

    const updatedTask = await taskRepository.update(id, taskData);

    // Day 24: Activity Logging
    if (updatedTask && userId) {
      // Status change
      if (oldTask.status !== updatedTask.status) {
        await activityService.logActivity({
          task_id: id,
          user_id: userId,
          action_type: 'STATUS_CHANGE',
          details: { from: oldTask.status, to: updatedTask.status }
        });
      }

      // Priority change
      if (oldTask.priority !== updatedTask.priority) {
        await activityService.logActivity({
          task_id: id,
          user_id: userId,
          action_type: 'PRIORITY_CHANGE',
          details: { from: oldTask.priority, to: updatedTask.priority }
        });
      }
    }

    // Day 27: Real-time notification for task updates
    if (updatedTask && userId && webSocketService) {
      webSocketService.notifyUser(userId, 'task_updated', {
        taskId: id,
        title: updatedTask.title,
        status: updatedTask.status,
        message: 'Görev güncellendi'
      });
    }

    return updatedTask;
  }

  public static async deleteTask(id: string): Promise<boolean> {
    return await taskRepository.delete(id);
  }

  public static async getTasksByUser(userId: string): Promise<Task[]> {
    return await taskRepository.findByUserId(userId);
  }

  public static async getTasksByProject(projectId: string): Promise<Task[]> {
    return await taskRepository.findByProjectId(projectId);
  }

  public static async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    return await taskRepository.findByStatus(status);
  }

  public static async searchTasks(query: string): Promise<Task[]> {
    return await taskRepository.search(query);
  }

  public static async getTasksWithFilters(filters: {
    userId?: string;
    projectId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    search?: string;
  }): Promise<Task[]> {
    return await taskRepository.findWithFilters(filters);
  }

  public static async getTaskStatistics(userId?: string) {
    const tasks = userId
      ? await taskRepository.findByUserId(userId)
      : await taskRepository.findAll();

    return {
      total: tasks.length,

      byStatus: {
        todo: tasks.filter(t => t.status === TaskStatus.TODO).length,
        inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
        done: tasks.filter(t => t.status === TaskStatus.DONE).length,
        cancelled: tasks.filter(t => t.status === TaskStatus.CANCELLED).length
      },

      byPriority: {
        low: tasks.filter(t => t.priority === TaskPriority.LOW).length,
        medium: tasks.filter(t => t.priority === TaskPriority.MEDIUM).length,
        high: tasks.filter(t => t.priority === TaskPriority.HIGH).length,
        urgent: tasks.filter(t => t.priority === TaskPriority.URGENT).length
      },

      overdue: tasks.filter(t => {
        if (!t.dueDate) return false;
        if (t.status === TaskStatus.DONE || t.status === TaskStatus.CANCELLED) return false;
        return new Date(t.dueDate) < new Date();
      }).length
    };
  }

  public static async uploadAttachment(
    taskId: string,
    userId: string,
    _file: Express.Multer.File
  ): Promise<Task> {
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundError('Task bulunamadı', 'TASK_NOT_FOUND');
    }

    if (task.userId !== userId) {
      throw new AuthorizationError('Bu task size ait değil', 'UNAUTHORIZED');
    }

    logger.info(`Attachment uploaded for task: ${taskId}`);

    const attachment = {
      filename: _file.filename,
      path: _file.path,
      mimetype: _file.mimetype,
      size: _file.size,
      uploadedAt: new Date()
    };

    const updatedTask = await taskRepository.addAttachment(taskId, attachment);
    if (!updatedTask) {
      throw new Error('Attachment could not be added');
    }

    return updatedTask;
  }

  public static async getDashboardAnalytics(userId?: string): Promise<DashboardAnalytics> {
    const allTasksQuery: TaskQueryParams = {
      userId: userId,
      page: 1,
      limit: 1000
    };

    const { data: allTasks } = await this.getAllTasks(allTasksQuery);

    const taskStats = {
      total: allTasks.length,
      completed: allTasks.filter(t => t.status === TaskStatus.DONE).length,
      inProgress: allTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      todo: allTasks.filter(t => t.status === TaskStatus.TODO).length,
      cancelled: allTasks.filter(t => t.status === TaskStatus.CANCELLED).length,
      completionRate: 0
    };

    taskStats.completionRate = taskStats.total > 0
      ? Math.round((taskStats.completed / taskStats.total) * 100)
      : 0;

    const priorityStats = {
      low: allTasks.filter(t => t.priority === TaskPriority.LOW).length,
      medium: allTasks.filter(t => t.priority === TaskPriority.MEDIUM).length,
      high: allTasks.filter(t => t.priority === TaskPriority.HIGH).length,
      urgent: allTasks.filter(t => t.priority === TaskPriority.URGENT).length,
    };

    const recentTasks = allTasks
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const completedTasks = allTasks.filter(t => t.status === TaskStatus.DONE);

    const productivity = {
      tasksCompletedToday: completedTasks.filter(t =>
        new Date(t.updatedAt) >= todayStart
      ).length,
      tasksCompletedThisWeek: completedTasks.filter(t =>
        new Date(t.updatedAt) >= weekStart
      ).length,
      tasksCompletedThisMonth: completedTasks.filter(t =>
        new Date(t.updatedAt) >= monthStart
      ).length,
      averageCompletionTime: undefined
    };

    logger.info('Dashboard analytics generated', {
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