import api from '@/lib/axiosInstance';
import {
  CreateAttributeDto,
  UpdateAttributeDto,
  GetAttributesQueryDto,
  Attribute,
  AttributesListResponseSchema,
  AttributeSchema,
} from '@/schemas/attributes.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class AttributesService {
  /**
   * Получить список всех характеристик (с пагинацией, поиском, сортировкой)
   */
  static async getAllAdmin(
    query: GetAttributesQueryDto = {}
  ): Promise<{ items: Attribute[]; total: number }> {
    const res = await api.get<
      ApiResponse<{ items: any[]; total: number }>
    >('/attributes/admin/all', {
      params: query,
    });

    return AttributesListResponseSchema.parse(res.data.data);
  }

  /**
   * Получить одну характеристику по ID (включая все значения)
   */
  static async getByIdAdmin(id: string): Promise<Attribute> {
    const res = await api.get<ApiResponse<Attribute>>(
      `/attributes/admin/${id}`
    );
    // @ts-ignore
    return AttributeSchema.parse(res.data.data?.data || res.data.data);
  }

  /**
   * Создать новую характеристику
   */
  static async create(dto: CreateAttributeDto): Promise<Attribute> {
    const res = await api.post<ApiResponse<Attribute>>(
      '/attributes/create',
      dto
    );
    return res.data.data;
  }

  /**
   * Обновить существующую характеристику
   */
  static async update(id: string, dto: UpdateAttributeDto): Promise<Attribute> {
    const res = await api.patch<ApiResponse<Attribute>>(
      `/attributes/update/${id}`,
      dto
    );
    return res.data.data;
  }

  /**
   * Жёсткое удаление характеристики (только если нет связанных значений)
   */
  static async hardDelete(id: string): Promise<void> {
    await api.delete(`/attributes/remove/${id}/hard`);
  }
}