import { z } from 'zod';

export const ProductCategoryLinkSchema = z.object({
  productId: z.string().uuid('Некорректный ID товара'),
  categoryId: z.string().uuid('Некорректный ID категории'),
});

export type CreateProductCategoryDto = z.infer<typeof ProductCategoryLinkSchema>;
export type DeleteProductCategoryDto = z.infer<typeof ProductCategoryLinkSchema>;

export const GetProductCategoriesQuerySchema = z.object({
  productId: z.string().uuid().optional().catch(undefined),
  categoryId: z.string().uuid().optional().catch(undefined),
  search: z.string().optional().catch(''), // поиск по названию категории
  sortField: z.string().optional().catch('createdAt').optional(),
  order: z.enum(['asc', 'desc']).catch('desc').optional(),
  page: z.coerce.number().min(1).catch(1).optional(),
  limit: z.coerce.number().min(1).max(100).catch(50).optional(),
});

export type GetProductCategoriesQueryDto = z.infer<typeof GetProductCategoriesQuerySchema>;

export const MinimalProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export const MinimalCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

// ─── Связь товар ↔ категория (ответ от сервера) ──────────────────────
export const ProductCategorySchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  categoryId: z.string().uuid(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  // расширенные данные (как возвращает бэкенд)
  product: MinimalProductSchema.optional().nullable(),
  category: MinimalCategorySchema.optional().nullable(),
});

export type ProductCategory = z.infer<typeof ProductCategorySchema>;

export const ProductCategoriesListResponseSchema = z.object({
  items: z.array(ProductCategorySchema),
  total: z.number(),
});

export const ProductCategoriesByProductSchema = z.array(
  z.object({
    id: z.string().uuid(),
    category: MinimalCategorySchema,
  })
);

export const ProductsByCategorySchema = z.array(
  z.object({
    id: z.string().uuid(),
    product: MinimalProductSchema,
  })
);