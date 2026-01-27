// src/services/OrganizationUserService.ts
import {
  CreateOrganizationUserDto,
  CreateOrgUserWithUserDto,
  UpdateOrganizationUserDto,
  GetOrgUsersQueryDto,
  OrganizationUser,
} from "@/schemas/organization-user.schema";
import api from "@/lib/axiosInstance";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class OrganizationUserService {
  // ─── Получить всех пользователей организации (для админки) ───────
  static async getAllAdmin(
    query: GetOrgUsersQueryDto = {},
  ): Promise<{ items: OrganizationUser[]; total: number }> {
    const res = await api.get<ApiResponse<{ items: OrganizationUser[]; total: number }>>(
      "/organization-user/admin/all",
      { params: query },
    );
    return res.data.data;
  }

  // ─── Получить одного пользователя по ID ──────────────────────────
  static async getByIdAdmin(id: string): Promise<OrganizationUser> {
    const res = await api.get<ApiResponse<OrganizationUser>>(
      `/organization-user/admin/${id}`,
    );
    return res.data.data;
  }

  // ─── Создать привязку существующего пользователя ─────────────────
  static async create(
    dto: CreateOrganizationUserDto,
  ): Promise<OrganizationUser> {
    const res = await api.post<ApiResponse<OrganizationUser>>(
      "/organization-user/create",
      dto,
    );
    return res.data.data;
  }

  // ─── Создать нового пользователя + привязать к организации ───────
  static async createWithNewUser(
    dto: CreateOrgUserWithUserDto,
  ): Promise<OrganizationUser> {
    const res = await api.post<ApiResponse<OrganizationUser>>(
      "/organization-user/create-with-user",
      dto,
    );
    return res.data.data;
  }

  // ─── Обновить роль / должность ───────────────────────────────────
  static async update(
    id: string,
    dto: UpdateOrganizationUserDto,
  ): Promise<OrganizationUser> {
    const res = await api.patch<ApiResponse<OrganizationUser>>(
      `/organization-user/update/${id}`,
      dto,
    );
    return res.data.data;
  }

  // ─── Жёсткое удаление ────────────────────────────────────────────
  static async hardDelete(id: string): Promise<void> {
    await api.delete(`/organization-user/remove/${id}/hard`);
  }
}