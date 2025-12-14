import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryFilterDto,
  Category,
  PaginatedCategories,
  DeleteCategoryResponse
} from "@/schemas/category.schema";
import api from "@/lib/axiosInstance";

export class CategoryService {
  async create(dto: CreateCategoryDto): Promise<Category> {
    const res = await api.post("/categories/create", dto);
    return res.data.data;
  }

  async findAll(filter: CategoryFilterDto): Promise<PaginatedCategories> {
    const res = await api.post("/categories/filter", filter);
    return res.data.data;
  }

  async findOne(id: string): Promise<Category> {
    const res = await api.get(`/categories/${id}`);
    return res.data.data;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const res = await api.patch(`/categories/update/${id}`, dto);
    return res.data.data;
  }

  async remove(id: string): Promise<DeleteCategoryResponse> {
    const res = await api.delete(`/categories/remove/${id}`);
    return res.data.data;
  }
}

// Экспорт синглтона
export const categoryService = new CategoryService();