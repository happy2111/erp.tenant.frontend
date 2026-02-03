import api from '@/lib/axiosInstance';
import {
  CreateProductVariantDto,
  UpdateProductVariantDto,
  GetProductVariantQueryDto,
  ProductVariant,
  ProductVariantsListResponseSchema,
  ProductVariantSchema,
  VariantsByProductResponseSchema,
} from '@/schemas/product-variants.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class ProductVariantsService {
  /**
   * Получить список всех вариантов товаров (админ-панель)
   */
  static async getAllAdmin(
    query: GetProductVariantQueryDto = {}
  ): Promise<{ items: ProductVariant[]; total: number }> {
    const res = await api.get<
      ApiResponse<{ items: any[]; total: number }>
    >('/product-variants/admin/all', {
      params: query,
    });

    return ProductVariantsListResponseSchema.parse(res.data.data);
  }

  /**
   * Получить один вариант товара по ID
   */
  static async getByIdAdmin(id: string): Promise<ProductVariant> {
    const res = await api.get<ApiResponse<ProductVariant>>(
      `/product-variants/admin/${id}`
    );
    const variantData = res.data.data.data || res.data.data;
    return ProductVariantSchema.parse(variantData);
  }

  /**
   * Создать новый вариант товара
   */
  static async create(dto: CreateProductVariantDto): Promise<ProductVariant> {
    const res = await api.post<ApiResponse<ProductVariant>>(
      '/product-variants/create',
      dto
    );
    return res.data.data;
  }

  /**
   * Обновить существующий вариант товара
   */
  static async update(
    id: string,
    dto: UpdateProductVariantDto
  ): Promise<ProductVariant> {
    const res = await api.patch<ApiResponse<ProductVariant>>(
      `/product-variants/update/${id}`,
      dto
    );
    return res.data.data;
  }

  /**
   * Жёсткое удаление варианта товара
   * (только если нет связанных записей)
   */
  static async hardDelete(id: string): Promise<void> {
    await api.delete(`/product-variants/remove/${id}/hard`);
  }

  /**
   * Получить все варианты конкретного товара
   * (удобный эндпоинт без пагинации)
   */
  static async getVariantsByProduct(
    productId: string
  ): Promise<ProductVariant[]> {
    const res = await api.get<ApiResponse<any[]>>(
      `/product-variants/product/${productId}`
    );

    return VariantsByProductResponseSchema.parse(res.data.data);
  }
}