import {
  CreateTenantUserDto,
  UpdateTenantUserDto,
  GetTenantUsersQueryDto,
  TenantUser, CheckUserExistenceResponseSchema, CheckUserExistenceResponse,
} from "@/schemas/tenant-user.schema";
import api from "@/lib/axiosInstance";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class TenantUserService {
  static async getAllAdmin(
    query: GetTenantUsersQueryDto = {},
  ): Promise<{ items: TenantUser[]; total: number }> {
    const res = await api.get<ApiResponse<{ items: TenantUser[]; total: number }>>(
      "/tenant-user/admin/all",
      { params: query },
    );
    return res.data.data;
  }

  static async getByIdAdmin(id: string): Promise<TenantUser> {
    const res = await api.get<ApiResponse<TenantUser>>(`/tenant-user/admin/${id}`);
    return res.data.data;
  }

  static async create(dto: CreateTenantUserDto): Promise<TenantUser> {
    const res = await api.post<ApiResponse<TenantUser>>("/tenant-user/create", dto);
    return res.data.data;
  }

  static async update(id: string, dto: UpdateTenantUserDto): Promise<TenantUser> {
    const res = await api.patch<ApiResponse<TenantUser>>(
      `/tenant-user/update/${id}`,
      dto,
    );
    return res.data.data;
  }

  static async hardDelete(id: string): Promise<void> {
    await api.delete(`/tenant-user/remove/${id}/hard`);
  }

  static async checkExistence(identifier: string): Promise<CheckUserExistenceResponse> {
    const res = await api.get<ApiResponse<CheckUserExistenceResponse>>(
      "/tenant-user/check-existence",
      { params: { identifier } },
    );
    return res.data.data;
  }
}