import { z } from 'zod';

// ─── Статусы закупки ─────────────────────────────────────────────────
// CONFIRMED — товар принят на склад партиями, но ещё не оплачен.
// Появился вместе с учётом себестоимости: раньше приход и оплата были
// одним действием, теперь это два разных события.
export const PurchaseStatusValues = [
  'DRAFT',
  'CONFIRMED',
  'PARTIAL',
  'PAID',
  'CANCELLED',
] as const;

export type PurchaseStatus = (typeof PurchaseStatusValues)[number];

export const PurchaseStatusLabels: Record<PurchaseStatus, string> = {
  DRAFT: 'QORALAMA',
  CONFIRMED: 'QABUL QILINGAN',
  PARTIAL: 'QISMAN',
  PAID: 'TO\'LANGAN',
  CANCELLED: 'BEKOR QILINGAN',
};

export const PurchaseStatusStyles: Record<PurchaseStatus, string> = {
  DRAFT: 'bg-blue-500/20 text-blue-600 border-blue-500/20',
  CONFIRMED: 'bg-violet-500/20 text-violet-600 border-violet-500/20',
  PARTIAL: 'bg-orange-500/20 text-orange-600 border-orange-500/20',
  PAID: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/20',
  CANCELLED: 'bg-destructive/20 text-destructive border-destructive/20',
};

// ─── Происхождение партии ────────────────────────────────────────────
export const BatchSourceValues = [
  'PURCHASE',
  'OPENING_BALANCE',
  'INVENTORY_SURPLUS',
  'CUSTOMER_RETURN',
] as const;

export type BatchSource = (typeof BatchSourceValues)[number];

export const BatchSourceLabels: Record<BatchSource, string> = {
  PURCHASE: 'XARID',
  OPENING_BALANCE: 'BOSHLANG‘ICH QOLDIQ',
  INVENTORY_SURPLUS: 'INVENTARIZATSIYA ORTIQCHASI',
  CUSTOMER_RETURN: 'MIJOZ QAYTARGAN',
};

// ─── Позиция в закупке (одна строка накладной) ──────────────────────
export const CreatePurchaseItemSchema = z.object({
  productVariantId: z.string().uuid('Некорректный ID варианта товара'),
  quantity: z.number().int().positive('Количество должно быть > 0'),
  price: z.number().positive(),
  discount: z.coerce.number().nonnegative().default(0),
  batchNumber: z.string().max(64).optional().nullable(),
  expiryDate: z.string().datetime().optional().nullable(),
});

export type CreatePurchaseItemDto = z.infer<typeof CreatePurchaseItemSchema>;

// ─── Создание закупки ────────────────────────────────────────────────
// Документ всегда создаётся черновиком: ни склад, ни касса не трогаются.
// Приход и оплата — отдельным вызовом confirm.
export const CreatePurchaseSchema = z.object({
  supplierId: z.string().uuid('Некорректный ID поставщика'),
  kassaId: z.string().uuid().optional().nullable(),
  purchaseDate: z.string().datetime().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  currencyId: z.string().uuid('Некорректный ID валюты'),

  items: z
    .array(CreatePurchaseItemSchema)
    .min(1, 'Должна быть хотя бы одна позиция'),
});

export type CreatePurchaseDto = z.infer<typeof CreatePurchaseSchema>;

