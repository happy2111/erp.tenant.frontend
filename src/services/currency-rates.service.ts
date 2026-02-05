import api from '@/lib/axiosInstance';
import {
  CreateCurrencyRateDto,
  UpdateCurrencyRateDto,
  GetCurrencyRateQueryDto,
  CurrencyRate,
  CurrencyRatesListResponseSchema,
  CurrencyRateSchema,
} from '@/schemas/currency-rates.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class CurrencyRatesService {
  /**
   * Создать новый курс валют
   */
  static async create(
    dto: CreateCurrencyRateDto
  ): Promise<CurrencyRate> {
    const res = await api.post<ApiResponse<CurrencyRate>>(
      '/currency-rates/create',
      dto
    );
    return CurrencyRateSchema.parse(res.data.data);
  }

  /**
   * Получить список всех курсов валют (с пагинацией и фильтрами)
   */
  static async getAllAdmin(
    query: GetCurrencyRateQueryDto = {}
  ): Promise<{
    items: CurrencyRate[];
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
    >('/currency-rates/all', {
      params: query,
    });

    return CurrencyRatesListResponseSchema.parse(res.data.data);
  }

  /**
   * Получить один курс валют по ID
   */
  static async findOne(id: string): Promise<CurrencyRate> {
    const res = await api.get<ApiResponse<CurrencyRate>>(
      `/currency-rates/${id}`
    );
    return CurrencyRateSchema.parse(res.data.data);
  }

  /**
   * Обновить существующий курс валют
   */
  static async update(
    id: string,
    dto: UpdateCurrencyRateDto
  ): Promise<CurrencyRate> {
    const res = await api.patch<ApiResponse<CurrencyRate>>(
      `/currency-rates/update/${id}`,
      dto
    );
    return CurrencyRateSchema.parse(res.data.data);
  }

  /**
   * Удалить курс валют
   */
  static async remove(id: string): Promise<{ message: string }> {
    const res = await api.delete<ApiResponse<{ message: string }>>(
      `/currency-rates/remove/${id}`
    );
    return res.data.data;
  }
}