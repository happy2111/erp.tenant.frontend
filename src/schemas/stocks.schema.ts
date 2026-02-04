import { z } from 'zod';

export const StockFilterSchema = z.object({
  search: z.string().optional().catch(''),
  sortField: z.string().optional().default('updatedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type StockFilterDto = z.infer<typeof StockFilterSchema>;

export const AdjustStockSchema = z.object({
  productVariantId: z.string().uuid('Некорректный ID варианта товара'),
  quantityDelta: z.number().int('Должно быть целое число'),
  reason: z.string().optional().nullable(),
  batchId: z.string().uuid().optional().nullable(),
});

export type AdjustStockDto = z.infer<typeof AdjustStockSchema>;

export const StockByVariantResponseSchema = z.object({
  quantity: z.number(),
  product_variant: z.object({
    id: z.string().uuid(),
    title: z.string(),
    sku: z.string().nullable().optional(),
    barcode: z.string().nullable().optional(),
    product: z.object({
      id: z.string().uuid(),
      name: z.string(),
      code: z.string().nullable().optional(),
    }).nullable().optional(),
  }),
  updatedAt: z.coerce.date().nullable().optional(),
});

export type StockByVariantResponse = z.infer<typeof StockByVariantResponseSchema>;

export const StockSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  productVariantId: z.string().uuid(),
  quantity: z.number(),
  updatedAt: z.coerce.date(),

  product_variant: z.object({
    id: z.string().uuid(),
    title: z.string(),
    sku: z.string().nullable().optional(),
    barcode: z.string().nullable().optional(),
    product: z.object({
      id: z.string().uuid(),
      name: z.string(),
      code: z.string().nullable().optional(),
    }).nullable().optional(),
  }).optional().nullable(),
});

export type Stock = z.infer<typeof StockSchema>;

export const StocksListResponseSchema = z.object({
  data: z.array(StockSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});