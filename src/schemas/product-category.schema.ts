import { z } from "zod";
import { Category } from "./category.schema";
import { Brand } from "./brands.schema";

// UUID валидация
const uuidSchema = z.string().uuid({ message: "Неверный формат UUID" });

export const createProductCategorySchema = z.object({
  productId: uuidSchema,
  categoryId: uuidSchema,
});

export type CreateProductCategoryDto = z.infer<typeof createProductCategorySchema>;

export const deleteProductCategorySchema = z.object({
  productId: uuidSchema,
  categoryId: uuidSchema,
});

export type DeleteProductCategoryDto = z.infer<typeof deleteProductCategorySchema>;

// Интерфейсы для ответов API
export interface ProductCategory {
  productId: string;
  categoryId: string;
  product?: {
    id: string;
    name: string;
    brand?: Brand;
    // другие поля товара
  };
  category?: Category;
}

export interface ProductWithCategories {
  productId: string;
  category: Category;
}

export interface CategoryWithProducts {
  categoryId: string;
  product: {
    id: string;
    name: string;
    brand?: Brand;
    // другие поля товара
  };
}