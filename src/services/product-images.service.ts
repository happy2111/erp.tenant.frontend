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


  static async listProductImages(productId: string): Promise<ProductImage[]> {
    const res = await api.get<ApiResponse<any[]>>(
      `/products/images/${productId}`
    );

    return ProductImagesListSchema.parse(res.data.data);
  }


  static async deleteImage(imageId: string): Promise<void> {
    await api.delete(`/products/images/${imageId}`);
  }


  static async uploadImage(
    productId: string,
    file: File,
    isPrimary: boolean = false
  ): Promise<ProductImage> {
    const { uploadUrl, imageId, key } = await this.getPresignedUrl(productId, {
      filename: file.name,
      isPrimary,
    });
    await this.uploadToPresignedUrl(uploadUrl, file, file.type);

    const images = await this.listProductImages(productId);

    const uploadedImage = images.find(img => img.id === imageId);

    if (!uploadedImage) {
      throw new Error('Изображение загружено, но не найдено в списке');
    }

    return uploadedImage;
  }
}