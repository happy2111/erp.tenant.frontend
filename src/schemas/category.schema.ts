import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, { message: "Название категории обязательно" })
    .max(100, { message: "Название не должно превышать 100 символов" }),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, { message: "Название категории обязательно" })
    .max(100, { message: "Название не должно превышать 100 символов" })
    .optional(),
});

export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;

export const categoryFilterSchema = z.object({
  search: z.string().optional(),
  page: z
    .number()
    .int()
    .min(1)
    .default(1)
    .optional(),
  limit: z
    .number()
    .int()
    .min(1)
    .default(10)
    .optional(),
});

export type CategoryFilterDto = z.infer<typeof categoryFilterSchema>;

export interface Category {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  products?: Array<{
    id: string;
    name: string;
    // другие поля товара
  }>;
}

export interface PaginatedCategories {
  data: Category[];
  total: number;
  page: number;
  limit: number;
}

export interface DeleteCategoryResponse {
  message: string;
}