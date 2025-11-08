import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string({
      message: 'Email zorunludur'
    })
    .email('Geçerli bir email adresi giriniz')
    .toLowerCase()
    .trim(),

  username: z
    .string({
      message: 'Kullanıcı adı zorunludur'
    })
    .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır')
    .max(30, 'Kullanıcı adı en fazla 30 karakter olmalıdır')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Kullanıcı adı sadece harf, rakam, - ve _ içerebilir')
    .toLowerCase()
    .trim(),

  password: z
    .string({
      message: 'Şifre zorunludur'
    })
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .max(100, 'Şifre en fazla 100 karakter olmalıdır'),

  firstName: z
    .string()
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .max(50, 'Ad en fazla 50 karakter olmalıdır')
    .trim()
    .optional(),

  lastName: z
    .string()
    .min(2, 'Soyad en az 2 karakter olmalıdır')
    .max(50, 'Soyad en fazla 50 karakter olmalıdır')
    .trim()
    .optional()
});

export type RegisterInput = z.infer<typeof registerSchema>;


export const loginSchema = z.object({
  email: z
    .string({
      message: 'Email zorunludur'
    })
    .email('Geçerli bir email adresi giriniz')
    .toLowerCase()
    .trim(),

  password: z
    .string({
      message: 'Şifre zorunludur'
    })
    .min(1, 'Şifre boş olamaz')
});

export type LoginInput = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({
      message: 'Refresh token zorunludur'
    })
    .min(1, 'Refresh token boş olamaz')
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;


export const updateProfileSchema = z.object({
  email: z
    .string()
    .email('Geçerli bir email adresi giriniz')
    .toLowerCase()
    .trim()
    .optional(),

  username: z
    .string()
    .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır')
    .max(30, 'Kullanıcı adı en fazla 30 karakter olmalıdır')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Kullanıcı adı sadece harf, rakam, - ve _ içerebilir')
    .toLowerCase()
    .trim()
    .optional(),

  firstName: z
    .string()
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .max(50, 'Ad en fazla 50 karakter olmalıdır')
    .trim()
    .optional(),

  lastName: z
    .string()
    .min(2, 'Soyad en az 2 karakter olmalıdır')
    .max(50, 'Soyad en fazla 50 karakter olmalıdır')
    .trim()
    .optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Güncellenecek en az bir alan belirtilmelidir'
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({
      message: 'Mevcut şifre zorunludur'
    })
    .min(1, 'Mevcut şifre boş olamaz'),

  newPassword: z
    .string({
      message: 'Yeni şifre zorunludur'
    })
    .min(8, 'Yeni şifre en az 8 karakter olmalıdır')
    .max(100, 'Yeni şifre en fazla 100 karakter olmalıdır')
});

export const deleteAccountSchema = z.object({
  password: z
    .string({
      message: 'Şifre zorunludur'
    })
    .min(1, 'Şifre boş olamaz')
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;