// src/schemas/product-variant-attributes.schema.ts
import { z } from 'zod';

// ─── Создание связи вариант ↔ значение атрибута ──────────────────────
export const CreateProductVariantAttributeSchema = z.object({
  productVariantId: z.string().uuid('Некорректный ID варианта товара'),
  attributeValueId: z.string().uuid('Некорректный ID значения атрибута'),
});

export type CreateProductVariantAttributeDto = z.infer<typeof CreateProductVariantAttributeSchema>;

// ─── Обновление связи (редко используется, но оставляем) ─────────────
export const UpdateProductVariantAttributeSchema = z.object({
  productVariantId: z.string().uuid().optional(),
  attributeValueId: z.string().uuid().optional(),
}).refine(
  (data) => data.productVariantId !== undefined || data.attributeValueId !== undefined,
  { message: 'Необходимо указать хотя бы одно поле для обновления' }
);

export type UpdateProductVariantAttributeDto = z.infer<typeof UpdateProductVariantAttributeSchema>;

// ─── Параметры запроса списка связей ─────────────────────────────────
export const GetProductVariantAttributesQuerySchema = z.object({
  search: z.string().optional().catch(''),
  productVariantId: z.string().uuid().optional().catch(undefined),
  attributeValueId: z.string().uuid().optional().catch(undefined),
  sortField: z.string().optional().catch('createdAt').optional(),
  order: z.enum(['asc', 'desc']).catch('desc').optional(),
  page: z.coerce.number().min(1).catch(1).optional(),
  limit: z.coerce.number().min(1).max(100).catch(50).optional(),
});

export type GetProductVariantAttributesQueryDto = z.infer<typeof GetProductVariantAttributesQuerySchema>;

// ─── Минимальная структура ответа для связанной сущности ─────────────
export const MinimalAttributeValueSchema = z.object({
  id: z.string().uuid(),
  value: z.string(),
  attribute: z.object({
    id: z.string().uuid(),
    key: z.string(),
    name: z.string(),
  }).nullable().optional(),
});

export const MinimalProductVariantSchema = z.object({
  id: z.string().uuid(),
  sku: z.string().nullable().optional(),
  // можно расширить при необходимости: title, defaultPrice и т.д.
});

// ─── Полная связь (ответ от сервера) ─────────────────────────────────
export const ProductVariantAttributeSchema = z.object({
  id: z.string().uuid(),
  productVariantId: z.string().uuid(),
  attributeValueId: z.string().uuid(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  // расширенные данные (как возвращает бэкенд)
  variant: MinimalProductVariantSchema.optional().nullable(),
  value: MinimalAttributeValueSchema.optional().nullable(),
});

export type ProductVariantAttribute = z.infer<typeof ProductVariantAttributeSchema>;

// ─── Ответ со списком связей ─────────────────────────────────────────
export const ProductVariantAttributesListResponseSchema = z.object({
  items: z.array(ProductVariantAttributeSchema),
  total: z.number(),
});