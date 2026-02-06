import { z } from 'zod';

export const SaleStatusValues = ['DRAFT', 'PENDING', 'PAID', 'CANCELLED'] as const;
export type SaleStatus = (typeof SaleStatusValues)[number];

export const CreateSaleItemSchema = z.object({
  productVariantId: z.string().uuid('Некорректный ID варианта товара'),
  quantity: z.number().int().positive('Количество должно быть > 0'),
  price: z.number().positive(),
});

export type CreateSaleItemDto = z.infer<typeof CreateSaleItemSchema>;

export const CreateSaleSchema = z.object({
  customerId: z.string().uuid().optional().nullable(),
  kassaId: z.string().uuid().optional().nullable(),
  status: z.enum(SaleStatusValues).optional().default('DRAFT'),
  notes: z.string().max(1000).optional().nullable(),
  currencyId: z.string().uuid('Некорректный ID валюты'),

  items: z
    .array(CreateSaleItemSchema)
    .min(1, 'Должна быть хотя бы одна позиция'),

  // Опциональная рассрочка (если нужна)
  installment: z
    .object({
      totalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/),
      initialPayment: z.string().regex(/^\d+(\.\d{1,2})?$/),
      totalMonths: z.number().int().positive(),
      dueDate: z.string().datetime().optional().nullable(),
      notes: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
});

export type CreateSaleDto = z.infer<typeof CreateSaleSchema>;

export const UpdateSaleSchema = z.object({
  customerId: z.string().uuid().optional().nullable(),
  kassaId: z.string().uuid().optional().nullable(),
  status: z.enum(SaleStatusValues).optional(),
  notes: z.string().max(1000).optional().nullable(),
});

export type UpdateSaleDto = z.infer<typeof UpdateSaleSchema>;

export const GetSaleQuerySchema = z.object({
  search: z.string().optional().catch(''),
  status: z.enum(SaleStatusValues).optional().catch(undefined),
  customerId: z.string().uuid().optional().catch(undefined),
  kassaId: z.string().uuid().optional().catch(undefined),
  responsibleId: z.string().uuid().optional().catch(undefined),
  sortField: z.string().optional().default('saleDate').optional(),
  order: z.enum(['asc', 'desc']).default('desc').optional(),
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
});

export type GetSaleQueryDto = z.infer<typeof GetSaleQuerySchema>;

export const SaleItemSchema = z.object({
  id: z.string().uuid(),
  productVariantId: z.string().uuid(),
  quantity: z.number(),
  price: z.number(),
  total: z.number(),
  currencyId: z.string().uuid(),
  product_variant: z
    .object({
      title: z.string(),
      sku: z.string().nullable().optional(),
    })
    .optional()
    .nullable(),
});

export type SaleItem = z.infer<typeof SaleItemSchema>;

export const SaleSchema = z.object({
  id: z.string().uuid(),
  invoiceNumber: z.string(),
  organizationId: z.string().uuid(),
  customerId: z.string().uuid().nullable().optional(),
  responsibleId: z.string().uuid(),
  kassaId: z.string().uuid().nullable().optional(),
  saleDate: z.coerce.date(),
  totalAmount: z.number(),
  paidAmount: z.number(),
  currencyId: z.string().uuid(),
  status: z.enum(SaleStatusValues),
  notes: z.string().nullable().optional(),

  items: z.array(SaleItemSchema).default([]),
  currency: z
    .object({
      code: z.string(),
      symbol: z.string(),
    })
    .optional()
    .nullable(),
  customer: z
    .object({
      id: z.string().uuid(),
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
      phone: z.string().nullable(),
    })
    .nullable()
    .optional(),
  kassa: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
    })
    .nullable()
    .optional(),
  responsible: z
    .object({
      id: z.string().uuid(),
      email: z.string(),
    })
    .nullable()
    .optional(),
  payments: z.array(z.any()).optional().default([]),
  installments: z.array(z.any()).optional().default([]),
});

export type Sale = z.infer<typeof SaleSchema>;

export const SalesListResponseSchema = z.object({
  items: z.array(SaleSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});