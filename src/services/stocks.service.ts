import api from '@/lib/axiosInstance';
import {
  AdjustStockDto,
  StockFilterDto,
  Stock,
  StocksListResponseSchema,
  StockByVariantResponseSchema,
} from '@/schemas/stocks.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class StocksService {
  /**
   * Получить список всех остатков (админ-панель, с пагинацией и фильтрами)
   */
  static async getAllAdmin(
    filter: StockFilterDto | object = {}
  ): Promise<{
    data: Stock[];
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
    >('/stocks/admin/all', {
      params: filter,
    });

    return StocksListResponseSchema.parse(res.data.data);
  }

  /**
   * Получить текущий остаток по конкретному варианту товара
   */
  static async getStockByVariant(
    variantId: string
  ): Promise<{
    quantity: number;
    product_variant: any;
    updatedAt: string | null;
  }> {
    const res = await api.get<ApiResponse<any>>(
      `/stocks/variant/${variantId}`
    );
    return res.data.data
  }

  /**
   * Корректировать остаток (приход / расход / ручная правка)
   */
  static async adjustStock(
    dto: AdjustStockDto
  ): Promise<{
    id: string;
    productVariantId: string;
    quantity: number;
    updatedAt: string;
  }> {
    const res = await api.post<ApiResponse<any>>(
      '/stocks/adjust',
      dto
    );
    return res.data.data;
  }
}