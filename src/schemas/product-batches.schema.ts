import { z } from 'zod';

// ─── Создание партии ─────────────────────────────────────────────────
export const CreateProductBatchSchema = z.object({
  productVariantId: z.string().uuid('Некорректный ID варианта товара'),
  batchNumber: z
    .string()
    .min(1, 'Номер партии обязателен')
    .max(64, 'Номер партии слишком длинный'),
  quantity: z.number().int().positive('Количество должно быть больше 0'),
  expiryDate: z
    .string()
    .nullable()
    .transform((val) => (val ? new Date(val).toISOString() : null))
    .refine(
      (val) => !val || new Date(val) > new Date(),
      'Срок годности должен быть в будущем'
    )
    .optional()
});

export type CreateProductBatchDto = z.infer<typeof CreateProductBatchSchema>;

// ─── Обновление партии ───────────────────────────────────────────────
export const UpdateProductBatchSchema = z.object({
  batchNumber: z.string().max(64).optional(),
  expiryDate: z
    .string()
    .nullable()
    .transform((val) => (val ? new Date(val).toISOString() : null))
    .refine(
      (val) => !val || new Date(val) > new Date(),
      'Срок годности должен быть в будущем'
    )
    .optional(),
  quantity: z.number().int().min(0).optional(),
});

export type UpdateProductBatchDto = z.infer<typeof UpdateProductBatchSchema>;

// ─── Фильтр / поиск партий ───────────────────────────────────────────
export const FilterProductBatchSchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  search: z.string().optional().catch(''),
  productVariantId: z.string().uuid().optional().catch(undefined),
  isValid: z
    .string()
    .transform((val) => val === 'true')
    .optional()
    .catch(undefined),
  sortField: z.string().optional().default('createdAt').optional(),
  order: z.enum(['asc', 'desc']).default('desc').optional(),
});

export type FilterProductBatchDto = z.infer<typeof FilterProductBatchSchema>;
export const ProductBatchSchema = z.object({
  id: z.string().uuid(),
  productVariantId: z.string().uuid(),
  batchNumber: z.string(),
  quantity: z.number(),
  expiryDate: z.coerce.date().nullable().optional(),
  isValid: z.boolean(),
  createdAt: z.coerce.date(),
  // Change this line:
  updatedAt: z.coerce.date().nullable().optional(),

  product_variant: z
    .object({
      id: z.string().uuid(),
      title: z.string(),
      sku: z.string().nullable().optional(),
      product: z
        .object({
          id: z.string().uuid(),
          name: z.string(),
          // Backend sends nothing here in your JSON, so keep optional
          code: z.string().nullable().optional(),
        })
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),
});

export type ProductBatch = z.infer<typeof ProductBatchSchema>;

// ─── Ответ со списком партий ─────────────────────────────────────────
export const ProductBatchesListResponseSchema = z.object({
  data: z.array(ProductBatchSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// ─── Ответ со списком партий конкретного варианта (без пагинации) ─────
export const BatchesByVariantResponseSchema = z.array(ProductBatchSchema);

// ─── Статистика по партиям варианта ──────────────────────────────────
export const BatchStatsSchema = z.object({
  totalBatches: z.number(),
  activeBatches: z.number(),
  totalQuantity: z.number(),
  nearestExpiry: z.coerce.date().nullable().optional(),
  createdAtEarliest: z.coerce.date().nullable().optional(),
});

export type BatchStats = z.infer<typeof BatchStatsSchema>;