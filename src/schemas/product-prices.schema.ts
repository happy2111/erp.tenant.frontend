import { z } from 'zod';

export const PriceTypeValues = ['CASH', 'INSTALLMENT', 'WHOLESALE', 'ONLINE', 'SPECIAL'] as const;
export const CustomerTypeValues = ['CLIENT', 'SUPPLIER'] as const;

export type PriceType = typeof PriceTypeValues[number];
export type CustomerType = typeof CustomerTypeValues[number];

// ─── Создание цены ───────────────────────────────────────────────────
export const CreateProductPriceSchema = z.object({
  productId: z.string().uuid('Некорректный ID товара'),
  organizationId: z.string().uuid().optional(),
  priceType: z.enum(PriceTypeValues),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Некорректный формат суммы (decimal)'),
  currencyId: z.string().uuid('Некорректный ID валюты'),
  customerType: z.enum(CustomerTypeValues).optional(),
});

export type CreateProductPriceDto = z.infer<typeof CreateProductPriceSchema>;

// ─── Обновление цены ─────────────────────────────────────────────────
export const UpdateProductPriceSchema = CreateProductPriceSchema.partial();

export type UpdateProductPriceDto = z.infer<typeof UpdateProductPriceSchema>;

// ─── Параметры запроса списка цен ────────────────────────────────────
export const GetProductPricesQuerySchema = z.object({
  productId: z.string().uuid().optional().catch(undefined),
  priceType: z.enum(PriceTypeValues).optional().catch(undefined),
  customerType: z.enum(CustomerTypeValues).optional().catch(undefined),
  sortField: z.string().optional().catch('createdAt'),
  order: z.enum(['asc', 'desc']).catch('desc').optional(),
  page: z.coerce.number().min(1).catch(1).optional(),
  limit: z.coerce.number().min(1).max(100).catch(20).optional(),
});

export type GetProductPriceQueryDto = z.infer<typeof GetProductPricesQuerySchema>;

// ─── Минимальные связанные сущности ──────────────────────────────────
export const MinimalProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string().nullable().optional(),
});

export const MinimalCurrencySchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  symbol: z.string().optional().nullable(),
});

export const MinimalOrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

// ─── Полная цена (ответ от сервера) ──────────────────────────────────
export const ProductPriceSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  organizationId: z.string().uuid().nullable().optional(),
  priceType: z.enum(PriceTypeValues),
  amount: z.string(), // Decimal приходит как строка
  currencyId: z.string().uuid(),
  customerType: z.enum(CustomerTypeValues).nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  // включённые связи (как в бэкенде)
  product: MinimalProductSchema.optional().nullable(),
  currency: MinimalCurrencySchema.optional().nullable(),
  organization: MinimalOrganizationSchema.optional().nullable(),
});

export type ProductPrice = z.infer<typeof ProductPriceSchema>;

// ─── Ответ со списком цен ────────────────────────────────────────────
export const ProductPricesListResponseSchema = z.object({
  items: z.array(ProductPriceSchema),
  total: z.number(),
});