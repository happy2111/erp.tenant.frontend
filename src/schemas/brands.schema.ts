import { z } from 'zod';

export const CreateBrandSchema = z.object({
  name: z
    .string()
    .min(1, 'Название бренда обязательно')
    .max(100, 'Название слишком длинное (максимум 100 символов)'),
});

export type CreateBrandDto = z.infer<typeof CreateBrandSchema>;

export const UpdateBrandSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .optional()
    .refine(
      (val) => val !== '' && val !== undefined,
      'Название не может быть пустым'
    ),
});

export type UpdateBrandDto = z.infer<typeof UpdateBrandSchema>;

export const GetBrandsQuerySchema = z.object({
  search: z.string().optional().catch(''),
  sortField: z.string().optional().catch('createdAt'),
  order: z.enum(['asc', 'desc']).catch('desc').optional(),
  page: z.coerce.number().min(1).catch(1).optional(),
  limit: z.coerce.number().min(1).max(100).catch(20).optional(),
});

export type GetBrandsQueryDto = z.infer<typeof GetBrandsQuerySchema>;

// ─── Тип бренда (ответ от сервера) ───────────────────────────────────
export const BrandSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  products: z
    .array(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
        code: z.string().optional(),
        organization: z
          .object({
            name: z.string(),
          })
          .optional()
          .nullable(),
      })
    )
    .optional()
    .default([]),
  _count: z
    .object({
      products: z.number(),
    })
    .optional(),
});

export type Brand = z.infer<typeof BrandSchema>;

export const BrandsListResponseSchema = z.object({
  items: z.array(BrandSchema),
  total: z.number(),
});