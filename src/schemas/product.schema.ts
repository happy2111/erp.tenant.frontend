import { z } from "zod";
import { Brand } from "./brands.schema";
import { Category } from "./category.schema";
import { ProductPrice } from "./product-prices.schema";
import {ProductImage} from "@/schemas/product-image.schema";

const uuidSchema = z.string().uuid({ message: "Неверный формат UUID" });

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Название товара обязательно" })
    .max(200, { message: "Название не должно превышать 200 символов" }),
  description: z.string().optional(),
  brandId: uuidSchema.optional(),
  organizationId: uuidSchema,
});

export type CreateProductDto = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();

export type UpdateProductDto = z.infer<typeof updateProductSchema>;

export const productFilterSchema = z.object({
  search: z.string().optional(),
  page: z.number().int().positive().default(1).optional(),
  limit: z.number().int().positive().default(10).optional(),
});

export type ProductFilterDto = z.infer<typeof productFilterSchema>;


export interface ProductVariant {
  id: string;
  productId: string;
  sku: string | null;
  barcode: string | null;
  title: string;
  defaultPrice: number | null; // В зависимости от того, как вы работаете с числами
  currencyId: string | null;
  createdAt: Date;
  updatedAt: Date;

  currency?: any; // Можно заменить на интерфейс Currency
  product?: any;  // Можно заменить на интерфейс Product
  product_instance?: any[];
  product_variant_attribute?: any[];
  product_batches?: any[];
  stocks?: any[];
  purchase_items?: any[];
  sele_items?: any[];
  images?: any[];
}

export interface ProductStock {
  id: string;
  organizationId: string;
  productVariantId: string;
  quantity: number;
  updatedAt: Date;

  organization?: any; // Можно заменить на интерфейс Organization
  product_variant?: ProductVariant;
}

export interface Product {
  id: string;
  code: string;               // Уникальный артикул или код товара
  organizationId: string;
  name: string;
  description: string | null;
  brandId: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Связи (Relations)
  organization?: any;         // Organization
  brand?: {
    id: string;
    name: string
  };                // Brand | null
  categories?: any[];         // ProductCategory[]
  prices?: any[];             // ProductPrice[]
  variants?: ProductVariant[]; // Связь с вашими вариантами
  images?: ProductImage[];             // ProductImage[]
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

// Интерфейс для расширенного товара (с дополнительными данными)
export interface ProductWithDetails extends Product {
  brand?: Brand;
  categories: Category[];
  prices: ProductPrice[];
  mainPrice?: ProductPrice;
  totalStock?: number;
}

// // Хелпер для получения основной цены товара
// export function getMainPrice(product: Product): ProductPrice | undefined {
//   return product.prices?.find(price =>
//     price.priceType === 'CASH' && !price.customerType
//   ) || product.prices?.[0];
// }
//
// // Хелпер для получения общего остатка
// export function getTotalStock(product: Product): number {
//   return product.stocks?.reduce((sum, stock) => sum + stock.quantity, 0) || 0;
// }