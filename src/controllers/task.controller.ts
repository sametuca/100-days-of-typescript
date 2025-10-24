// ============================================
// TASK CONTROLLER
// ============================================
// Controller = HTTP isteklerini yakalar, service'i çağırır, cevap döner
// Route → Controller → Service → Database

// Express tiplerini import et
import { Request, Response } from 'express';

// Task service'ini import et
import { TaskService } from '../services/task.service';

// Task tiplerini import et
import { CreateTaskDto } from '../models/task.model';

export class TaskController {
  
  // Endpoint: GET /api/v1/tasks
  // 
  // Request → Controller → Service → Database → Service → Controller → Response
  
  public static async getAllTasks(_req: Request, res: Response): Promise<void> {
    
    try {
      
      const tasks = await TaskService.getAllTasks();
      
      // Başarılı cevap döndür
      // 200 = OK (Başarılı)
      // res.json() = JSON formatında cevap gönder
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
      
      // URL'den ID'yi al
      // req.params = URL parametreleri (/tasks/:id → :id)
      // Örnek: /tasks/1 → req.params.id = "1"
      const { id } = req.params;
      
      // Service'den task'ı al
      const task = await TaskService.getTaskById(id);
      
      // Task bulunamadıysa (null dönerse)
      if (!task) {
        // 404 = Not Found (Bulunamadı)
        return res.status(404).json({
          success: false,
          message: `ID ${id} ile task bulunamadı`
        });
      }
      
      // Task bulunduysa başarılı cevap döndür
      // 200 = OK
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

  // ==========================================
  // CREATE TASK - YENİ TASK OLUŞTUR
  // ==========================================
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
      
      // Basit validation (doğrulama)
      // title yoksa veya boşsa hata döndür
      if (!taskData.title || taskData.title.trim() === '') {
        // 400 = Bad Request (Geçersiz istek)
        return res.status(400).json({
          success: false,
          message: 'Task başlığı zorunludur'
        });
      }
      
      // Service ile yeni task oluştur
      const newTask = await TaskService.createTask(taskData);
      
      // Başarılı cevap döndür
      // 201 = Created (Oluşturuldu)
      // 200 yerine 201 kullanmak REST best practice
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
}