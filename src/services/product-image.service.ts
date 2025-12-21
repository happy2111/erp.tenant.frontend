import api from "@/lib/axiosInstance";
import { ProductImage, CreateProductImageDto } from "@/schemas/product-image.schema";

export class ProductImagesService {
  /**
   * Загрузить изображение для товара
   * @param productId ID товара
   * @param file Файл из input type="file"
   * @param dto Дополнительные данные (isPrimary)
   */
  async upload(
    productId: string,
    file: File,
    dto: CreateProductImageDto
  ): Promise<ProductImage> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("isPrimary", String(dto.isPrimary));

    const res = await api.post(`/products/images/${productId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    // В NestJS обычно возвращается объект напрямую или в поле data
    return res.data;
  }

  /**
   * Получить список всех изображений товара
   */
  async list(productId: string): Promise<ProductImage[]> {
    const res = await api.get(`/products/images/${productId}`);
    return res.data;
  }

  /**
   * Удалить изображение
   */
  async remove(imageId: string): Promise<void> {
    await api.delete(`/products/images/${imageId}`);
  }
}

export const productImagesService = new ProductImagesService();