// ============================================
// TASK SERVICE
// ============================================
// Service = İş mantığı (business logic)
// Veritabanı işlemleri burada yapılır

// Task tiplerini import et
import { Task, CreateTaskDto, UpdateTaskDto } from '../models/task.model';
import { TaskStatus, TaskPriority } from '../types';

export class TaskService {
  
  // ------------------------------------------
  // IN-MEMORY DATABASE (FAKE DATABASE)
  // ------------------------------------------
  // static = Tüm instance'lar aynı veriyi paylaşır
  private static tasks: Task[] = [
    {
      id: '1',
      title: 'TypeScript Öğren',
      description: '100 Days of Code projesi',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user1'
    },
    {
      id: '2',
      title: 'Express.js Çalış',
      description: 'REST API oluşturmayı öğren',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user1'
    }
  ];
  
  // Counter = Yeni task için ID oluşturmak için
  // Her yeni task'ta 1 artacak (3, 4, 5, ...)
  private static idCounter: number = 3;

  // ==========================================
  // GET ALL TASKS - TÜM TASKLARI GETİR
  // ==========================================
  // static = Class'ı oluşturmadan çağrılabilir
  // async = Asenkron işlem (Promise döner)
  // Promise<Task[]> = Task listesi döndürecek
  public static async getAllTasks(): Promise<Task[]> {
    return this.tasks;
  }

  // ==========================================
  // GET TASK BY ID - ID'YE GÖRE TASK GETİR
  // ==========================================
  // id: string = Aranacak task'ın ID'si
  // Promise<Task | null> = Ya Task bulacak ya da null döndürecek
  public static async getTaskById(id: string): Promise<Task | null> {
    
    // this.tasks.find() = Array içinde arama yap
    // (task) => task.id === id = Her task için:
    //   Eğer task'ın id'si aranan id'ye eşitse bunu döndür
    // 
    // Örnek:
    // getTaskById('1') → id'si '1' olan task'ı bulur
    // getTaskById('999') → Bulamazsa undefined döner
    
    const task = this.tasks.find((task) => task.id === id);
    
    return task || null;
  }

  // ==========================================
  // CREATE TASK - YENİ TASK OLUŞTUR
  // ==========================================
  // taskData: CreateTaskDto = İstemciden gelen veri
  // Promise<Task> = Oluşturulan task'ı döndürecek
  public static async createTask(taskData: CreateTaskDto): Promise<Task> {
    
    // Yeni task objesi oluştur
    const newTask: Task = {
      id: String(this.idCounter++),
      title: taskData.title,
      description: taskData.description,
      status: taskData.status || TaskStatus.TODO,
      priority: taskData.priority || TaskPriority.MEDIUM,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user1'
    };

    this.tasks.push(newTask);
    
    return newTask;
  }

   public static async updateTask(
    id: string, 
    taskData: UpdateTaskDto
  ): Promise<Task | null> {
    
    // Task'ı bul
    // findIndex = Array içinde index'i bul
    // (task) => task.id === id = Her task için:
    //   Eğer ID eşleşirse bu index'i döndür
    const taskIndex = this.tasks.findIndex((task) => task.id === id);
    
    // Task bulunamadıysa
    // findIndex bulamazsa -1 döner
    if (taskIndex === -1) {
      // null döndür (task yok)
      return null;
    }
    
    // Mevcut task'ı al
    // this.tasks[taskIndex] = Array'den o index'teki elemanı al
    const existingTask = this.tasks[taskIndex];
    
    // Task'ı güncelle
    // ... = Spread operator (objeyi aç)
    // Önce mevcut task'ın tüm alanlarını kopyala
    // Sonra taskData'daki alanları üzerine yaz (override)
    const updatedTask: Task = {
      ...existingTask,          // Eski tüm alanlar
      ...taskData,              // Yeni gönderilen alanlar (üzerine yazar)
      updatedAt: new Date()     // updatedAt'i güncelle
    };
    
    // Array'deki task'ı güncelle
    // this.tasks[taskIndex] = O index'teki elemanı değiştir
    this.tasks[taskIndex] = updatedTask;
    
    // Güncellenmiş task'ı döndür
    return updatedTask;
  }

  // ==========================================
  // DELETE TASK - TASK SİL
  // ==========================================
  // id: string = Silinecek task'ın ID'si
  // Promise<boolean> = Başarılı ise true, değilse false
  
  public static async deleteTask(id: string): Promise<boolean> {
    
    // Task'ın index'ini bul
    const taskIndex = this.tasks.findIndex((task) => task.id === id);
    
    // Task bulunamadıysa
    if (taskIndex === -1) {
      // false döndür (silinemedi, task yok)
      return false;
    }
    
    // Task'ı array'den sil
    // splice(index, count) = index'ten başlayarak count kadar eleman sil
    // splice(taskIndex, 1) = taskIndex'teki 1 elemanı sil
    // 
    // Örnek:
    // tasks = [task1, task2, task3]
    // splice(1, 1) → task2'yi sil
    // tasks = [task1, task3]
    this.tasks.splice(taskIndex, 1);
    
    // true döndür (başarıyla silindi)
    return true;
  }
}