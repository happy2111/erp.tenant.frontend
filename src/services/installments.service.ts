import api from '@/lib/axiosInstance';
import {
  CreateInstallmentDto,
  CreateInstallmentPaymentDto,
  CancelInstallmentDto,
  GetInstallmentsQueryDto,
  Installment,
  InstallmentsListResponseSchema,
  InstallmentSchema, InstallmentPayment,
} from '@/schemas/installments.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class InstallmentsService {
  /**
   * Создать новую рассрочку по продаже
   */
  static async create(dto: CreateInstallmentDto): Promise<Installment> {
    const res = await api.post<ApiResponse<Installment>>(
      '/installments/create',
      dto
    );
    return InstallmentSchema.parse(res.data.data);
  }

  /**
   * Добавить платёж по существующей рассрочке
   */
  static async addPayment(dto: CreateInstallmentPaymentDto): Promise<InstallmentPayment> {
    const res = await api.post<ApiResponse<any>>(
      '/installments/payment',
      dto
    );
    return res.data.data;
  }

  /**
   * Получить список всех рассрочек с фильтрами и пагинацией
   */
  static async getAllAdmin(
    query: GetInstallmentsQueryDto = {}
  ): Promise<{
    items: Installment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const res = await api.get<ApiResponse<any>>(
      '/installments/admin/all',
      { params: query }
    );

    return InstallmentsListResponseSchema.parse(res.data.data);
  }

  /**
   * Получить одну рассрочку по ID (со всеми платежами)
   */
  static async getById(id: string): Promise<Installment> {
    const res = await api.get<ApiResponse<Installment>>(
      `/installments/${id}`
    );
    return InstallmentSchema.parse(res.data.data);
  }

  /**
   * Отменить рассрочку
   */
  static async cancel(
    id: string,
    dto: CancelInstallmentDto = {}
  ): Promise<Installment> {
    const res = await api.post<ApiResponse<Installment>>(
      `/installments/${id}/cancel`,
      dto
    );
    return InstallmentSchema.parse(res.data.data);
  }
}