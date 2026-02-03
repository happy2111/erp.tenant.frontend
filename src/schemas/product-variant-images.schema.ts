import { z } from 'zod';

// ─── DTO для запроса presigned URL (загрузка изображения варианта) ───
export const CreateProductVariantImageSchema = z.object({
  filename: z.string().min(1, 'Имя файла обязательно'),
  isPrimary: z.boolean().optional().default(false),
});

export type CreateProductVariantImageDto = z.infer<typeof CreateProductVariantImageSchema>;

// ─── Ответ с presigned URL для загрузки ──────────────────────────────
export const PresignedVariantImageUploadResponseSchema = z.object({
  imageId: z.string().uuid(),
  uploadUrl: z.string().url(),
  key: z.string(),
});

export type PresignedVariantImageUploadResponse = z.infer<typeof PresignedVariantImageUploadResponseSchema>;

// ─── Изображение варианта товара ─────────────────────────────────────
export const ProductVariantImageSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  url: z.string().url(),           // публичный URL после getDownloadUrl
  isPrimary: z.boolean(),
  createdAt: z.coerce.date().optional(),
});

export type ProductVariantImage = z.infer<typeof ProductVariantImageSchema>;

// ─── Массив изображений варианта ─────────────────────────────────────
export const ProductVariantImagesListSchema = z.array(ProductVariantImageSchema);