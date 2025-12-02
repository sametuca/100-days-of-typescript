import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().nullable().optional(),
  status: z.enum(['todo', 'in_progress', 'in_review', 'done', 'blocked']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assigneeId: z.string().uuid().nullable().optional(),
  creatorId: z.string().uuid(),
  projectId: z.string().uuid().nullable().optional(),
  organizationId: z.string().uuid(),
  tags: z.array(z.string()).default([]),
  dueDate: z.date().nullable().optional(),
  estimatedHours: z.number().int().min(0).nullable().optional(),
  actualHours: z.number().int().min(0).nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().nullable().optional(),
  status: z.enum(['todo', 'in_progress', 'in_review', 'done', 'blocked']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assigneeId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  tags: z.array(z.string()).default([]),
  dueDate: z.string().datetime().nullable().optional(),
  estimatedHours: z.number().int().min(0).nullable().optional(),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['todo', 'in_progress', 'in_review', 'done', 'blocked']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  tags: z.array(z.string()).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  estimatedHours: z.number().int().min(0).nullable().optional(),
  actualHours: z.number().int().min(0).nullable().optional(),
});

export const TaskFilterSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'in_review', 'done', 'blocked']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assigneeId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
});

export type Task = z.infer<typeof TaskSchema>;
export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;
export type TaskFilter = z.infer<typeof TaskFilterSchema>;
