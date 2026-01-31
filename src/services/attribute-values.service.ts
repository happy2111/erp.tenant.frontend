// src/services/attribute-values.service.ts
import api from '@/lib/axiosInstance';
import {
  CreateAttributeValueDto,
  UpdateAttributeValueDto,
  GetAttributeValuesQueryDto,
  AttributeValue,
  AttributeValuesListResponseSchema,
  AttributeValueSchema,
} from '@/schemas/attribute-values.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class AttributeValuesService {
  /**
   * Получить список всех значений характеристик
   * (с возможностью фильтрации по атрибуту и поиска)
   */
  static async getAllAdmin(
    query: GetAttributeValuesQueryDto = {}
  ): Promise<{ items: AttributeValue[]; total: number }> {
    const res = await api.get<
      ApiResponse<{ items: any[]; total: number }>
    >('/attribute-values/admin/all', {
      params: query,
    });

    return AttributeValuesListResponseSchema.parse(res.data.data);
  }

  /**
   * Получить одно значение характеристики по ID
   */
  static async getByIdAdmin(id: string): Promise<AttributeValue> {
    const res = await api.get<ApiResponse<AttributeValue>>(
      `/attribute-values/admin/${id}`
    );
    return AttributeValueSchema.parse(res.data.data);
  }

  /**
   * Создать новое значение характеристики
   */
  static async create(dto: CreateAttributeValueDto): Promise<AttributeValue> {
    const res = await api.post<ApiResponse<AttributeValue>>(
      '/attribute-values/create',
      dto
    );
    return res.data.data;
  }

  /**
   * Обновить существующее значение характеристики
   */
  static async update(
    id: string,
    dto: UpdateAttributeValueDto
  ): Promise<AttributeValue> {
    const res = await api.patch<ApiResponse<AttributeValue>>(
      `/attribute-values/update/${id}`,
      dto
    );
    return res.data.data;
  }

  /**
   * Жёсткое удаление значения характеристики
   * (только если оно не используется в вариантах товаров)
   */
  static async hardDelete(id: string): Promise<void> {
    await api.delete(`/attribute-values/remove/${id}/hard`);
  }
}