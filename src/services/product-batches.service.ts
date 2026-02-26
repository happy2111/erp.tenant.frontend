import api from '@/lib/axiosInstance';
import {
  CreateProductBatchDto,
  UpdateProductBatchDto,
  FilterProductBatchDto,
  ProductBatch,
  ProductBatchesListResponseSchema,
  ProductBatchSchema,
  BatchesByVariantResponseSchema,
  BatchStatsSchema,
} from '@/schemas/product-batches.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class ProductBatchesService {

  static async getAllAdmin(
    filter: FilterProductBatchDto = {}
  ): Promise<{
    data: ProductBatch[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const res = await api.get<
      ApiResponse<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>
    >('/product-batches/admin/all', {
      params: filter,
    });

    return ProductBatchesListResponseSchema.parse(res.data.data);
  }

  static async getByIdAdmin(id: string): Promise<ProductBatch> {
    const res = await api.get<ApiResponse<ProductBatch>>(
      `/product-batches/admin/${id}`
    );
    return ProductBatchSchema.parse(res.data.data);
  }

  static async create(
    dto: CreateProductBatchDto
  ): Promise<ProductBatch> {
    const res = await api.post<ApiResponse<ProductBatch>>(
      '/product-batches/create',
      dto
    );
    return res.data.data;
  }


  static async update(
    id: string,
    dto: UpdateProductBatchDto
  ): Promise<ProductBatch> {
    const res = await api.patch<ApiResponse<ProductBatch>>(
      `/product-batches/update/${id}`,
      dto
    );
    return res.data.data;
  }


  static async hardDelete(id: string): Promise<void> {
    await api.delete(`/product-batches/remove/${id}/hard`);
  }


  static async getBatchesByVariant(
    variantId: string
  ): Promise<ProductBatch[]> {
    const res = await api.get<ApiResponse<any[]>>(
      `/product-batches/variant/${variantId}`
    );
    return BatchesByVariantResponseSchema.parse(res.data.data);
  }


  static async getStats(variantId: string): Promise<{
    totalBatches: number;
    activeBatches: number;
    totalQuantity: number;
    nearestExpiry: string | null | undefined;
    createdAtEarliest: string | null | undefined;
  }> {
    const res = await api.get<ApiResponse<any>>(
      `/product-batches/stats/${variantId}`
    );
    return res.data.data
  }
}