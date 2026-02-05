// src/services/kassa-transfers.service.ts
import api from '@/lib/axiosInstance';
import {
  CreateKassaTransferDto,
  GetKassaTransferQueryDto,
  KassaTransfer,
  KassaTransfersListResponseSchema,
  KassaTransferSchema,
} from '@/schemas/kassa-transfers.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class KassaTransfersService {
  /**
   * Создать перевод между кассами
   */
  static async create(
    dto: CreateKassaTransferDto
  ): Promise<KassaTransfer> {
    const res = await api.post<ApiResponse<KassaTransfer>>(
      '/kassa-transfers/create',
      dto
    );
    return KassaTransferSchema.parse(res.data.data);
  }

  /**
   * Получить список всех переводов между кассами организации
   * (с пагинацией, поиском и фильтрами)
   */
  static async getAllAdmin(
    query: GetKassaTransferQueryDto = {}
  ): Promise<{
    items: KassaTransfer[];
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
    >('/kassa-transfers/all', {
      params: query,
    });

    return KassaTransfersListResponseSchema.parse(res.data.data);
  }

  /**
   * Получить детальную информацию по одному переводу
   */
  static async findOne(id: string): Promise<KassaTransfer> {
    const res = await api.get<ApiResponse<KassaTransfer>>(
      `/kassa-transfers/${id}`
    );
    return KassaTransferSchema.parse(res.data.data);
  }
}