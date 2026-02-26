import api from '@/lib/axiosInstance';
import {
  CreateProductCategoryDto,
  GetProductCategoriesQueryDto,
  ProductCategory,
  ProductCategoriesListResponseSchema,
  ProductCategorySchema,
  ProductCategoriesByProductSchema,
  ProductsByCategorySchema,
} from '@/schemas/product-categories.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class ProductCategoriesService {

  static async getAllAdmin(
    query: GetProductCategoriesQueryDto = {}
  ): Promise<{ items: ProductCategory[]; total: number }> {
    const res = await api.get<
      ApiResponse<{ items: any[]; total: number }>
    >('/product-categories/admin/all', {
      params: query,
    });

    return ProductCategoriesListResponseSchema.parse(res.data.data);
  }


  static async getByIdAdmin(id: string): Promise<ProductCategory> {
    const res = await api.get<ApiResponse<ProductCategory>>(
      `/product-categories/admin/${id}`
    );
    return ProductCategorySchema.parse(res.data.data);
  }

  static async create(dto: CreateProductCategoryDto): Promise<ProductCategory> {
    const res = await api.post<ApiResponse<ProductCategory>>(
      '/product-categories/create',
      dto
    );
    return res.data.data;
  }


  static async remove(dto: CreateProductCategoryDto): Promise<void> {
    await api.delete('/product-categories/remove', {
      data: dto,
    });
  }


  static async getCategoriesByProduct(
    productId: string
  ): Promise<Array<{ id: string; category: { id: string; name: string } }>> {
    const res = await api.get<ApiResponse<any>>(
      `/product-categories/product/${productId}`
    );
    return ProductCategoriesByProductSchema.parse(res.data.data);
  }


  static async getProductsByCategory(
    categoryId: string
  ): Promise<Array<{ id: string; product: { id: string; name: string } }>> {
    const res = await api.get<ApiResponse<any>>(
      `/product-categories/category/${categoryId}`
    );
    return ProductsByCategorySchema.parse(res.data.data);
  }
}