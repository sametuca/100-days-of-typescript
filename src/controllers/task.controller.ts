import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import { CreateTaskDto, UpdateTaskDto } from '../models/task.model';
import { TaskStatus, TaskPriority, TaskQueryParams } from '../types';
import { catchAsync } from '../middleware/error.middleware';
import logger from '../utils/logger';

export class TaskController {

  // Day 23: Gelişmiş task filtreleme ve arama
  public static getAllTasks = catchAsync(async (req: Request, res: Response): Promise<void> => {
    // Query parametrelerini parse et
    const queryParams: TaskQueryParams = {
      // Status array parsing
      status: req.query.status ?
        (Array.isArray(req.query.status) ?
          req.query.status as TaskStatus[] :
          [req.query.status as TaskStatus]) :
        undefined,

      // Priority array parsing  
      priority: req.query.priority ?
        (Array.isArray(req.query.priority) ?
          req.query.priority as TaskPriority[] :
          [req.query.priority as TaskPriority]) :
        undefined,

      search: req.query.search as string,
      userId: req.query.userId as string,
      projectId: req.query.projectId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,

      // Pagination
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,

      // Sorting
      sortBy: req.query.sortBy as 'createdAt' | 'updatedAt' | 'title' | 'priority',
      sortOrder: req.query.sortOrder as 'asc' | 'desc'
    };

    logger.info('Task query received', { queryParams });

    const result = await TaskService.getAllTasks(queryParams);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      filters: {
        applied: Object.keys(queryParams).filter(key =>
          queryParams[key as keyof TaskQueryParams] !== undefined
        ),
        totalResults: result.data.length
      }
    });
  });

  public static async getTaskById(req: Request, res: Response): Promise<any> {
    try {

      const { id } = req.params;

      const task = await TaskService.getTaskById(id);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: `ID ${id} ile task bulunamadı`
        });
      }

      res.status(200).json({
        success: true,
        data: task
      });

    } catch (error) {
      console.error('Error in getTaskById:', error);

      res.status(500).json({
        success: false,
        message: 'Task getirilemedi',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  }

  public static async createTask(req: Request, res: Response): Promise<any> {
    try {
      const taskData: CreateTaskDto = req.body;

      const userId = req.user!.userId;

      const newTask = await TaskService.createTask(taskData, userId);

      logger.info(`Task created: ${newTask.id} by user ${userId}`);

      res.status(201).json({
        success: true,
        message: 'Task başarıyla oluşturuldu',
        data: newTask
      });
    } catch (error) {
      console.error('Error in createTask:', error);

      res.status(500).json({
        success: false,
        message: 'Task oluşturulamadı',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  }
  public static async updateTask(req: Request, res: Response): Promise<any> {
    try {

      const { id } = req.params;

      const taskData: UpdateTaskDto = req.body;

      if (Object.keys(taskData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Güncellenecek alan belirtilmedi'
        });
      }

      const userId = req.user!.userId;
      const updatedTask = await TaskService.updateTask(id, taskData, userId);

      if (!updatedTask) {
        return res.status(404).json({
          success: false,
          message: `ID ${id} ile task bulunamadı`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Task başarıyla güncellendi',
        data: updatedTask
      });

    } catch (error) {
      console.error('Error in updateTask:', error);

      res.status(500).json({
        success: false,
        message: 'Task güncellenemedi',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  }

  public static async deleteTask(req: Request, res: Response): Promise<any> {
    try {

      const { id } = req.params;

      const deleted = await TaskService.deleteTask(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: `ID ${id} ile task bulunamadı`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Task başarıyla silindi'
      });

    } catch (error) {
      console.error('Error in deleteTask:', error);

      res.status(500).json({
        success: false,
        message: 'Task silinemedi',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  }

  public static uploadAttachment = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user!.userId;
    const file = req.file;

    if (!file) {
      res.status(400).json({
        success: false,
        message: 'Dosya yüklenmedi'
      });
      return;
    }

    const task = await TaskService.uploadAttachment(id, userId, file);

    res.status(200).json({
      success: true,
      message: 'Dosya başarıyla yüklendi',
      data: task
    });
  });

  // Day 23: Dashboard Analytics Endpoint
  public static getDashboard = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.query;

    logger.info('Dashboard analytics requested', { userId });

    const analytics = await TaskService.getDashboardAnalytics(userId as string);

    res.status(200).json({
      success: true,
      message: 'Dashboard analytics retrieved successfully',
      data: analytics
    });
  });
}


