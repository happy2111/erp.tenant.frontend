import {
  CreateProductCategoryDto,
  DeleteProductCategoryDto,
  ProductCategory,
  ProductWithCategories,
  CategoryWithProducts
} from "@/schemas/product-category.schema";
import api from "@/lib/axiosInstance";

export class ProductCategoryService {
  async create(dto: CreateProductCategoryDto): Promise<ProductCategory> {
    const res = await api.post("/product-categories", dto);
    return res.data.data;
  }

  async findAllByProduct(productId: string): Promise<ProductWithCategories[]> {
    const res = await api.get(`/product-categories/product/${productId}`);
    return res.data.data;
  }

  async findAllByCategory(categoryId: string): Promise<CategoryWithProducts[]> {
    const res = await api.get(`/product-categories/category/${categoryId}`);
    return res.data.data;
  }

  async delete(dto: DeleteProductCategoryDto): Promise<void> {
    const res = await api.delete("/product-categories", { data: dto });
    return res.data.data;
  }
}

// Экспорт синглтона
export const productCategoryService = new ProductCategoryService();