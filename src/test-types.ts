// ============================================
// TYPE SYSTEM TEST FILE
// ============================================

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

const taskTitle: string = "TypeScript Öğren";
const taskId: number = 123;
const isCompleted: boolean = true;
const createdDate: Date = new Date();

// Enum değeri kullan
const status: TaskStatus = TaskStatus.TODO;
const priority: TaskPriority = TaskPriority.HIGH;
const role: UserRole = UserRole.ADMIN;

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

const taskWithoutDesc: Task = {
  id: "2",
  title: "Sadece Başlık",
  // description yok (optional)
  status: TaskStatus.TODO,
  priority: TaskPriority.LOW,
  userId: "user1",
  createdAt: new Date(),
  updatedAt: new Date()
};

const taskResponse: ApiResponse<Task> = {
  success: true,
  data: task
};

const userResponse: ApiResponse<User> = {
  success: true,
  data: user
};

const messageResponse: ApiResponse<string> = {
  success: true,
  data: "İşlem başarılı"
};


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
  // passwordHash yok (Omit ile çıkarıldı)
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
};

// Partial - Tüm alanları opsiyonel yap
const partialTask: Partial<Task> = {
  title: "Sadece başlık"
  // Diğer alanlar yok (Partial ile opsiyonel)
};

// Required - Tüm alanları zorunlu yap
// const requiredTask: Required<Task> = {
//   // Tüm alanlar olmalı, yoksa hata
// };

// ==========================================
// 7. UNION TYPES
// ==========================================

let idOrNumber: string | number;
idOrNumber = "123";     
idOrNumber = 123;       

// Multiple union
type Status = 'ACTIVE' | 'INACTIVE' | 'PENDING';
let projectStatus: Status;
projectStatus = 'ACTIVE';   

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


// Array tanımları
const numbers: number[] = [1, 2, 3];
const strings: Array<string> = ["a", "b", "c"];
const tasks: Task[] = [task];

// Tuple (sabit uzunluklu array)
const coordinate: [number, number] = [10, 20];
const response: [boolean, string] = [true, "Success"];


// Readonly = Değiştirilemez
const readonlyTask: Readonly<Task> = task;
// readonlyTask.title = "Yeni"; //

const readonlyArray: ReadonlyArray<number> = [1, 2, 3];
// readonlyArray.push(4); //

// Promise<T> = Asenkron işlem sonucu T döner
async function getTask(id: string): Promise<Task | null> {
  // Asenkron işlem
  return task;
}

// Promise<void> = Hiçbir şey dönmez
async function deleteTask(id: string): Promise<void> {
  // Silme işlemi
}

export {};