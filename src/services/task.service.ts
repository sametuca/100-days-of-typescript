import { PaginatedResult, PaginationUtil } from '@/utils/pagination';
import { taskRepository } from '../repositories/task.repository';
import { Task, CreateTaskDto, UpdateTaskDto, TaskStatus, TaskPriority } from '../types';

export class TaskService {
  
public static async getAllTasks(
    page?: number,
    limit?: number,
    filters?: {
      userId?: string;
      projectId?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      search?: string;
    }
  ): Promise<PaginatedResult<Task>> {
    const validatedParams = PaginationUtil.validateParams({ page, limit });

    const { tasks, total } = await taskRepository.findAllPaginated(
      validatedParams.page,
      validatedParams.limit,
      filters
    );

    const paginationMeta = PaginationUtil.createMeta(
      validatedParams.page,
      validatedParams.limit,
      total
    );

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
    return await taskRepository.create(taskData, userId);
  }
  
  public static async updateTask(
    id: string,
    taskData: UpdateTaskDto
  ): Promise<Task | null> {
    return await taskRepository.update(id, taskData);
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
}