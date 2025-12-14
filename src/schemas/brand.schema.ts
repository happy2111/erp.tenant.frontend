import { z } from "zod";

export const createBrandSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Название бренда обязательно" })
    .max(100, { message: "Название не должно превышать 100 символов" }),
});

export type CreateBrandDto = z.infer<typeof createBrandSchema>;

export const updateBrandSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Название бренда обязательно" })
    .max(100, { message: "Название не должно превышать 100 символов" })
    .optional(),
});

export type UpdateBrandDto = z.infer<typeof updateBrandSchema>;

export const brandFilterSchema = z.object({
  search: z.string().optional(),
  page: z
    .number()
    .int()
    .positive()
    .default(1)
    .optional(),
  limit: z
    .number()
    .int()
    .positive()
    .default(10)
    .optional(),
});

export type BrandFilterDto = z.infer<typeof brandFilterSchema>;

export interface Brand {
  id: string;
  name: string;
  createdAt?: string;
  products?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

export interface PaginatedBrands {
  data: Brand[];
  total: number;
  page: number;
  limit: number;
}