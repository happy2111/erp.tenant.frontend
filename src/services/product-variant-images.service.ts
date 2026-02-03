import api from '@/lib/axiosInstance';
import {
  CreateProductVariantImageDto,
  PresignedVariantImageUploadResponseSchema,
  ProductVariantImage,
  ProductVariantImagesListSchema,
} from '@/schemas/product-variant-images.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class ProductVariantImagesService {
  /**
   * Получить presigned URL для загрузки изображения варианта товара
   */
  static async getPresignedUrl(
    variantId: string,
    dto: CreateProductVariantImageDto
  ): Promise<{
    imageId: string;
    uploadUrl: string;
    key: string;
  }> {
    const res = await api.post<ApiResponse<any>>(
      `/product-variants/images/${variantId}/presign`,
      dto
    );

    return PresignedVariantImageUploadResponseSchema.parse(res.data.data);
  }

  /**
   * Выполнить загрузку файла по presigned URL
   * (обычно вызывается на клиенте после getPresignedUrl)
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
   * Получить список всех изображений конкретного варианта товара
   * (с публичными URL-ами)
   */
  static async listImages(variantId: string): Promise<ProductVariantImage[]> {
    const res = await api.get<ApiResponse<any[]>>(
      `/product-variants/images/${variantId}`
    );

    return ProductVariantImagesListSchema.parse(res.data.data);
  }

  /**
   * Удалить изображение варианта по его ID
   */
  static async deleteImage(imageId: string): Promise<void> {
    await api.delete(`/product-variants/images/${imageId}`);
  }

  /**
   * Удобный комбинированный метод:
   * 1. Запрос presigned URL
   * 2. Загрузка файла
   * 3. Возврат готового объекта изображения
   */
  static async uploadImage(
    variantId: string,
    file: File,
    isPrimary: boolean = false
  ): Promise<ProductVariantImage> {
    // 1. Получаем presigned URL
    const {uploadUrl, imageId, key} = await this.getPresignedUrl(variantId, {
      filename: file.name,
      isPrimary,
    });

    // 2. Загружаем файл на S3
    await this.uploadToPresignedUrl(uploadUrl, file, file.type);

    // 3. Получаем обновлённый список изображений варианта
    const images = await this.listImages(variantId);

    // Находим только что загруженное изображение
    const uploadedImage = images.find(img => img.id === imageId);

    if (!uploadedImage) {
      throw new Error('Изображение загружено, но не найдено в списке');
    }

    return uploadedImage;
  }
}