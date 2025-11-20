"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccountSchema = exports.changePasswordSchema = exports.updateProfileSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z
        .string({
        message: 'Email zorunludur'
    })
        .email('Geçerli bir email adresi giriniz')
        .toLowerCase()
        .trim(),
    username: zod_1.z
        .string({
        message: 'Kullanıcı adı zorunludur'
    })
        .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır')
        .max(30, 'Kullanıcı adı en fazla 30 karakter olmalıdır')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Kullanıcı adı sadece harf, rakam, - ve _ içerebilir')
        .toLowerCase()
        .trim(),
    password: zod_1.z
        .string({
        message: 'Şifre zorunludur'
    })
        .min(8, 'Şifre en az 8 karakter olmalıdır')
        .max(100, 'Şifre en fazla 100 karakter olmalıdır'),
    firstName: zod_1.z
        .string()
        .min(2, 'Ad en az 2 karakter olmalıdır')
        .max(50, 'Ad en fazla 50 karakter olmalıdır')
        .trim()
        .optional(),
    lastName: zod_1.z
        .string()
        .min(2, 'Soyad en az 2 karakter olmalıdır')
        .max(50, 'Soyad en fazla 50 karakter olmalıdır')
        .trim()
        .optional()
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z
        .string({
        message: 'Email zorunludur'
    })
        .email('Geçerli bir email adresi giriniz')
        .toLowerCase()
        .trim(),
    password: zod_1.z
        .string({
        message: 'Şifre zorunludur'
    })
        .min(1, 'Şifre boş olamaz')
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z
        .string({
        message: 'Refresh token zorunludur'
    })
        .min(1, 'Refresh token boş olamaz')
});
exports.updateProfileSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .email('Geçerli bir email adresi giriniz')
        .toLowerCase()
        .trim()
        .optional(),
    username: zod_1.z
        .string()
        .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır')
        .max(30, 'Kullanıcı adı en fazla 30 karakter olmalıdır')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Kullanıcı adı sadece harf, rakam, - ve _ içerebilir')
        .toLowerCase()
        .trim()
        .optional(),
    firstName: zod_1.z
        .string()
        .min(2, 'Ad en az 2 karakter olmalıdır')
        .max(50, 'Ad en fazla 50 karakter olmalıdır')
        .trim()
        .optional(),
    lastName: zod_1.z
        .string()
        .min(2, 'Soyad en az 2 karakter olmalıdır')
        .max(50, 'Soyad en fazla 50 karakter olmalıdır')
        .trim()
        .optional()
}).refine((data) => Object.keys(data).length > 0, {
    message: 'Güncellenecek en az bir alan belirtilmelidir'
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z
        .string({
        message: 'Mevcut şifre zorunludur'
    })
        .min(1, 'Mevcut şifre boş olamaz'),
    newPassword: zod_1.z
        .string({
        message: 'Yeni şifre zorunludur'
    })
        .min(8, 'Yeni şifre en az 8 karakter olmalıdır')
        .max(100, 'Yeni şifre en fazla 100 karakter olmalıdır')
});
exports.deleteAccountSchema = zod_1.z.object({
    password: zod_1.z
        .string({
        message: 'Şifre zorunludur'
    })
        .min(1, 'Şifre boş olamaz')
});
//# sourceMappingURL=user.validation.js.map