// ─── Обновление закупки (только черновик) ────────────────────────────
export const UpdatePurchaseSchema = z.object({
  supplierId: z.string().uuid().optional().nullable(),
  kassaId: z.string().uuid().optional().nullable(),
  purchaseDate: z.string().datetime().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export type UpdatePurchaseDto = z.infer<typeof UpdatePurchaseSchema>;

// ─── Проведение закупки ──────────────────────────────────────────────
// Без кассы — товар приходуется, документ остаётся неоплаченным (CONFIRMED).
// exchangeRate перебивает справочник курсов: пригодится, когда курса на дату
// накладной в базе нет.
export const ConfirmPurchaseSchema = z.object({
  kassaId: z.string().uuid().optional().nullable(),
  exchangeRate: z.coerce.number().positive().optional().nullable(),
});

export type ConfirmPurchaseDto = z.infer<typeof ConfirmPurchaseSchema>;

// ─── Отмена проведённой закупки ──────────────────────────────────────
export const CancelPurchaseSchema = z.object({
  reason: z.string().max(500).optional().nullable(),
});

export type CancelPurchaseDto = z.infer<typeof CancelPurchaseSchema>;

// ─── Фильтр / поиск закупок ──────────────────────────────────────────
export const GetPurchaseQuerySchema = z.object({
  search: z.string().optional().catch(''),
  status: z.enum(PurchaseStatusValues).optional().catch(undefined),
  supplierId: z.string().uuid().optional().catch(undefined),
  sortField: z.string().optional().default('purchaseDate').optional(),
  order: z.enum(['asc', 'desc']).default('desc').optional(),
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
});

export type GetPurchaseQueryDto = z.infer<typeof GetPurchaseQuerySchema>;

// ─── Оплата по закупке ───────────────────────────────────────────────
export const PayPurchaseSchema = z.object({
  kassaId: z.string().uuid('Некорректный ID кассы'),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Некорректный формат суммы'),
  note: z.string().max(500).optional().nullable(),
});

export type PayPurchaseDto = z.infer<typeof PayPurchaseSchema>;

// ─── Партия товара ───────────────────────────────────────────────────
// costPrice — себестоимость единицы в валюте закупки,
// costPriceBase — она же в базовой валюте по курсу на дату накладной.
// costPriceBase заморожен: меняется курс — цифра в партии остаётся прежней.
export const ProductBatchSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  productVariantId: z.string().uuid(),
  batchNumber: z.string(),
  expiryDate: z.coerce.date().nullable().optional(),
  quantity: z.number(),
  remainingQuantity: z.number(),
  soldQuantity: z.number().optional(),
  costPrice: z.coerce.number(),
  costPriceBase: z.coerce.number(),
  currencyId: z.string().uuid(),
  receivedAt: z.coerce.date(),
  source: z.enum(BatchSourceValues),
  isValid: z.boolean(),
  createdAt: z.coerce.date(),
  purchaseId: z.string().uuid().nullable().optional(),
  purchaseItemId: z.string().uuid().nullable().optional(),
  supplierId: z.string().uuid().nullable().optional(),

  product_variant: z
    .object({
      id: z.string().uuid(),
      title: z.string(),
      sku: z.string().nullable().optional(),
      barcode: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  currency: z
    .object({
      id: z.string().uuid(),
      code: z.string(),
      symbol: z.string(),
    })
    .nullable()
    .optional(),
  supplier: z
    .object({
      id: z.string().uuid(),
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
      phone: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  purchase: z
    .object({
      id: z.string().uuid(),
      invoiceNumber: z.string().nullable(),
      purchaseDate: z.coerce.date().optional(),
    })
    .nullable()
    .optional(),
});

export type ProductBatch = z.infer<typeof ProductBatchSchema>;

export const BatchesListResponseSchema = z.object({
  items: z.array(ProductBatchSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const GetBatchesQuerySchema = z.object({
  variantId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  purchaseId: z.string().uuid().optional(),
  source: z.enum(BatchSourceValues).optional(),
  /** Строка, а не boolean: бэкенд валидирует через @IsBooleanString */
  onlyAvailable: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

export type GetBatchesQueryDto = z.infer<typeof GetBatchesQuerySchema>;

// ─── «За сколько куплен вариант» ─────────────────────────────────────
export const VariantCostSchema = z.object({
  variant: z.object({
    id: z.string().uuid(),
    title: z.string(),
    sku: z.string().nullable().optional(),
    barcode: z.string().nullable().optional(),
    defaultPrice: z.coerce.number().nullable().optional(),
  }),
  /** Остаток по таблице Stock */
  stockQuantity: z.number(),
  /** Остаток по сумме партий; расхождение — признак рассинхрона */
  batchesQuantity: z.number(),
  inSync: z.boolean(),
  batchesCount: z.number(),
  availableBatchesCount: z.number(),
  totalCostBase: z.coerce.number(),
  averageCostBase: z.coerce.number(),
  minCostBase: z.coerce.number(),
  maxCostBase: z.coerce.number(),
  lastPurchase: z
    .object({
      batchNumber: z.string(),
      costPrice: z.coerce.number(),
      costPriceBase: z.coerce.number(),
      currency: z
        .object({
          id: z.string().uuid(),
          code: z.string(),
          symbol: z.string(),
        })
        .nullable()
        .optional(),
      receivedAt: z.coerce.date(),
      supplier: z
        .object({
          id: z.string().uuid(),
          firstName: z.string().nullable(),
          lastName: z.string().nullable(),
        })
        .nullable()
        .optional(),
      purchase: z
        .object({
          id: z.string().uuid(),
          invoiceNumber: z.string().nullable(),
        })
        .nullable()
        .optional(),
    })
    .nullable()
    .optional(),
});

export type VariantCost = z.infer<typeof VariantCostSchema>;

// ─── История закупочных цен варианта ─────────────────────────────────
export const PriceHistoryItemSchema = z.object({
  purchaseId: z.string().uuid(),
  invoiceNumber: z.string().nullable(),
  purchaseDate: z.coerce.date(),
  supplier: z
    .object({
      id: z.string().uuid(),
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
    })
    .nullable()
    .optional(),
  currency: z
    .object({
      id: z.string().uuid(),
      code: z.string(),
      symbol: z.string(),
    })
    .nullable()
    .optional(),
  quantity: z.number(),
  price: z.coerce.number(),
  discount: z.coerce.number(),
  costPrice: z.coerce.number(),
  costPriceBase: z.coerce.number().nullable(),
  exchangeRate: z.coerce.number().nullable(),
  batchNumber: z.string().nullable(),
});

export type PriceHistoryItem = z.infer<typeof PriceHistoryItemSchema>;

export const PriceHistoryResponseSchema = z.array(PriceHistoryItemSchema);

// ─── Позиция закупки (ответ сервера) ─────────────────────────────────
export const PurchaseItemSchema = z.object({
  id: z.string().uuid(),
  productVariantId: z.string().uuid(),
  quantity: z.number(),

  price: z.coerce.number(),
  discount: z.coerce.number(),
  total: z.coerce.number(),

  batchNumber: z.string().nullable().optional(),
  expiryDate: z.coerce.date().nullable().optional(),

  product_variant: z
    .object({
      id: z.string().uuid(),
      title: z.string(),
      sku: z.string().nullable().optional(),
      barcode: z.string().nullable().optional(),
    })
    .optional()
    .nullable(),

  product_batches: z.array(z.any()).optional().default([]),
});

export type PurchaseItem = z.infer<typeof PurchaseItemSchema>;

export const PurchaseSuplierUser = z.object({
  id: z.string().uuid(),
  phone_numbers: z.array(z.any()).optional().default([]),
});

// ─── Полная закупка (ответ от сервера) ───────────────────────────────
export const PurchaseSchema = z.object({
  id: z.string().uuid(),
  invoiceNumber: z.string().nullable().optional(),
  organizationId: z.string().uuid(),
  supplierId: z.string().uuid(),
  responsibleId: z.string().uuid().nullable().optional(),
  kassaId: z.string().uuid().nullable().optional(),
  purchaseDate: z.coerce.date(),
  totalAmount: z.coerce.number(),
  paidAmount: z.coerce.number(),
  currencyId: z.string().uuid(),
  status: z.enum(PurchaseStatusValues),
  notes: z.string().nullable().optional(),

  /** Курс к базовой валюте, зафиксированный при проведении */
  exchangeRate: z.coerce.number().nullable().optional(),
  baseCurrencyId: z.string().uuid().nullable().optional(),
  confirmedAt: z.coerce.date().nullable().optional(),
  confirmedBy: z.string().nullable().optional(),

  items: z.array(PurchaseItemSchema).default([]),
  /** Партии, созданные проведением документа */
  product_batches: z.array(ProductBatchSchema).optional().default([]),
  currency: z
    .object({
      code: z.string(),
      symbol: z.string(),
    })
    .optional()
    .nullable(),
  baseCurrency: z
    .object({
      id: z.string().uuid(),
      code: z.string(),
      symbol: z.string(),
    })
    .optional()
    .nullable(),
  supplier: z
    .object({
      id: z.string().uuid(),
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
      phone: z.string().nullable(),
      user: PurchaseSuplierUser.optional().nullable(),
    })
    .nullable()
    .optional(),
  responsible: z
    .object({
      id: z.string().uuid(),
      email: z.string(),
      profile: z
        .object({
          firstName: z.string().nullable(),
          lastName: z.string().nullable(),
        })
        .optional()
        .nullable(),
    })
    .nullable()
    .optional(),
  kassa: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      type: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  payments: z.array(z.any()).optional().default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Purchase = z.infer<typeof PurchaseSchema>;

// ─── Ответ со списком закупок ────────────────────────────────────────
export const PurchasesListResponseSchema = z.object({
  items: z.array(PurchaseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});
