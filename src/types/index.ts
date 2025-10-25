export enum TaskStatus {
  TODO = 'TODO',                    // Yapılacak
  IN_PROGRESS = 'IN_PROGRESS',      // Devam ediyor
  DONE = 'DONE',                    // Tamamlandı
  CANCELLED = 'CANCELLED'           // İptal edildi (YENİ)
}

export enum TaskPriority {
  LOW = 'LOW',                      // Düşük
  MEDIUM = 'MEDIUM',                // Orta
  HIGH = 'HIGH',                    // Yüksek
  URGENT = 'URGENT'                 // Acil
}

export enum UserRole {
  USER = 'USER',                    // Normal kullanıcı
  ADMIN = 'ADMIN',                  // Yönetici
  MODERATOR = 'MODERATOR'           // Moderatör
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
  // Örnek: ['typescript', 'backend', 'urgent']
  tags?: string[];
}

export interface User extends BaseEntity {
  email: string;
  username: string;
  // passwordHash = Şifrelenmiş şifre
  // NOT: Gerçek şifre asla saklanmaz, hash'i saklanır
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
  // memberIds = Proje üyeleri (kullanıcı ID'leri)
  // Array<string> = string array'i
  // Örnek: ['user1', 'user2', 'user3']
  memberIds: string[];
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  // | = VEYA (Union type)
  // Sadece bu 3 değerden biri olabilir
  color?: string;
}


export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  dueDate?: string;              // String olarak gelir (JSON), Date'e çevrilecek
  tags?: string[];
}

// Task güncellerken gönderilecek veri
// Partial<T> = T'nin tüm alanlarını opsiyonel yap
// Partial<CreateTaskDto> = CreateTaskDto'nun tüm alanları opsiyonel
export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  // Partial sayesinde tüm alanlar opsiyonel
  // Sadece gönderilen alanlar güncellenecek
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;              // Plain text (hash'lenecek)
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

// User güncellerken gönderilecek veri
export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  // password güncelleme ayrı endpoint'te olacak (güvenlik için)
}

// Project oluştururken gönderilecek veri
export interface CreateProjectDto {
  name: string;
  description?: string;
  color?: string;
  memberIds?: string[];
}

// Project güncellerken gönderilecek veri
export interface UpdateProjectDto extends Partial<CreateProjectDto> {
  status?: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
}


export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Paginated response (sayfalama için)
// Çok sayıda veri varsa sayfalara böleriz
export interface PaginatedResponse<T> {
  success: boolean;
  
  // data = Mevcut sayfadaki veri
  data: T[];
  
  // pagination = Sayfalama bilgileri
  pagination: {
    // page = Hangi sayfa? (1, 2, 3, ...)
    page: number;
    
    // limit = Sayfa başına kaç eleman?
    limit: number;
    
    // total = Toplam kaç eleman var?
    total: number;
    
    // totalPages = Toplam kaç sayfa var?
    totalPages: number;
    
    // hasNext = Sonraki sayfa var mı?
    hasNext: boolean;
    
    // hasPrev = Önceki sayfa var mı?
    hasPrev: boolean;
  };
}

// ==========================================
// UTILITY TYPES - YARDIMCI TİPLER
// ==========================================

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

// ==========================================
// TYPE GUARDS - TİP KONTROLÜ
// ==========================================
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

// ==========================================
// UNION & INTERSECTION TYPES
// ==========================================

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

// ==========================================
// QUERY PARAMETERS - SORGU PARAMETRELERİ
// ==========================================
// URL query string'leri için tipler

// Task listesi için query parametreleri
export interface TaskQueryParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  userId?: string;
  projectId?: string;
  search?: string;
  sort?: 'createdAt' | 'updatedAt' | 'title' | 'priority';
  order?: 'asc' | 'desc';
  page?: number;
  // limit = Sayfa başına eleman sayısı
  limit?: number;
}

// User listesi için query parametreleri
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
    secret: string;              // JWT secret key
    expiresIn: string;           // Token süresi ('1h', '7d', vb.)
  };
  
  // database = Veritabanı ayarları
  database: {
    host: string;
    port: number;
    name: string;
  };
}