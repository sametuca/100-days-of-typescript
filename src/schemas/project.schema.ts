import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  key: z.string().regex(/^[A-Z]{2,10}$/),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'archived']),
  organizationId: z.string().uuid(),
  ownerId: z.string().uuid(),
  startDate: z.date().nullable().optional(),
  endDate: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  key: z.string().regex(/^[A-Z]{2,10}$/),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'archived']).default('planning'),
  ownerId: z.string().uuid().optional(),
  startDate: z.string().date().nullable().optional(),
  endDate: z.string().date().nullable().optional(),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  key: z.string().regex(/^[A-Z]{2,10}$/).optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'archived']).optional(),
  ownerId: z.string().uuid().optional(),
  startDate: z.string().date().nullable().optional(),
  endDate: z.string().date().nullable().optional(),
});

export type Project = z.infer<typeof ProjectSchema>;
export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;
