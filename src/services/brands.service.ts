import api from '@/lib/axiosInstance';
import {
  CreateBrandDto,
  UpdateBrandDto,
  GetBrandsQueryDto,
  Brand,
  BrandsListResponseSchema,
  BrandSchema,
} from '@/schemas/brands.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class BrandsService {
  static async getAllAdmin(
    query: GetBrandsQueryDto = {}
  ): Promise<{ items: Brand[]; total: number }> {
    const res = await api.get<ApiResponse<{ items: any[]; total: number }>>(
      '/brands/admin/all',
      { params: query }
    );

    return BrandsListResponseSchema.parse(res.data.data);
  }

  static async getByIdAdmin(id: string): Promise<Brand> {
    const res = await api.get<ApiResponse<Brand>>(`/brands/admin/${id}`);
    const brandData = res.data.data.data || res.data.data;

    return BrandSchema.parse(brandData);
  }

  static async create(dto: CreateBrandDto): Promise<Brand> {
    const res = await api.post<ApiResponse<Brand>>('/brands/create', dto);
    return res.data.data;
  }

  static async update(id: string, dto: UpdateBrandDto): Promise<Brand> {
    const res = await api.patch<ApiResponse<Brand>>(
      `/brands/update/${id}`,
      dto
    );
    return res.data.data;
  }

  static async hardDelete(id: string): Promise<void> {
    await api.delete(`/brands/remove/${id}/hard`);
  }
}