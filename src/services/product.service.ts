import {
  CreateProductDto,
  UpdateProductDto,
  ProductFilterDto,
  Product,
  PaginatedProducts,
  ProductWithDetails,
} from "@/schemas/product.schema";
import api from "@/lib/axiosInstance";

export class ProductService {
  async create(dto: CreateProductDto): Promise<Product> {
    const res = await api.post("/products/create", dto);
    return res.data.data;
  }

  async findAll(filter: ProductFilterDto): Promise<PaginatedProducts> {
    const res = await api.post("/products/filter", filter);
    return res.data.data;
  }

  async findOne(id: string): Promise<ProductWithDetails> {
    const res = await api.get(`/products/${id}`);
    return res.data.data;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const res = await api.patch(`/products/update/${id}`, dto);
    return res.data.data;
  }

  async remove(id: string): Promise<void> {
    const res = await api.delete(`/products/remove/${id}`);
    return res.data.data;
  }

  // Дополнительные методы для работы с товарами

  async searchByName(name: string): Promise<Product[]> {
    const res = await this.findAll({ search: name, limit: 50 });
    return res.data;
  }

  async getProductsByBrand(brandId: string): Promise<Product[]> {
    const res = await this.findAll({ search: "", limit: 100 });
    return res.data.filter(product => product.brandId === brandId);
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    // Для этого нужно будет либо фильтровать на фронте,
    // либо добавить отдельный endpoint на бэкенде
    const res = await this.findAll({ search: "", limit: 100 });
    return res.data.filter(product =>
      product.categories?.some(cat => cat.id === categoryId)
    );
  }
}

// Экспорт синглтона
export const productService = new ProductService();