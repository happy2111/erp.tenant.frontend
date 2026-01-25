import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  GetOrganizationsQueryDto,
  Organization,
  OrganizationWithUserRole,
} from "@/schemas/organization.schema";
import api from "@/lib/axiosInstance";

interface ApiResponse<T> {
  data: T;
}

export class OrganizationService {
  static async create(dto: CreateOrganizationDto): Promise<Organization> {
    const res = await api.post<ApiResponse<Organization>>("/organization/create", dto);
    return res.data.data;
  }

  static async getAll(): Promise<OrganizationWithUserRole[]> {
    const res = await api.get<ApiResponse<OrganizationWithUserRole[]>>("/organization/all");
    return res.data.data;
  }

  /**
   * Получить одну организацию по ID (только если есть доступ)
   */
  static async getById(id: string): Promise<OrganizationWithUserRole> {
    const res = await api.get<ApiResponse<OrganizationWithUserRole>>(`/organization/${id}`);
    return res.data.data;
  }

  // ──────────────────────────────────────────────────────────────
  // Методы для администраторов (ADMIN / OWNER)
  // ──────────────────────────────────────────────────────────────

  /**
   * Получить ВСЕ организации (только для ADMIN/OWNER)
   */
  static async getAllAdmin(
    query: GetOrganizationsQueryDto = {}
  ): Promise<Organization[]> {
    const res = await api.get<ApiResponse<Organization[]>>("/organization/admin/all", {
      params: query,
    });
    return res.data.data;
  }

  /**
   * Получить организацию по ID (расширенные данные, только для ADMIN/OWNER)
   */
  static async getByIdAdmin(id: string): Promise<Organization> {
    const res = await api.get<ApiResponse<Organization>>(`/organization/admin/${id}`);
    return res.data.data;
  }

  /**
   * Обновить организацию (ADMIN / OWNER)
   */
  static async update(
    id: string,
    dto: UpdateOrganizationDto
  ): Promise<Organization> {
    const res = await api.patch<ApiResponse<Organization>>(
      `/organization/update/${id}`,
      dto
    );
    return res.data.data;
  }

  /**
   * Жёсткое удаление организации (только OWNER)
   */
  static async hardDelete(id: string): Promise<void> {
    await api.delete(`/organization/remove/${id}/hard`);
  }
}