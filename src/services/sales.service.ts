import api from '@/lib/axiosInstance';
import {
  CreateSaleDto,
  UpdateSaleDto,
  GetSaleQueryDto,
  Sale,
  SalesListResponseSchema,
  SaleSchema,
} from '@/schemas/sales.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class SalesService {
  /**
   * Создать новую продажу (с возможной рассрочкой)
   */
  static async create(dto: CreateSaleDto): Promise<Sale> {
    const res = await api.post<ApiResponse<Sale>>(
      '/sales/create',
      dto
    );
    if(res.data.success) return res.data.data;

    return SaleSchema.parse(res.data.data);
  }

  /**
   * Получить список всех продаж (с фильтрами и пагинацией)
   */
  static async getAllAdmin(
    query: GetSaleQueryDto = {}
  ): Promise<{
    items: Sale[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const res = await api.get<
      ApiResponse<{
        items: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>
    >('/sales/admin/all', {
      params: query,
    });

    return SalesListResponseSchema.parse(res.data.data);
  }

  /**
   * Получить одну продажу по ID (со всеми позициями, платежами, рассрочкой)
   */
  static async findOne(id: string): Promise<Sale> {
    const res = await api.get<ApiResponse<Sale>>(`/sales/${id}`);
    return SaleSchema.parse(res.data.data);
  }

  /**
   * Обновить продажу (клиент, статус, заметки и т.д.)
   */
  static async update(
    id: string,
    dto: UpdateSaleDto
  ): Promise<Sale> {
    const res = await api.patch<ApiResponse<Sale>>(
      `/sales/update/${id}`,
      dto
    );
    return SaleSchema.parse(res.data.data);
  }

  /**
   * Удалить продажу (только если нет платежей)
   */
  static async remove(id: string): Promise<void> {
    await api.delete(`/sales/remove/${id}`);
  }

  /**
   * Подтвердить продажу (перевод в PAID + зачисление в кассу)
   */
  static async confirmSale(
    saleId: string,
    kassaId: string
  ): Promise<{ message: string; sale: Sale }> {
    const res = await api.post<ApiResponse<{ message: string; sale: any }>>(
      `/sales/${saleId}/confirm`,
      { kassaId }
    );
    return res.data.data;
  }
}