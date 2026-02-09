import api from '@/lib/axiosInstance';
import {
  CreatePurchaseDto,
  UpdatePurchaseDto,
  PayPurchaseDto,
  GetPurchaseQueryDto,
  Purchase,
  PurchasesListResponseSchema,
  PurchaseSchema,
} from '@/schemas/purchases.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class PurchasesService {
  /**
   * Создать новую закупку (с возможной частичной/полной оплатой)
   */
  static async create(dto: CreatePurchaseDto): Promise<Purchase> {
    const res = await api.post<ApiResponse<Purchase>>(
      '/purchases/create',
      dto
    );
    return PurchaseSchema.parse(res.data.data);
  }

  /**
   * Получить список всех закупок (с фильтрами и пагинацией)
   */
  static async getAllAdmin(
    query: GetPurchaseQueryDto = {}
  ): Promise<{
    items: Purchase[];
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
    >('/purchases/all', {
      params: query,
    });

    return PurchasesListResponseSchema.parse(res.data.data);
  }

  /**
   * Получить одну закупку по ID (со всеми позициями и платежами)
   */
  static async findOne(id: string): Promise<Purchase> {
    const res = await api.get<ApiResponse<Purchase>>(`/purchases/${id}`);
    return PurchaseSchema.parse(res.data.data);
  }

  /**
   * Обновить закупку (поставщик, статус, заметки и т.д.)
   */
  static async update(
    id: string,
    dto: UpdatePurchaseDto
  ): Promise<Purchase> {
    const res = await api.patch<ApiResponse<Purchase>>(
      `/purchases/update/${id}`,
      dto
    );
    return PurchaseSchema.parse(res.data.data);
  }

  /**
   * Удалить закупку (только если нет платежей)
   */
  static async remove(id: string): Promise<void> {
    await api.delete(`/purchases/remove/${id}`);
  }

  /**
   * Подтвердить закупку (перевод в PAID + списание с кассы)
   */
  static async confirmPurchase(
    purchaseId: string,
    kassaId?: string
  ): Promise<{ message: string }> {
    const res = await api.post<ApiResponse<{ message: string }>>(
      `/purchases/${purchaseId}/confirm`,
      { kassaId }
    );
    return res.data.data;
  }

  /**
   * Оплатить часть или всю закупку
   */
  static async pay(
    purchaseId: string,
    dto: PayPurchaseDto
  ): Promise<Purchase> {
    const res = await api.post<ApiResponse<Purchase>>(
      `/purchases/${purchaseId}/pay`,
      dto
    );
    return PurchaseSchema.parse(res.data.data);
  }
}