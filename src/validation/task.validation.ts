import { z } from 'zod';
import { TaskStatus, TaskPriority } from '../types';

export const taskStatusSchema = z.enum(Object.values(TaskStatus) as [string, ...string[]]);

export const taskPrioritySchema = z.enum(Object.values(TaskPriority) as [string, ...string[]]);

export const createTaskSchema = z.object({
  title: z
    .string({
      message: 'Task başlığı zorunludur'
    })
    .min(3, 'Task başlığı en az 3 karakter olmalıdır')
    .max(200, 'Task başlığı en fazla 200 karakter olmalıdır')
    .trim(),
  
  description: z
    .string({
      message: 'Açıklama string olmalıdır'
    })
    .max(1000, 'Açıklama en fazla 1000 karakter olmalıdır')
    .trim()
    .optional(),
  
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  projectId: z.string().optional(),
  
  dueDate: z
    .string()
    .datetime('Geçerli bir tarih formatı olmalıdır')
    .optional(),
  
  tags: z
    .array(z.string().min(1, 'Tag boş olamaz'))
    .max(10, 'En fazla 10 tag ekleyebilirsiniz')
    .optional()
});

export const updateTaskSchema = z.object({
  title: z.string().min(3).max(200).trim().optional(),
  description: z.string().max(1000).trim().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  projectId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  tags: z.array(z.string().min(1)).max(10).optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Güncellenecek en az bir alan belirtilmelidir'
});

export const taskIdSchema = z.object({
  id: z.string().min(1, 'Task ID boş olamaz')
});

export const taskQuerySchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  search: z.string().min(1).max(100).optional(),
  userId: z.string().optional(),
  projectId: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});