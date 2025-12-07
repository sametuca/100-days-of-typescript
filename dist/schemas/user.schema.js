"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserSchema = exports.CreateUserSchema = exports.UserSchema = void 0;
const zod_1 = require("zod");
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    username: zod_1.z.string().min(3).max(30),
    name: zod_1.z.string().min(1).max(100),
    role: zod_1.z.enum(['admin', 'manager', 'developer', 'viewer']),
    avatar: zod_1.z.string().url().nullable().optional(),
    organizationId: zod_1.z.string().uuid(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.CreateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    username: zod_1.z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
    password: zod_1.z.string().min(8),
    name: zod_1.z.string().min(1).max(100),
});
exports.UpdateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    username: zod_1.z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/).optional(),
    name: zod_1.z.string().min(1).max(100).optional(),
    role: zod_1.z.enum(['admin', 'manager', 'developer', 'viewer']).optional(),
    avatar: zod_1.z.string().url().nullable().optional(),
});
//# sourceMappingURL=user.schema.js.map