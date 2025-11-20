"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectQuerySchema = exports.transferOwnershipSchema = exports.removeMemberSchema = exports.addMemberSchema = exports.updateProjectSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
exports.createProjectSchema = zod_1.z.object({
    name: zod_1.z
        .string({
        message: 'Proje adı zorunludur'
    })
        .min(2, 'Proje adı en az 2 karakter olmalıdır')
        .max(100, 'Proje adı en fazla 100 karakter olmalıdır')
        .trim(),
    description: zod_1.z
        .string()
        .max(500, 'Açıklama en fazla 500 karakter olmalıdır')
        .trim()
        .optional(),
    color: zod_1.z
        .string()
        .regex(/^#[0-9A-F]{6}$/i, 'Geçerli bir hex renk kodu giriniz (örn: #FF5733)')
        .optional(),
    memberIds: zod_1.z
        .array(zod_1.z.string().min(1, 'Geçersiz kullanıcı ID'))
        .max(50, 'En fazla 50 üye eklenebilir')
        .optional()
        .default([])
});
exports.updateProjectSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, 'Proje adı en az 2 karakter olmalıdır')
        .max(100, 'Proje adı en fazla 100 karakter olmalıdır')
        .trim()
        .optional(),
    description: zod_1.z
        .string()
        .max(500, 'Açıklama en fazla 500 karakter olmalıdır')
        .trim()
        .optional(),
    color: zod_1.z
        .string()
        .regex(/^#[0-9A-F]{6}$/i, 'Geçerli bir hex renk kodu giriniz (örn: #FF5733)')
        .optional(),
    status: zod_1.z
        .enum(['ACTIVE', 'ARCHIVED', 'COMPLETED'], {
        message: 'Geçersiz proje durumu'
    })
        .optional()
});
exports.addMemberSchema = zod_1.z.object({
    email: zod_1.z
        .string({
        message: 'Email adresi zorunludur'
    })
        .email('Geçerli bir email adresi giriniz')
        .toLowerCase()
        .trim()
});
exports.removeMemberSchema = zod_1.z.object({
    userId: zod_1.z
        .string({
        message: 'Kullanıcı ID zorunludur'
    })
        .min(1, 'Geçersiz kullanıcı ID')
});
exports.transferOwnershipSchema = zod_1.z.object({
    newOwnerId: zod_1.z
        .string({
        message: 'Yeni sahip ID zorunludur'
    })
        .min(1, 'Geçersiz kullanıcı ID')
});
exports.projectQuerySchema = zod_1.z.object({
    status: zod_1.z
        .enum(['ACTIVE', 'ARCHIVED', 'COMPLETED'])
        .optional(),
    ownedOnly: zod_1.z
        .string()
        .transform((val) => val === 'true')
        .optional(),
    memberOnly: zod_1.z
        .string()
        .transform((val) => val === 'true')
        .optional(),
    search: zod_1.z
        .string()
        .min(1, 'Arama terimi en az 1 karakter olmalıdır')
        .max(100, 'Arama terimi en fazla 100 karakter olmalıdır')
        .optional(),
    sort: zod_1.z
        .enum(['name', 'createdAt', 'updatedAt'])
        .optional()
        .default('updatedAt'),
    order: zod_1.z
        .enum(['asc', 'desc'])
        .optional()
        .default('desc'),
    page: zod_1.z
        .string()
        .regex(/^\d+$/, 'Sayfa numarası geçerli bir sayı olmalıdır')
        .transform((val) => parseInt(val, 10))
        .refine((val) => val > 0, 'Sayfa numarası 0\'dan büyük olmalıdır')
        .optional()
        .default(1),
    limit: zod_1.z
        .string()
        .regex(/^\d+$/, 'Limit geçerli bir sayı olmalıdır')
        .transform((val) => parseInt(val, 10))
        .refine((val) => val > 0 && val <= 100, 'Limit 1-100 arasında olmalıdır')
        .optional()
        .default(10)
});
//# sourceMappingURL=project.validation.js.map