import { z } from 'zod';

// ─── Происхождение партии ────────────────────────────────────────────
// Партии из закупки создаёт проведение документа. Вручную заводят только
// начальные остатки и излишки инвентаризации.
export const ManualBatchSourceValues = [
  'OPENING_BALANCE',
  'INVENTORY_SURPLUS',
  'CUSTOMER_RETURN',
] as const;

export type ManualBatchSource = (typeof ManualBatchSourceValues)[number];

export const ManualBatchSourceLabels: Record<ManualBatchSource, string> = {
  OPENING_BALANCE: 'BOSHLANG‘ICH QOLDIQ',
  INVENTORY_SURPLUS: 'INVENTARIZATSIYA ORTIQCHASI',
  CUSTOMER_RETURN: 'MIJOZ QAYTARGAN',
};

// ─── Создание партии ─────────────────────────────────────────────────
// costPrice и currencyId обязательны: партия без себестоимости бессмысленна —
// по ней потом невозможно посчитать прибыль с продажи.
export const CreateProductBatchSchema = z.object({
  productVariantId: z.string().uuid('Некорректный ID варианта товара'),
  batchNumber: z
    .string()
    .min(1, 'Номер партии обязателен')
    .max(64, 'Номер партии слишком длинный'),
  quantity: z.number().int().positive('Количество должно быть больше 0'),
  // Не coerce: с ним входной тип схемы становится unknown и ломает
  // типизацию react-hook-form. Приведение делает valueAsNumber в register.
  costPrice: z
    .number({ message: 'Укажите себестоимость' })
    .nonnegative('Себестоимость не может быть отрицательной'),
  currencyId: z.string().uuid('Выберите валюту себестоимости'),
  source: z.enum(ManualBatchSourceValues).optional(),
  supplierId: z.string().uuid().optional().nullable(),
  receivedAt: z
    .string()
    .nullable()
    .transform((val) => (val ? new Date(val).toISOString() : null))
    .optional(),
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
  /** Сколько от партии осталось. Уменьшается при списании */
  remainingQuantity: z.number().optional(),
  /** Себестоимость единицы в валюте партии */
  costPrice: z.coerce.number().optional(),
  /** Она же в базовой валюте, заморожена по курсу на дату прихода */
  costPriceBase: z.coerce.number().optional(),
  currencyId: z.string().uuid().optional(),
  source: z.string().optional(),
  receivedAt: z.coerce.date().optional(),
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
  /** Сумма остатков — именно она должна совпадать со Stock.quantity */
  remainingQuantity: z.number().optional(),
  nearestExpiry: z.coerce.date().nullable().optional(),
  createdAtEarliest: z.coerce.date().nullable().optional(),
});

export type BatchStats = z.infer<typeof BatchStatsSchema>;