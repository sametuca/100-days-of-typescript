"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskFilterSchema = exports.UpdateTaskSchema = exports.CreateTaskSchema = exports.TaskSchema = void 0;
const zod_1 = require("zod");
exports.TaskSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().nullable().optional(),
    status: zod_1.z.enum(['todo', 'in_progress', 'in_review', 'done', 'blocked']),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']),
    assigneeId: zod_1.z.string().uuid().nullable().optional(),
    creatorId: zod_1.z.string().uuid(),
    projectId: zod_1.z.string().uuid().nullable().optional(),
    organizationId: zod_1.z.string().uuid(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    dueDate: zod_1.z.date().nullable().optional(),
    estimatedHours: zod_1.z.number().int().min(0).nullable().optional(),
    actualHours: zod_1.z.number().int().min(0).nullable().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.CreateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().nullable().optional(),
    status: zod_1.z.enum(['todo', 'in_progress', 'in_review', 'done', 'blocked']).default('todo'),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    assigneeId: zod_1.z.string().uuid().nullable().optional(),
    projectId: zod_1.z.string().uuid().nullable().optional(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    dueDate: zod_1.z.string().datetime().nullable().optional(),
    estimatedHours: zod_1.z.number().int().min(0).nullable().optional(),
});
exports.UpdateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200).optional(),
    description: zod_1.z.string().nullable().optional(),
    status: zod_1.z.enum(['todo', 'in_progress', 'in_review', 'done', 'blocked']).optional(),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    assigneeId: zod_1.z.string().uuid().nullable().optional(),
    projectId: zod_1.z.string().uuid().nullable().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    dueDate: zod_1.z.string().datetime().nullable().optional(),
    estimatedHours: zod_1.z.number().int().min(0).nullable().optional(),
    actualHours: zod_1.z.number().int().min(0).nullable().optional(),
});
exports.TaskFilterSchema = zod_1.z.object({
    status: zod_1.z.enum(['todo', 'in_progress', 'in_review', 'done', 'blocked']).optional(),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    assigneeId: zod_1.z.string().uuid().optional(),
    projectId: zod_1.z.string().uuid().optional(),
    search: zod_1.z.string().optional(),
    page: zod_1.z.number().int().min(1).default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(20),
    sort: zod_1.z.string().optional(),
});
//# sourceMappingURL=task.schema.js.map