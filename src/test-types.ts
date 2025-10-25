// ============================================
// TYPE SYSTEM TEST FILE
// ============================================
// TypeScript'in type system'ini test etmek için
// Bu dosya çalıştırılmayacak, sadece type kontrol için

import { 
  Task, 
  User, 
  Project, 
  TaskStatus, 
  TaskPriority,
  UserRole,
  ApiResponse,
  TaskSummary,
  SafeUser
} from './types';

// ==========================================
// 1. BASIC TYPES
// ==========================================

// string type
const taskTitle: string = "TypeScript Öğren";

// number type
const taskId: number = 123;

// boolean type
const isCompleted: boolean = true;

// Date type
const createdDate: Date = new Date();

// ==========================================
// 2. ENUM USAGE
// ==========================================

// Enum değeri kullan
const status: TaskStatus = TaskStatus.TODO;
const priority: TaskPriority = TaskPriority.HIGH;
const role: UserRole = UserRole.ADMIN;

// ❌ HATA: Geçersiz enum değeri
// const wrongStatus: TaskStatus = "WRONG"; // TypeScript hata verir

// ==========================================
// 3. INTERFACE USAGE
// ==========================================

// Task objesi oluştur
const task: Task = {
  id: "1",
  title: "TypeScript Öğren",
  description: "100 Days of Code",
  status: TaskStatus.IN_PROGRESS,
  priority: TaskPriority.HIGH,
  userId: "user1",
  projectId: "project1",
  createdAt: new Date(),
  updatedAt: new Date()
};

// User objesi oluştur
const user: User = {
  id: "user1",
  email: "user@example.com",
  username: "johndoe",
  passwordHash: "hashed_password",
  firstName: "John",
  lastName: "Doe",
  role: UserRole.USER,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

// ==========================================
// 4. OPTIONAL PROPERTIES
// ==========================================

// description opsiyonel, olmayabilir
const taskWithoutDesc: Task = {
  id: "2",
  title: "Sadece Başlık",
  // description yok ✅ (optional)
  status: TaskStatus.TODO,
  priority: TaskPriority.LOW,
  userId: "user1",
  createdAt: new Date(),
  updatedAt: new Date()
};

// ==========================================
// 5. GENERIC TYPES
// ==========================================

// ApiResponse<Task> = Task tipinde response
const taskResponse: ApiResponse<Task> = {
  success: true,
  data: task
};

// ApiResponse<User> = User tipinde response
const userResponse: ApiResponse<User> = {
  success: true,
  data: user
};

// ApiResponse<string> = String tipinde response
const messageResponse: ApiResponse<string> = {
  success: true,
  data: "İşlem başarılı"
};

// ==========================================
// 6. UTILITY TYPES
// ==========================================

// Pick - Sadece belirli alanları al
const taskSummary: TaskSummary = {
  id: task.id,
  title: task.title,
  status: task.status,
  priority: task.priority
};

// Omit - Belirli alanları çıkar
const safeUser: SafeUser = {
  id: user.id,
  email: user.email,
  username: user.username,
  // passwordHash yok ✅ (Omit ile çıkarıldı)
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
};

// Partial - Tüm alanları opsiyonel yap
const partialTask: Partial<Task> = {
  title: "Sadece başlık"
  // Diğer alanlar yok ✅ (Partial ile opsiyonel)
};

// Required - Tüm alanları zorunlu yap
// const requiredTask: Required<Task> = {
//   // Tüm alanlar olmalı, yoksa hata
// };

// ==========================================
// 7. UNION TYPES
// ==========================================

// string VEYA number olabilir
let idOrNumber: string | number;
idOrNumber = "123";      // ✅
idOrNumber = 123;        // ✅
// idOrNumber = true;    // ❌ boolean olamaz

// Multiple union
type Status = 'ACTIVE' | 'INACTIVE' | 'PENDING';
let projectStatus: Status;
projectStatus = 'ACTIVE';     // ✅
// projectStatus = 'WRONG';   // ❌

// ==========================================
// 8. INTERSECTION TYPES
// ==========================================

// İki tip'i birleştir
type Named = { name: string };
type Aged = { age: number };
type Person = Named & Aged;

const person: Person = {
  name: "Ali",
  age: 25
  // Her iki tip'in de alanları olmalı
};

// ==========================================
// 9. TYPE GUARDS
// ==========================================

// Runtime'da tip kontrolü
function processEntity(entity: Task | User) {
  // 'title' in entity = entity içinde 'title' var mı?
  if ('title' in entity) {
    // Bu blokta entity Task olarak kabul edilir
    console.log(entity.title);
  } else {
    // Bu blokta entity User olarak kabul edilir
    console.log(entity.username);
  }
}

// ==========================================
// 10. FUNCTION TYPES
// ==========================================

// Function tip tanımı
type TaskValidator = (task: Task) => boolean;

// Bu tipe uygun function
const isValidTask: TaskValidator = (task) => {
  return task.title.length > 0;
};

// Arrow function with types
const getTitles = (tasks: Task[]): string[] => {
  // map = Her eleman için dönüşüm yap
  return tasks.map(task => task.title);
};

// ==========================================
// 11. ARRAY TYPES
// ==========================================

// Array tanımları
const numbers: number[] = [1, 2, 3];
const strings: Array<string> = ["a", "b", "c"];
const tasks: Task[] = [task];

// Tuple (sabit uzunluklu array)
const coordinate: [number, number] = [10, 20];
const response: [boolean, string] = [true, "Success"];

// ==========================================
// 12. READONLY
// ==========================================

// Readonly = Değiştirilemez
const readonlyTask: Readonly<Task> = task;
// readonlyTask.title = "Yeni"; // ❌ Değiştirilemez

const readonlyArray: ReadonlyArray<number> = [1, 2, 3];
// readonlyArray.push(4); // ❌ Değiştirilemez

// ==========================================
// 13. ASYNC/PROMISE TYPES
// ==========================================

// Promise<T> = Asenkron işlem sonucu T döner
async function getTask(id: string): Promise<Task | null> {
  // Asenkron işlem
  return task;
}

// Promise<void> = Hiçbir şey dönmez
async function deleteTask(id: string): Promise<void> {
  // Silme işlemi
}

// ==========================================
// TypeScript bu dosyayı kontrol eder
// Hata varsa compile-time'da gösterir
// ==========================================

export {}; // Module olarak işaretle