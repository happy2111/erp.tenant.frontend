import api from '@/lib/axiosInstance';
import {
  CreateProductPriceDto,
  UpdateProductPriceDto,
  GetProductPriceQueryDto,
  ProductPrice,
  ProductPricesListResponseSchema,
  ProductPriceSchema,
} from '@/schemas/product-prices.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class ProductPricesService {
  /**
   * Получить список всех цен (админ-панель)
   */
  static async getAllAdmin(
    query: GetProductPriceQueryDto = {}
  ): Promise<{ items: ProductPrice[]; total: number }> {
    const res = await api.get<
      ApiResponse<{ items: any[]; total: number }>
    >('/product-prices/admin/all', {
      params: query,
    });

    return ProductPricesListResponseSchema.parse(res.data.data);
  }

  /**
   * Получить одну цену по ID
   */
  static async getByIdAdmin(id: string): Promise<ProductPrice> {
    const res = await api.get<ApiResponse<ProductPrice>>(
      `/product-prices/admin/${id}`
    );
    return ProductPriceSchema.parse(res.data.data);
  }

  /**
   * Создать новую цену для товара
   */
  static async create(dto: CreateProductPriceDto): Promise<ProductPrice> {
    const res = await api.post<ApiResponse<ProductPrice>>(
      '/product-prices/create',
      dto
    );
    return res.data.data;
  }

  /**
   * Обновить существующую цену
   */
  static async update(
    id: string,
    dto: UpdateProductPriceDto
  ): Promise<ProductPrice> {
    const res = await api.patch<ApiResponse<ProductPrice>>(
      `/product-prices/update/${id}`,
      dto
    );
    return res.data.data;
  }

  /**
   * Жёсткое удаление цены
   */
  static async hardDelete(id: string): Promise<void> {
    await api.delete(`/product-prices/remove/${id}/hard`);
  }
}