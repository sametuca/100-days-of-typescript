// Controller = HTTP isteklerini yakalar, service'i çağırır, cevap döner
// Route → Controller → Service → Database

import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import { CreateTaskDto, UpdateTaskDto } from '../models/task.model';
import { TaskStatus, TaskPriority } from '@/types';

export class TaskController {
  
  // Endpoint: GET /api/v1/tasks
  // 
  // Request → Controller → Service → Database → Service → Controller → Response
  
    public static async getAllTasks(req: Request, res: Response): Promise<void> {
    try {
      
      // ==========================================
      // QUERY PARAMETERS
      // ==========================================
      // URL'den query parametrelerini al
      // Örnek: /tasks?status=TODO&priority=HIGH
      
      const { status, priority, search, userId, projectId } = req.query;
      
      // Filtre objesi oluştur
      const filters: any = {};
      
      // status parametresi varsa ekle
      if (status) {
        filters.status = status as TaskStatus;
      }
      
      // priority parametresi varsa ekle
      if (priority) {
        filters.priority = priority as TaskPriority;
      }
      
      // search parametresi varsa ekle
      if (search) {
        filters.search = search as string;
      }
      
      // userId parametresi varsa ekle
      if (userId) {
        filters.userId = userId as string;
      }
      
      // projectId parametresi varsa ekle
      if (projectId) {
        filters.projectId = projectId as string;
      }
      
      // Filtre varsa filtrelenmiş taskları al, yoksa tümünü al
      const tasks = Object.keys(filters).length > 0
        ? await TaskService.getTasksWithFilters(filters)
        : await TaskService.getAllTasks();
      
      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
      });
      
    } catch (error) {
      console.error('Error in getAllTasks:', error);
      
      res.status(500).json({
        success: false,
        message: 'Tasklar getirilemedi',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  }

  // Endpoint: GET /api/v1/tasks/:id
  // Örnek: GET /api/v1/tasks/1

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

  // Endpoint: POST /api/v1/tasks
  // Body: { "title": "Yeni Task", "description": "Açıklama" }
  
  public static async createTask(req: Request, res: Response): Promise<any> {
    try {
      
      const taskData: CreateTaskDto = req.body;
      
      if (!taskData.title || taskData.title.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Task başlığı zorunludur'
        });
      }
      
      // Şimdilik sabit user ID (ileride JWT'den gelecek)
      const userId = 'user_1';
      
      const newTask = await TaskService.createTask(taskData, userId);
      
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

  // Endpoint: PUT /api/v1/tasks/:id
  // Body: { "title": "Yeni Başlık", "status": "DONE" }
  
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
      
      const updatedTask = await TaskService.updateTask(id, taskData);
      
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

  // Endpoint: DELETE /api/v1/tasks/:id
  
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
}