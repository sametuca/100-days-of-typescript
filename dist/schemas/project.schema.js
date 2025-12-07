"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProjectSchema = exports.CreateProjectSchema = exports.ProjectSchema = void 0;
const zod_1 = require("zod");
exports.ProjectSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().nullable().optional(),
    key: zod_1.z.string().regex(/^[A-Z]{2,10}$/),
    status: zod_1.z.enum(['planning', 'active', 'on_hold', 'completed', 'archived']),
    organizationId: zod_1.z.string().uuid(),
    ownerId: zod_1.z.string().uuid(),
    startDate: zod_1.z.date().nullable().optional(),
    endDate: zod_1.z.date().nullable().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.CreateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().nullable().optional(),
    key: zod_1.z.string().regex(/^[A-Z]{2,10}$/),
    status: zod_1.z.enum(['planning', 'active', 'on_hold', 'completed', 'archived']).default('planning'),
    ownerId: zod_1.z.string().uuid().optional(),
    startDate: zod_1.z.string().date().nullable().optional(),
    endDate: zod_1.z.string().date().nullable().optional(),
});
exports.UpdateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    description: zod_1.z.string().nullable().optional(),
    key: zod_1.z.string().regex(/^[A-Z]{2,10}$/).optional(),
    status: zod_1.z.enum(['planning', 'active', 'on_hold', 'completed', 'archived']).optional(),
    ownerId: zod_1.z.string().uuid().optional(),
    startDate: zod_1.z.string().date().nullable().optional(),
    endDate: zod_1.z.string().date().nullable().optional(),
});
//# sourceMappingURL=project.schema.js.map