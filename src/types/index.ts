export enum TaskStatus {
  TODO = 'TODO',                    
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED'
}

export enum TaskPriority {
  LOW = 'LOW',                     
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum UserRole {
  USER = 'USER',                    
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

export interface User extends BaseEntity {
  email: string;
  username: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
}

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  userId: string;
  projectId?: string;
  dueDate?: Date;
  tags?: string[];
}

export interface User extends BaseEntity {
  email: string;
  username: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
}

export interface Project extends BaseEntity {
  name: string;
  description?: string;
  ownerId: string;
  memberIds: string[];
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  color?: string;
}


export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  dueDate?: string;            
  tags?: string[];
}

// Partial<CreateTaskDto> = CreateTaskDto'nun tüm alanları opsiyonel
export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  // Partial sayesinde tüm alanlar opsiyonel
  // Sadece gönderilen alanlar güncellenecek
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;             
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  color?: string;
  memberIds?: string[];
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {
  status?: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
}


export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  
  data: T[];
  
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Task'tan sadece belirli alanları al
// Pick<Task, 'id' | 'title'> = Sadece id ve title alanları
export type TaskSummary = Pick<Task, 'id' | 'title' | 'status' | 'priority'>;

// Task'tan belirli alanları çıkar
// Omit<Task, 'userId'> = userId hariç tüm alanlar
export type PublicTask = Omit<Task, 'userId'>;

// User'dan password'ü çıkar (güvenlik için)
// Public API'de password dönmesin
export type SafeUser = Omit<User, 'passwordHash'>;

// Task oluştururken gerekli tüm alanlar
// Required<T> = T'nin tüm alanlarını zorunlu yap
export type CompleteTask = Required<Task>;

// Runtime'da tip kontrolü yapmak için
// Bir değer Task mı kontrol et
export function isTask(obj: any): obj is Task {
  // obj is Task = Eğer true dönerse obj'nin tipi Task'tır
  
  return (
    // typeof obj === 'object' = Obje mi?
    typeof obj === 'object' &&
    obj !== null &&
    // 'id' in obj = obj içinde 'id' property'si var mı?
    'id' in obj &&
    'title' in obj &&
    'status' in obj
  );
}

// Bir değer User mı kontrol et
export function isUser(obj: any): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj &&
    'username' in obj
  );
}

// Union type (VEYA)
// EntityType = Task VEYA User VEYA Project olabilir
export type EntityType = Task | User | Project;

// Intersection type (VE)
// Timestamped = createdAt VE updatedAt içeren tip
export type Timestamped = {
  createdAt: Date;
  updatedAt: Date;
};

// Bir tip'e timestamp ekle
// WithTimestamp<T> = T VE Timestamped
export type WithTimestamp<T> = T & Timestamped;

// Örnek kullanım:
// type TimestampedTask = WithTimestamp<{ title: string }>;
// Result: { title: string, createdAt: Date, updatedAt: Date }

// URL query string'leri için tipler
export interface TaskQueryParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  userId?: string;
  projectId?: string;
  search?: string;
  sort?: 'createdAt' | 'updatedAt' | 'title' | 'priority';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UserQueryParams {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  sort?: 'createdAt' | 'username' | 'email';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AppConfig {
  port: number;
  environment: 'development' | 'production' | 'test';
  apiPrefix: string;
  jwt: {
    secret: string;              
    expiresIn: string;          
  };
  database: {
    host: string;
    port: number;
    name: string;
  };
}