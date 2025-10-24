// ============================================
// TASK SERVICE
// ============================================
// Service = İş mantığı (business logic)
// Veritabanı işlemleri burada yapılır

// Task tiplerini import et
import { Task, CreateTaskDto } from '../models/task.model';
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
}