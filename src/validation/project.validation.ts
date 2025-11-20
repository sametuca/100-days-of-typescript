import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z
    .string({
      message: 'Proje adı zorunludur'
    })
    .min(2, 'Proje adı en az 2 karakter olmalıdır')
    .max(100, 'Proje adı en fazla 100 karakter olmalıdır')
    .trim(),

  description: z
    .string()
    .max(500, 'Açıklama en fazla 500 karakter olmalıdır')
    .trim()
    .optional(),

  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Geçerli bir hex renk kodu giriniz (örn: #FF5733)')
    .optional(),

  memberIds: z
    .array(z.string().min(1, 'Geçersiz kullanıcı ID'))
    .max(50, 'En fazla 50 üye eklenebilir')
    .optional()
    .default([])
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(2, 'Proje adı en az 2 karakter olmalıdır')
    .max(100, 'Proje adı en fazla 100 karakter olmalıdır')
    .trim()
    .optional(),

  description: z
    .string()
    .max(500, 'Açıklama en fazla 500 karakter olmalıdır')
    .trim()
    .optional(),

  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Geçerli bir hex renk kodu giriniz (örn: #FF5733)')
    .optional(),

  status: z
    .enum(['ACTIVE', 'ARCHIVED', 'COMPLETED'], {
      message: 'Geçersiz proje durumu'
    })
    .optional()
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const addMemberSchema = z.object({
  email: z
    .string({
      message: 'Email adresi zorunludur'
    })
    .email('Geçerli bir email adresi giriniz')
    .toLowerCase()
    .trim()
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;

export const removeMemberSchema = z.object({
  userId: z
    .string({
      message: 'Kullanıcı ID zorunludur'
    })
    .min(1, 'Geçersiz kullanıcı ID')
});

export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;

export const transferOwnershipSchema = z.object({
  newOwnerId: z
    .string({
      message: 'Yeni sahip ID zorunludur'
    })
    .min(1, 'Geçersiz kullanıcı ID')
});

export type TransferOwnershipInput = z.infer<typeof transferOwnershipSchema>;

export const projectQuerySchema = z.object({
  status: z
    .enum(['ACTIVE', 'ARCHIVED', 'COMPLETED'])
    .optional(),

  ownedOnly: z
    .string()
    .transform((val) => val === 'true')
    .optional(),

  memberOnly: z
    .string()
    .transform((val) => val === 'true')
    .optional(),

  search: z
    .string()
    .min(1, 'Arama terimi en az 1 karakter olmalıdır')
    .max(100, 'Arama terimi en fazla 100 karakter olmalıdır')
    .optional(),

  sort: z
    .enum(['name', 'createdAt', 'updatedAt'])
    .optional()
    .default('updatedAt'),

  order: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc'),

  page: z
    .string()
    .regex(/^\d+$/, 'Sayfa numarası geçerli bir sayı olmalıdır')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, 'Sayfa numarası 0\'dan büyük olmalıdır')
    .optional()
    .default(1),

  limit: z
    .string()
    .regex(/^\d+$/, 'Limit geçerli bir sayı olmalıdır')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, 'Limit 1-100 arasında olmalıdır')
    .optional()
    .default(10)
});

export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;