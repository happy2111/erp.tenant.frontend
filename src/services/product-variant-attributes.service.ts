import api from '@/lib/axiosInstance';
import {
  CreateProductVariantAttributeDto,
  UpdateProductVariantAttributeDto,
  GetProductVariantAttributesQueryDto,
  ProductVariantAttribute,
  ProductVariantAttributesListResponseSchema,
  ProductVariantAttributeSchema,
} from '@/schemas/product-variant-attributes.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class ProductVariantAttributesService {
  /**
   * Получить список всех связей вариант ↔ значение атрибута
   */
  static async getAllAdmin(
    query: GetProductVariantAttributesQueryDto = {}
  ): Promise<{ items: ProductVariantAttribute[]; total: number }> {
    const res = await api.get<
      ApiResponse<{ items: any[]; total: number }>
    >('/product-variant-attributes/admin/all', {
      params: query,
    });

    return ProductVariantAttributesListResponseSchema.parse(res.data.data);
  }

  /**
   * Получить одну связь по ID
   */
  static async getByIdAdmin(id: string): Promise<ProductVariantAttribute> {
    const res = await api.get<ApiResponse<ProductVariantAttribute>>(
      `/product-variant-attributes/admin/${id}`
    );
    return ProductVariantAttributeSchema.parse(res.data.data);
  }

  /**
   * Создать новую связь вариант товара ↔ значение атрибута
   */
  static async create(
    dto: CreateProductVariantAttributeDto
  ): Promise<ProductVariantAttribute> {
    const res = await api.post<ApiResponse<ProductVariantAttribute>>(
      '/product-variant-attributes/create',
      dto
    );
    return res.data.data;
  }

  /**
   * Обновить существующую связь (менять variant или value редко нужно,
   * но оставляем для полноты API)
   */
  static async update(
    id: string,
    dto: UpdateProductVariantAttributeDto
  ): Promise<ProductVariantAttribute> {
    const res = await api.patch<ApiResponse<ProductVariantAttribute>>(
      `/product-variant-attributes/update/${id}`,
      dto
    );
    return res.data.data;
  }

  /**
   * Жёсткое удаление связи
   */
  static async hardDelete(id: string): Promise<void> {
    await api.delete(`/product-variant-attributes/remove/${id}/hard`);
  }
}