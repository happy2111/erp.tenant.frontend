import {
  CreateOrganizationUserDto,
  CreateOrganizationUserWithTenantDto,
  UpdateOrganizationUserDto,
  OrgUserFilterDto,
  OrgUserRole,
} from "@/schemas/organization.user.schema";
import api from "@/lib/axiosInstance";

// Типизация ответа OrganizationUser
export type OrganizationUser = {
  id: string;
  organizationId: string;
  userId: string;
  role: OrgUserRole;
  position?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    phone_numbers?: Array<{ phone: string; isPrimary: boolean }>;
  };
};

export class OrganizationUserService {
  // Создать запись OrganizationUser
  async create(dto: CreateOrganizationUserDto): Promise<OrganizationUser> {
    const res = await api.post("/organization-user/create", dto);
    return res.data.data;
  }

  // Создать пользователя в организации с новым tenant-пользователем
  async createWithTenantUser(
    orgId: string,
    dto: CreateOrganizationUserWithTenantDto
  ): Promise<OrganizationUser> {
    const res = await api.post(`/organization-user/${orgId}/users`, dto);
    return res.data.data;
  }

  // Обновить роль или позицию OrganizationUser
  async update(
    id: string,
    dto: UpdateOrganizationUserDto
  ): Promise<OrganizationUser> {
    const res = await api.patch(`/organization-user/update/${id}`, dto);
    return res.data.data;
  }

  // Удалить OrganizationUser
  async delete(id: string): Promise<void> {
    await api.delete(`/organization-user/remove/${id}`);
  }

  // Фильтрация OrganizationUsers (с пагинацией, сортировкой, поиском)
  async filter(query: Partial<OrgUserFilterDto>): Promise<{
    data: OrganizationUser[];
    total: number;
    page: number;
    limit: number;
  }> {
    const res = await api.post("/organization-user/filter", query);
    return res.data.data;
  }

  // Вспомогательные методы
  hasRole(orgUser: OrganizationUser, roles: string[]): boolean {
    return roles.includes(orgUser.role);
  }

  getRole(orgUser: OrganizationUser): string | undefined {
    return orgUser.role;
  }

  getPosition(orgUser: OrganizationUser): string | undefined | null {
    return orgUser.position ?? null;
  }
}
