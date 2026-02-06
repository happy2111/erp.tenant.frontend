import { z } from 'zod';
import {MinimalCurrencySchema} from "@/schemas/product-prices.schema";
import {ProductSchema} from "@/schemas/products.schema";
import {StockSchema} from "@/schemas/stocks.schema";

// ─── Создание варианта товара ────────────────────────────────────────
export const CreateProductVariantSchema = z.object({
  productId: z.string().uuid('Некорректный ID товара'),
  sku: z.string().max(64).optional().nullable(),
  barcode: z.string().max(64).optional().nullable(),
  title: z.string().min(1).max(255),
  defaultPrice: z.coerce.number().positive().nullable().optional(),
  currencyId: z.string().uuid('Некорректный ID валюты').optional().nullable().optional(),
});

export type CreateProductVariantDto = z.infer<typeof CreateProductVariantSchema>;

// ─── Обновление варианта товара ──────────────────────────────────────
export const UpdateProductVariantSchema = CreateProductVariantSchema.partial();

export type UpdateProductVariantDto = z.infer<typeof UpdateProductVariantSchema>;

// ─── Параметры запроса списка вариантов ──────────────────────────────
export const GetProductVariantsQuerySchema = z.object({
  search: z.string().optional().catch(''),
  productId: z.string().uuid().optional().catch(undefined),
  sortField: z.string().optional().catch('title'),
  order: z.enum(['asc', 'desc']).catch('desc').optional(),
  page: z.coerce.number().min(1).catch(1).optional(),
  limit: z.coerce.number().min(1).max(100).catch(20).optional(),
});

export type GetProductVariantQueryDto = z.infer<typeof GetProductVariantsQuerySchema>;

// ─── Атрибут варианта (упрощённый, как возвращает бэкенд) ────────────
export const VariantAttributeSchema = z.object({
  key: z.string(),
  name: z.string(),
  value: z.string(),
});

export type VariantAttribute = z.infer<typeof VariantAttributeSchema>;

// ─── Вариант товара (ответ от сервера) ───────────────────────────────
export const ProductVariantSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  sku: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  title: z.string(),
  defaultPrice: z.coerce.number().nullable().optional(),
  currencyId: z.string().uuid().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  // упрощённые атрибуты (как в CleanProductVariant)
  attributes: z.array(VariantAttributeSchema).default([]),
  currency: MinimalCurrencySchema.optional().nullable(),
  images: z.array(z.any()).default([]),
  product: z.object({
    id: z.string().uuid(),
    name: z.string(),
    code: z.string().optional().nullable(),
    prices: ProductSchema.shape.prices.optional().default([]),
  }).optional().nullable(),
  stocks: z.array(
    z.object({
      quantity: z.coerce.number().default(0),
    })
  ).default([]),
});

export type ProductVariant = z.infer<typeof ProductVariantSchema>;

// ─── Ответ со списком вариантов ──────────────────────────────────────
export const ProductVariantsListResponseSchema = z.object({
  items: z.array(ProductVariantSchema),
  total: z.number(),
});

// ─── Ответ со списком вариантов конкретного товара (без пагинации) ───
export const VariantsByProductResponseSchema = z.array(ProductVariantSchema);