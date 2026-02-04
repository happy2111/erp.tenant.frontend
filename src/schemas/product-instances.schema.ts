import { z } from 'zod';

// Предполагаем, что ProductStatus уже определён где-то в проекте
export const ProductStatusValues = ['IN_STOCK', 'SOLD', 'RETURNED', 'LOST'] as const;
export type ProductStatus = typeof ProductStatusValues[number];

// ─── Создание экземпляра ─────────────────────────────────────────────
export const CreateProductInstanceSchema = z.object({
  productVariantId: z.string().uuid().optional().nullable(),
  serialNumber: z.string().min(3).max(64),
  currentStatus: z.enum(ProductStatusValues).optional().default('IN_STOCK'),
  currentOwnerId: z.string().uuid().optional().nullable(),
});

export type CreateProductInstanceDto = z.infer<typeof CreateProductInstanceSchema>;

// ─── Обновление экземпляра ───────────────────────────────────────────
export const UpdateProductInstanceSchema = z.object({
  productVariantId: z.string().uuid().optional().nullable(),
  currentStatus: z.enum(ProductStatusValues).optional(),
  currentOwnerId: z.string().uuid().optional().nullable(),
});

export type UpdateProductInstanceDto = z.infer<typeof UpdateProductInstanceSchema>;

// ─── Фильтр / параметры списка ───────────────────────────────────────
export const FindAllProductInstanceSchema = z.object({
  productVariantId: z.string().uuid().optional(),
  serialNumber: z.string().optional(),
  status: z.enum(ProductStatusValues).optional(),
  currentOwnerId: z.string().uuid().optional(),
  sortField: z.string().default('createdAt').optional(),
  order: z.enum(['asc', 'desc']).default('desc').optional(),
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
});

export type FindAllProductInstanceDto = z.infer<typeof FindAllProductInstanceSchema>;

// ─── Действия над экземпляром ────────────────────────────────────────
export const SellInstanceSchema = z.object({
  instanceId: z.string().uuid(),
  customerId: z.string().uuid(),
  saleId: z.string().uuid().optional(),
  description: z.string().optional(),
});

export const ReturnInstanceSchema = z.object({
  instanceId: z.string().uuid(),
  fromCustomerId: z.string().uuid().optional(),
  toOrganizationId: z.string().uuid().optional(),
  description: z.string().optional(),
});

export const TransferInstanceSchema = z.object({
  instanceId: z.string().uuid(),
  toOrganizationId: z.string().uuid(),
  description: z.string().optional(),
});

export const ResellInstanceSchema = z.object({
  instanceId: z.string().uuid(),
  newCustomerId: z.string().uuid(),
  saleId: z.string().uuid().optional(),
  description: z.string().optional(),
});

export const MarkLostSchema = z.object({
  instanceId: z.string().uuid(),
  description: z.string().optional(),
});

export type SellInstanceDto = z.infer<typeof SellInstanceSchema>;
export type ReturnInstanceDto = z.infer<typeof ReturnInstanceSchema>;
export type TransferInstanceDto = z.infer<typeof TransferInstanceSchema>;
export type ResellInstanceDto = z.infer<typeof ResellInstanceSchema>;
export type MarkLostDto = z.infer<typeof MarkLostSchema>;

// ─── Экземпляр товара (основная сущность ответа) ─────────────────────
export const ProductInstanceSchema = z.object({
  id: z.string().uuid(),
  productVariantId: z.string().uuid().nullable().optional(),
  serialNumber: z.string(),
  organizationId: z.string().uuid(),
  currentOwnerId: z.string().uuid().nullable().optional(),
  currentStatus: z.enum(ProductStatusValues),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  // связи (как возвращает бэкенд)
  productVariant: z
    .object({
      id: z.string().uuid(),
      title: z.string(),
      product: z.object({
        id: z.string().uuid(),
        name: z.string(),
        code: z.string(),
      }).nullable().optional(),
    })
    .nullable()
    .optional(),

  current_owner: z
    .object({
      id: z.string().uuid(),
      firstName: z.string(),
      lastName: z.string(),
      phone: z.string(),
    })
    .nullable()
    .optional(),

  transactions: z.array(z.any()).optional().default([]), // можно уточнить тип транзакции
});

export type ProductInstance = z.infer<typeof ProductInstanceSchema>;

// ─── Ответ со списком экземпляров ────────────────────────────────────
export const ProductInstancesListResponseSchema = z.object({
  data: z.array(ProductInstanceSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});