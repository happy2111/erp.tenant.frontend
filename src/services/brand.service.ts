  import {
    CreateBrandDto,
    UpdateBrandDto,
    BrandFilterDto,
    Brand,
    PaginatedBrands
  } from "@/schemas/brand.schema";
  import api from "@/lib/axiosInstance";

  export class BrandService {
    async create(dto: CreateBrandDto): Promise<Brand> {
      const res = await api.post("/brands/create", dto);
      return res.data.data;
    }

    async findAll(filter: BrandFilterDto): Promise<PaginatedBrands> {
      const res = await api.post("/brands/filter", filter);
      return res.data.data;
    }

    async findOne(id: string): Promise<Brand> {
      const res = await api.get(`/brands/${id}`);
      return res.data.data;
    }

    async update(id: string, dto: UpdateBrandDto): Promise<Brand> {
      const res = await api.patch(`/brands/update/${id}`, dto);
      return res.data.data;
    }

    async remove(id: string): Promise<void> {
      const res = await api.delete(`/brands/remove/${id}`);
      return res.data.data;
    }
  }