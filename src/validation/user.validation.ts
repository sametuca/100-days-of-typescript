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