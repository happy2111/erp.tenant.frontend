import api from '@/lib/axiosInstance';
import {
  CreateProductDto,
  UpdateProductDto,
  GetProductQueryDto,
  Product,
  ProductsListResponseSchema,
  ProductSchema,
} from '@/schemas/products.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class ProductsService {
  /**
   * Получить список всех товаров организации (админ-панель)
   */
  static async getAllAdmin(
    query: GetProductQueryDto = {}
  ): Promise<{ items: Product[]; total: number }> {
    const res = await api.get<
      ApiResponse<{ items: any[]; total: number }>
    >('/products/admin/all', {
      params: query,
    });

    return ProductsListResponseSchema.parse(res.data.data);
  }

  /**
   * Получить один товар по ID (со всеми связанными данными)
   */
  static async getByIdAdmin(id: string): Promise<Product> {
    const res = await api.get<ApiResponse<Product>>(
      `/products/admin/${id}`
    );
    return ProductSchema.parse(res.data.data);
  }

  /**
   * Создать новый товар
   * (organizationId берётся автоматически из токена)
   */
  static async create(dto: CreateProductDto): Promise<Product> {
    const res = await api.post<ApiResponse<Product>>(
      '/products/create',
      dto
    );
    return res.data.data;
  }

  /**
   * Обновить существующий товар
   */
  static async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const res = await api.patch<ApiResponse<Product>>(
      `/products/update/${id}`,
      dto
    );
    return res.data.data;
  }

  /**
   * Жёсткое удаление товара
   * (только если нет связанных вариантов, цен, изображений, категорий)
   */
  static async hardDelete(id: string): Promise<void> {
    await api.delete(`/products/remove/${id}/hard`);
  }
}