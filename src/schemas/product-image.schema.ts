import { z } from "zod";

export const createProductImageSchema = z.object({
  isPrimary: z.boolean().optional().default(false),
  // Поле file не добавляем в схему, так как оно передается отдельно в FormData
});

export type CreateProductImageDto = z.infer<typeof createProductImageSchema>;

export interface ProductImage {
  id: string;
  productId: string | null;
  productVariantId: string | null;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
}