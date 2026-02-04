import api from '@/lib/axiosInstance';
import {
  CreateKassaDto,
  UpdateKassaDto,
  GetKassaQueryDto,
  Kassa,
  KassasListResponseSchema,
  KassaSchema,
} from '@/schemas/kassas.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class KassasService {
  /**
   * Создать новую кассу
   */
  static async create(dto: CreateKassaDto): Promise<Kassa> {
    const res = await api.post<ApiResponse<Kassa>>(
      '/kassas/create',
      dto
    );
    return KassaSchema.parse(res.data.data);
  }

  /**
   * Получить список всех касс организации (с пагинацией и поиском)
   */
  static async getAllAdmin(
    query: GetKassaQueryDto = {}
  ): Promise<{
    items: Kassa[];
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
    >('/kassas/admin/all', {
      params: query,
    });

    return KassasListResponseSchema.parse(res.data.data);
  }

  /**
   * Получить одну кассу по ID
   */
  static async findOne(id: string): Promise<Kassa> {
    const res = await api.get<ApiResponse<Kassa>>(`/kassas/${id}`);
    return KassaSchema.parse(res.data.data);
  }

  /**
   * Обновить кассу
   */
  static async update(
    id: string,
    dto: UpdateKassaDto
  ): Promise<Kassa> {
    const res = await api.patch<ApiResponse<Kassa>>(
      `/kassas/update/${id}`,
      dto
    );
    return KassaSchema.parse(res.data.data);
  }

  /**
   * Удалить кассу (hard delete)
   */
  static async remove(id: string): Promise<void> {
    await api.delete(`/kassas/remove/${id}`);
  }

  /**
   * Получить историю операций по кассе
   * (платежи + переводы между кассами)
   */
  static async getKassaHistory(
    kassaId: string,
    params: {
      page?: number;
      limit?: number;
      type?: 'INCOME' | 'EXPENSE' | 'TRANSFER';
      fromDate?: string;
      toDate?: string;
    } = {}
  ): Promise<any> {
    const res = await api.get<ApiResponse<any>>(
      `/kassas/${kassaId}/history`,
      { params }
    );

    // Здесь можно дополнительно типизировать ответ, если нужно
    return res.data.data;
  }
}