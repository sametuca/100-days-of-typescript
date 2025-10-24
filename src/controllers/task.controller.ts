// Controller = HTTP isteklerini yakalar, service'i çağırır, cevap döner
// Route → Controller → Service → Database

import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import { CreateTaskDto, UpdateTaskDto } from '../models/task.model';

export class TaskController {
  
  // Endpoint: GET /api/v1/tasks
  // 
  // Request → Controller → Service → Database → Service → Controller → Response
  
  public static async getAllTasks(_req: Request, res: Response): Promise<void> {
    
    try {
      
      const tasks = await TaskService.getAllTasks();
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
      
      // Request body'den veriyi al
      // req.body = POST ile gönderilen veri (JSON)
      // express.json() middleware'i sayesinde parse edilmiş
      // 
      // Örnek req.body:
      // {
      //   "title": "TypeScript Öğren",
      //   "description": "Her gün 2 saat",
      //   "priority": "HIGH"
      // }
      const taskData: CreateTaskDto = req.body;
      
      if (!taskData.title || taskData.title.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Task başlığı zorunludur'
        });
      }
      
      const newTask = await TaskService.createTask(taskData);
      
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