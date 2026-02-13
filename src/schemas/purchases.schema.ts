// src/schemas/purchases.schema.ts
import { z } from 'zod';

// ─── Статусы закупки ─────────────────────────────────────────────────
export const PurchaseStatusValues = [
  'DRAFT',
  'PARTIAL',
  'PAID',
  'CANCELLED',
] as const;

export type PurchaseStatus = (typeof PurchaseStatusValues)[number];

// ─── Позиция в закупке (одна строка накладной) ──────────────────────
export const CreatePurchaseItemSchema = z.object({
  productVariantId: z.string().uuid('Некорректный ID варианта товара'),
  quantity: z.number().int().positive('Количество должно быть > 0'),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Некорректный формат цены'),
  discount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional()
    .default('0'),
  batchNumber: z.string().max(64).optional().nullable(),
  expiryDate: z.string().datetime().optional().nullable(),
});

export type CreatePurchaseItemDto = z.infer<typeof CreatePurchaseItemSchema>;

// ─── Создание закупки ────────────────────────────────────────────────
export const CreatePurchaseSchema = z.object({
  supplierId: z.string().uuid('Некорректный ID поставщика'),
  kassaId: z.string().uuid().optional().nullable(),
  status: z.enum(PurchaseStatusValues).optional().default('DRAFT'),
  notes: z.string().max(1000).optional().nullable(),
  currencyId: z.string().uuid('Некорректный ID валюты'),

  items: z
    .array(CreatePurchaseItemSchema)
    .min(1, 'Должна быть хотя бы одна позиция'),

  initialPayment: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional()
    .nullable(),
});

export type CreatePurchaseDto = z.infer<typeof CreatePurchaseSchema>;

// ─── Обновление закупки ──────────────────────────────────────────────
export const UpdatePurchaseSchema = z.object({
  supplierId: z.string().uuid().optional().nullable(),
  kassaId: z.string().uuid().optional().nullable(),
  status: z.enum(PurchaseStatusValues).optional(),
  notes: z.string().max(1000).optional().nullable(),
});

export type UpdatePurchaseDto = z.infer<typeof UpdatePurchaseSchema>;

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
})

// ─── Полная закупка (ответ от сервера) ───────────────────────────────
export const PurchaseSchema = z.object({
  id: z.string().uuid(),
  invoiceNumber: z.string().nullable().optional(),
  organizationId: z.string().uuid(),
  supplierId: z.string().uuid(),
  responsibleId: z.string().uuid().nullable().optional(),
  kassaId: z.string().uuid().nullable().optional(),
  purchaseDate: z.coerce.date(),
  totalAmount: z.number(),
  paidAmount: z.number(),
  currencyId: z.string().uuid(),
  status: z.enum(PurchaseStatusValues),
  notes: z.string().nullable().optional(),

  items: z.array(PurchaseItemSchema).default([]),
  currency: z
    .object({
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