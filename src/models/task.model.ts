import { TaskStatus, TaskPriority } from '../types';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// CREATE TASK DTO (Data Transfer Object)
// ==========================================
// DTO = İstemciden gelen veri formatı
// Yeni task oluştururken hangi bilgiler gönderilmeli?

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

// ==========================================
// UPDATE TASK DTO
// ==========================================
// Task güncellerken hangi alanlar değiştirilebilir?

export interface UpdateTaskDto {
  // Tüm alanlar opsiyonel
  // Sadece gönderilen alanlar güncellenecek
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}