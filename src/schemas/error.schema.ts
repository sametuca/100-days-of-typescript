import { z } from 'zod';

export const ErrorSchema = z.object({
  status: z.literal('error'),
  message: z.string(),
  code: z.string(),
  errors: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      })
    )
    .optional(),
});

export const PaginationMetaSchema = z.object({
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
});

export type ErrorResponse = z.infer<typeof ErrorSchema>;
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
