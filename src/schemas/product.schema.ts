import { z } from "zod";
import { Brand } from "./brand.schema";
import { Category } from "./category.schema";
import { ProductPrice } from "./product-price.schema";

// UUID валидация
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
  name: string;
  sku: string;
  // другие поля варианта
}

export interface ProductStock {
  id: string;
  quantity: number;
  // другие поля остатка
}

export interface Product {
  id: string;
  code: string;
  organizationId: string;
  name: string;
  description?: string;
  brandId?: string;
  createdAt?: string;
  updatedAt?: string;

  // Relations (included in API responses)
  brand?: Brand;
  categories: Category[];
  prices: ProductPrice[];
  variants?: ProductVariant[];
  stocks?: ProductStock[];
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

// Хелпер для получения основной цены товара
export function getMainPrice(product: Product): ProductPrice | undefined {
  return product.prices?.find(price =>
    price.priceType === 'CASH' && !price.customerType
  ) || product.prices?.[0];
}

// Хелпер для получения общего остатка
export function getTotalStock(product: Product): number {
  return product.stocks?.reduce((sum, stock) => sum + stock.quantity, 0) || 0;
}