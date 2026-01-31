// src/schemas/categories.schema.ts
import { z } from 'zod';

// ─── Создание категории ──────────────────────────────────────────────
export const CreateCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Название категории обязательно')
    .max(100, 'Название слишком длинное (максимум 100 символов)'),
});

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;

// ─── Обновление категории ────────────────────────────────────────────
export const UpdateCategorySchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .optional(),
});

export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;

// ─── Параметры запроса списка категорий ──────────────────────────────
export const GetCategoriesQuerySchema = z.object({
  search: z.string().optional().catch(''),
  sortField: z.string().optional().catch('name').optional(),
  order: z.enum(['asc', 'desc']).catch('asc').optional(),
  page: z.coerce.number().min(1).catch(1).optional(),
  limit: z.coerce.number().min(1).max(100).catch(20).optional(),
});

export type GetCategoriesQueryDto = z.infer<typeof GetCategoriesQuerySchema>;

// ─── Категория (ответ от сервера) ────────────────────────────────────
export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  // если бэкенд возвращает связанные товары (в getByIdAdmin)
  products: z
    .array(
      z.object({
        id: z.string().uuid(),
        product: z.object({
          id: z.string().uuid(),
          name: z.string(),
          code: z.string().nullable().optional(),
        }).nullable().optional(),
      })
    )
    .optional()
    .default([]),
  _count: z
    .object({
      products: z.number(),
    })
    .optional()
    .nullable(),
});

export type Category = z.infer<typeof CategorySchema>;

// ─── Ответ со списком категорий ──────────────────────────────────────
export const CategoriesListResponseSchema = z.object({
  items: z.array(CategorySchema.omit({ products: true, _count: true })),
  total: z.number(),
});