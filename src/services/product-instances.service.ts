import api from '@/lib/axiosInstance';
import {
  CreateProductInstanceDto,
  UpdateProductInstanceDto,
  FindAllProductInstanceDto,
  SellInstanceDto,
  ReturnInstanceDto,
  TransferInstanceDto,
  ResellInstanceDto,
  MarkLostDto,
  ProductInstance,
  ProductInstancesListResponseSchema,
  ProductInstanceSchema,
} from '@/schemas/product-instances.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class ProductInstancesService {
  /**
   * Создать новый экземпляр товара
   */
  static async create(dto: CreateProductInstanceDto): Promise<ProductInstance> {
    const res = await api.post<ApiResponse<ProductInstance>>(
      '/product-instances',
      dto
    );
    return ProductInstanceSchema.parse(res.data.data);
  }

  /**
   * Получить список всех экземпляров с фильтрами и пагинацией
   */
  static async findAll(
    filter: FindAllProductInstanceDto = {}
  ): Promise<{
    data: ProductInstance[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const res = await api.get<ApiResponse<any>>(
      '/product-instances/admin/all',
      { params: filter }
    );

    return ProductInstancesListResponseSchema.parse(res.data.data);
  }

  /**
   * Получить детальную информацию по одному экземпляру
   */
  static async findOne(id: string): Promise<ProductInstance> {
    const res = await api.get<ApiResponse<ProductInstance>>(
      `/product-instances/${id}`
    );
    return ProductInstanceSchema.parse(res.data.data);
  }

  /**
   * Обновить экземпляр товара
   */
  static async update(
    id: string,
    dto: UpdateProductInstanceDto
  ): Promise<ProductInstance> {
    const res = await api.patch<ApiResponse<ProductInstance>>(
      `/product-instances/${id}`,
      dto
    );
    return ProductInstanceSchema.parse(res.data.data);
  }

  /**
   * Удалить экземпляр товара
   */
  static async remove(id: string): Promise<void> {
    await api.delete(`/product-instances/${id}`);
  }

  /**
   * Продать экземпляр товара
   */
  static async sell(dto: SellInstanceDto): Promise<ProductInstance> {
    const res = await api.post<ApiResponse<ProductInstance>>(
      '/product-instances/sell',
      dto
    );
    return ProductInstanceSchema.parse(res.data.data);
  }

  /**
   * Вернуть экземпляр товара
   */
  static async returnInstance(dto: ReturnInstanceDto): Promise<ProductInstance> {
    const res = await api.post<ApiResponse<ProductInstance>>(
      '/product-instances/return',
      dto
    );
    return ProductInstanceSchema.parse(res.data.data);
  }

  /**
   * Передать экземпляр между организациями
   */
  static async transfer(dto: TransferInstanceDto): Promise<ProductInstance> {
    const res = await api.post<ApiResponse<ProductInstance>>(
      '/product-instances/transfer',
      dto
    );
    return ProductInstanceSchema.parse(res.data.data);
  }

  /**
   * Перепродать экземпляр (после возврата / ремонта)
   */
  static async resell(dto: ResellInstanceDto): Promise<ProductInstance> {
    const res = await api.post<ApiResponse<ProductInstance>>(
      '/product-instances/resell',
      dto
    );
    return ProductInstanceSchema.parse(res.data.data);
  }

  /**
   * Списать / отметить как утерянный
   */
  static async markLost(dto: MarkLostDto): Promise<ProductInstance> {
    const res = await api.post<ApiResponse<ProductInstance>>(
      '/product-instances/mark-lost',
      dto
    );
    return ProductInstanceSchema.parse(res.data.data);
  }
}