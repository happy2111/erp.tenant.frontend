// src/services/product-images.service.ts
import api from '@/lib/axiosInstance';
import {
  CreateProductImageDto,
  PresignedUploadResponseSchema,
  ProductImage,
  ProductImagesListSchema,
} from '@/schemas/product-images.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class ProductImagesService {
  /**
   * Получить presigned URL для загрузки изображения товара
   *
   * @param productId - ID товара
   * @param dto - { filename, isPrimary? }
   * @returns { imageId, uploadUrl, key }
   */
  static async getPresignedUrl(
    productId: string,
    dto: CreateProductImageDto
  ): Promise<{
    imageId: string;
    uploadUrl: string;
    key: string;
  }> {
    const res = await api.post<ApiResponse<any>>(
      `/products/images/${productId}/presign`,
      dto
    );

    return PresignedUploadResponseSchema.parse(res.data.data);
  }

  /**
   * Загрузить файл по presigned URL (обычно вызывается на клиенте после getPresignedUrl)
   *
   * @param uploadUrl - presigned URL от сервера
   * @param file - File объект из <input type="file">
   * @param contentType - mime-тип файла (опционально)
   */
  static async uploadToPresignedUrl(
    uploadUrl: string,
    file: File,
    contentType?: string
  ): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': contentType || file.type || 'application/octet-stream',
    };

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Ошибка загрузки: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Получить список всех изображений товара
   * (с публичными URL-ами)
   */
  static async listProductImages(productId: string): Promise<ProductImage[]> {
    const res = await api.get<ApiResponse<any[]>>(
      `/products/images/${productId}`
    );

    return ProductImagesListSchema.parse(res.data.data);
  }

  /**
   * Удалить изображение по его ID
   */
  static async deleteImage(imageId: string): Promise<void> {
    await api.delete(`/products/images/${imageId}`);
  }

  /**
   * Удобный комбинированный метод: запрос URL → загрузка → возврат готового изображения
   *
   * @returns готовый объект изображения с url
   */
  static async uploadImage(
    productId: string,
    file: File,
    isPrimary: boolean = false
  ): Promise<ProductImage> {
    // 1. Получаем presigned URL
    const { uploadUrl, imageId, key } = await this.getPresignedUrl(productId, {
      filename: file.name,
      isPrimary,
    });

    // 2. Загружаем файл
    await this.uploadToPresignedUrl(uploadUrl, file, file.type);

    // 3. Получаем обновлённый список (или можно сразу сформировать объект)
    const images = await this.listProductImages(productId);

    // Находим только что загруженное изображение
    const uploadedImage = images.find(img => img.id === imageId);

    if (!uploadedImage) {
      throw new Error('Изображение загружено, но не найдено в списке');
    }

    return uploadedImage;
  }
}