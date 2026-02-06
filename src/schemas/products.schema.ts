// src/schemas/products.schema.ts
import { z } from 'zod';

// ─── Создание товара ─────────────────────────────────────────────────
export const CreateProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Название товара обязательно')
    .max(255, 'Название слишком длинное'),
  description: z.string().max(2000).optional().nullable(),
  brandId: z.string().uuid('Некорректный ID бренда').optional().nullable(),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;

// ─── Обновление товара ───────────────────────────────────────────────
export const UpdateProductSchema = CreateProductSchema.extend({
  code: z.string().optional(),
}).partial();

export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;

// ─── Параметры запроса списка товаров ────────────────────────────────
export const GetProductsQuerySchema = z.object({
  search: z.string().optional().catch(''),
  sortField: z.string().optional().catch('name'),
  order: z.enum(['asc', 'desc']).catch('desc').optional(),
  page: z.coerce.number().min(1).catch(1).optional(),
  limit: z.coerce.number().min(1).max(100).catch(20).optional(),
});

export type GetProductQueryDto = z.infer<typeof GetProductsQuerySchema>;

// ─── Минимальные связанные сущности ──────────────────────────────────
export const MinimalBrandSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export const MinimalCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export const MinimalProductImageSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  url: z.string().url().optional(), // публичный URL после преобразования
  isPrimary: z.boolean(),
});

export type MinimalProductImage = z.infer<typeof MinimalProductImageSchema>;

export const ProductPriceSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  organizationId: z.string().uuid().nullable().optional(),
  priceType: z.string(),
  amount: z.coerce.number(),
  currencyId: z.string().uuid(),
  customerType: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// ─── Полный товар (ответ от сервера) ─────────────────────────────────
export const ProductSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  organizationId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  brandId: z.string().uuid().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  // включённые связи (как в getAllAdmin / getByIdAdmin)
  brand: MinimalBrandSchema.nullable().optional(),
  categories: z
    .array(MinimalCategorySchema)
    .default([]),
  prices: z.array(ProductPriceSchema).optional().default([]), // можно уточнить тип цены
  images: z.array(MinimalProductImageSchema).default([]),
  variants: z.array(z.any()).optional().default([]),
  variantImages: z.array(z.any()).optional().default([]),
});

export type Product = z.infer<typeof ProductSchema>;

// ─── Ответ со списком товаров ────────────────────────────────────────
export const ProductsListResponseSchema = z.object({
  items: z.array(ProductSchema),
  total: z.number(),
});