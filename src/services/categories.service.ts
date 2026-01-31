import api from '@/lib/axiosInstance';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  GetCategoriesQueryDto,
  Category,
  CategoriesListResponseSchema,
  CategorySchema,
} from '@/schemas/categories.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class CategoriesService {
  /**
   * Получить список всех категорий (с пагинацией, поиском, сортировкой)
   */
  static async getAllAdmin(
    query: GetCategoriesQueryDto = {}
  ): Promise<{ items: Category[]; total: number }> {
    const res = await api.get<
      ApiResponse<{ items: any[]; total: number }>
    >('/categories/admin/all', {
      params: query,
    });

    return CategoriesListResponseSchema.parse(res.data.data);
  }

  /**
   * Получить одну категорию по ID (обычно с включёнными товарами)
   */
  static async getByIdAdmin(id: string): Promise<Category> {
    const res = await api.get<ApiResponse<Category>>(
      `/categories/admin/${id}`
    );
    return CategorySchema.parse(res.data.data);
  }

  /**
   * Создать новую категорию
   */
  static async create(dto: CreateCategoryDto): Promise<Category> {
    const res = await api.post<ApiResponse<Category>>(
      '/categories/create',
      dto
    );
    return res.data.data;
  }

  /**
   * Обновить существующую категорию
   */
  static async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const res = await api.patch<ApiResponse<Category>>(
      `/categories/update/${id}`,
      dto
    );
    return res.data.data;
  }

  /**
   * Жёсткое удаление категории
   * (только если нет связанных товаров)
   */
  static async hardDelete(id: string): Promise<void> {
    await api.delete(`/categories/remove/${id}/hard`);
  }
}