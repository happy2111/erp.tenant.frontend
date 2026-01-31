// src/schemas/product-images.schema.ts
import { z } from 'zod';

// ─── DTO для запроса presigned URL (загрузка) ───────────────────────
export const CreateProductImageSchema = z.object({
  filename: z.string().min(1, 'Имя файла обязательно'),
  isPrimary: z.boolean().optional().default(false),
});

export type CreateProductImageDto = z.infer<typeof CreateProductImageSchema>;

// ─── Ответ после запроса presigned URL ───────────────────────────────
export const PresignedUploadResponseSchema = z.object({
  imageId: z.string().uuid(),
  uploadUrl: z.string().url(),
  key: z.string(),
});

export type PresignedUploadResponse = z.infer<typeof PresignedUploadResponseSchema>;

// ─── Изображение товара (в списке и деталях) ─────────────────────────
export const ProductImageSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  url: z.string().url(),           // публичный URL после getDownloadUrl
  isPrimary: z.boolean(),
  createdAt: z.coerce.date().optional(),
});

export type ProductImage = z.infer<typeof ProductImageSchema>;

// ─── Массив изображений товара ───────────────────────────────────────
export const ProductImagesListSchema = z.array(ProductImageSchema);