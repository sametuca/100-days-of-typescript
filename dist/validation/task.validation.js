"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskQuerySchema = exports.taskIdSchema = exports.updateTaskSchema = exports.createTaskSchema = exports.taskPrioritySchema = exports.taskStatusSchema = void 0;
const zod_1 = require("zod");
const types_1 = require("../types");
exports.taskStatusSchema = zod_1.z.enum(Object.values(types_1.TaskStatus));
exports.taskPrioritySchema = zod_1.z.enum(Object.values(types_1.TaskPriority));
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z
        .string({
        message: 'Task başlığı zorunludur'
    })
        .min(3, 'Task başlığı en az 3 karakter olmalıdır')
        .max(200, 'Task başlığı en fazla 200 karakter olmalıdır')
        .trim(),
    description: zod_1.z
        .string({
        message: 'Açıklama string olmalıdır'
    })
        .max(1000, 'Açıklama en fazla 1000 karakter olmalıdır')
        .trim()
        .optional(),
    status: exports.taskStatusSchema.optional(),
    priority: exports.taskPrioritySchema.optional(),
    projectId: zod_1.z.string().optional(),
    dueDate: zod_1.z
        .string()
        .datetime('Geçerli bir tarih formatı olmalıdır')
        .optional(),
    tags: zod_1.z
        .array(zod_1.z.string().min(1, 'Tag boş olamaz'))
        .max(10, 'En fazla 10 tag ekleyebilirsiniz')
        .optional()
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(200).trim().optional(),
    description: zod_1.z.string().max(1000).trim().optional(),
    status: exports.taskStatusSchema.optional(),
    priority: exports.taskPrioritySchema.optional(),
    projectId: zod_1.z.string().optional(),
    dueDate: zod_1.z.string().datetime().optional(),
    tags: zod_1.z.array(zod_1.z.string().min(1)).max(10).optional()
}).refine((data) => Object.keys(data).length > 0, {
    message: 'Güncellenecek en az bir alan belirtilmelidir'
});
exports.taskIdSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Task ID boş olamaz')
});
exports.taskQuerySchema = zod_1.z.object({
    status: zod_1.z.union([exports.taskStatusSchema, zod_1.z.array(exports.taskStatusSchema)]).optional(),
    priority: zod_1.z.union([exports.taskPrioritySchema, zod_1.z.array(exports.taskPrioritySchema)]).optional(),
    search: zod_1.z.string().min(1).max(100).optional(),
    userId: zod_1.z.string().optional(),
    projectId: zod_1.z.string().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    sortBy: zod_1.z.enum(['createdAt', 'updatedAt', 'title', 'priority', 'dueDate']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
    page: zod_1.z.coerce.number().int().positive().optional(),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional()
});
//# sourceMappingURL=task.validation.js.map