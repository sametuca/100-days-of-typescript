// ============================================
// TASK SERVICE (UPDATED - SQLite Version)
// ============================================
// Business logic katmanı
// Artık in-memory array yerine SQLite kullanıyor

// Repository'i import et
import { taskRepository } from '../repositories/task.repository';

// Task tiplerini import et
import { Task, CreateTaskDto, UpdateTaskDto, TaskStatus, TaskPriority } from '../types';

// ==========================================
// TASK SERVICE CLASS
// ==========================================

export class TaskService {
  
  // ==========================================
  // GET ALL TASKS
  // ==========================================
  // Tüm taskları getir
  
  public static async getAllTasks(): Promise<Task[]> {
    // Repository'den tüm taskları al
    // Artık database'den geliyor (SQLite)
    return await taskRepository.findAll();
  }
  
  // ==========================================
  // GET TASK BY ID
  // ==========================================
  // ID'ye göre tek task getir
  
  public static async getTaskById(id: string): Promise<Task | null> {
    return await taskRepository.findById(id);
  }
  
  // ==========================================
  // CREATE TASK
  // ==========================================
  // Yeni task oluştur
  
  public static async createTask(
    taskData: CreateTaskDto,
    userId: string
  ): Promise<Task> {
    // Repository'i kullanarak database'e ekle
    return await taskRepository.create(taskData, userId);
  }
  
  // ==========================================
  // UPDATE TASK
  // ==========================================
  // Task güncelle
  
  public static async updateTask(
    id: string,
    taskData: UpdateTaskDto
  ): Promise<Task | null> {
    return await taskRepository.update(id, taskData);
  }
  
  // ==========================================
  // DELETE TASK
  // ==========================================
  // Task sil
  
  public static async deleteTask(id: string): Promise<boolean> {
    return await taskRepository.delete(id);
  }
  
  // ==========================================
  // GET TASKS BY USER
  // ==========================================
  // Belirli kullanıcının taskları
  
  public static async getTasksByUser(userId: string): Promise<Task[]> {
    return await taskRepository.findByUserId(userId);
  }
  
  // ==========================================
  // GET TASKS BY PROJECT
  // ==========================================
  // Belirli projenin taskları
  
  public static async getTasksByProject(projectId: string): Promise<Task[]> {
    return await taskRepository.findByProjectId(projectId);
  }
  
  // ==========================================
  // GET TASKS BY STATUS
  // ==========================================
  // Belirli status'teki tasklar
  
  public static async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    return await taskRepository.findByStatus(status);
  }
  
  // ==========================================
  // SEARCH TASKS
  // ==========================================
  // Başlık/açıklamada arama
  
  public static async searchTasks(query: string): Promise<Task[]> {
    return await taskRepository.search(query);
  }
  
  // ==========================================
  // GET TASKS WITH FILTERS
  // ==========================================
  // Çoklu filtre ile arama
  
  public static async getTasksWithFilters(filters: {
    userId?: string;
    projectId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    search?: string;
  }): Promise<Task[]> {
    return await taskRepository.findWithFilters(filters);
  }
  
  // ==========================================
  // GET TASK STATISTICS
  // ==========================================
  // Task istatistikleri
  
  public static async getTaskStatistics(userId?: string) {
    // Kullanıcıya göre filtrele (varsa)
    const tasks = userId 
      ? await taskRepository.findByUserId(userId)
      : await taskRepository.findAll();
    
    // İstatistikleri hesapla
    return {
      // Toplam
      total: tasks.length,
      
      // Status'e göre
      byStatus: {
        todo: tasks.filter(t => t.status === TaskStatus.TODO).length,
        inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
        done: tasks.filter(t => t.status === TaskStatus.DONE).length,
        cancelled: tasks.filter(t => t.status === TaskStatus.CANCELLED).length
      },
      
      // Priority'ye göre
      byPriority: {
        low: tasks.filter(t => t.priority === TaskPriority.LOW).length,
        medium: tasks.filter(t => t.priority === TaskPriority.MEDIUM).length,
        high: tasks.filter(t => t.priority === TaskPriority.HIGH).length,
        urgent: tasks.filter(t => t.priority === TaskPriority.URGENT).length
      },
      
      // Overdue (süresi geçmiş)
      overdue: tasks.filter(t => {
        if (!t.dueDate) return false;
        if (t.status === TaskStatus.DONE || t.status === TaskStatus.CANCELLED) return false;
        return new Date(t.dueDate) < new Date();
      }).length
    };
  }
}