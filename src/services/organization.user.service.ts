// src/services/organization.user.service.ts
import {
  CreateOrganizationUserDto,
  CreateOrgUserWithUserDto, // Use the new, correct DTO type
  UpdateOrganizationUserDto,
  OrgUserFilterDto,
  OrgUserRole,
  // ... other types
} from "@/schemas/organization.user.schema";
import api from "@/lib/axiosInstance"; // Assuming this is your configured axios instance

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
      // ... potentially other profile fields
    };
    phone_numbers?: Array<{ phone: string; isPrimary: boolean }>;
  };
};

export class OrganizationUserService {
  private readonly baseUrl = "/organization-user";

  // 1. Создать запись OrganizationUser (with existing user)
  async create(dto: CreateOrganizationUserDto): Promise<OrganizationUser> {
    const res = await api.post(`${this.baseUrl}/create`, dto);
    return res.data.data;
  }

  /**
   * 🔑 2. Создать пользователя в организации с новым Tenant-пользователем (THE REQUESTED METHOD)
   * This corresponds to the backend controller @Post('create-with-user')
   * The DTO must include the organizationId, user details, role, and position.
   *
   * Note: I'm replacing your original createWithTenantUser which used a URL parameter
   * with this new method that sends organizationId in the body, matching your controller.
   */
  async createWithUser(
    dto: CreateOrgUserWithUserDto // This DTO includes organizationId and the full 'user' object
  ): Promise<OrganizationUser> {
    // Endpoint: /organization-user/create-with-user
    const res = await api.post(`${this.baseUrl}/create-with-user`, dto);
    // Assuming the backend response structure is { data: OrganizationUser }
    return res.data.data;
  }

  // 3. Обновить роль или позицию OrganizationUser
  async update(
    id: string,
    dto: UpdateOrganizationUserDto
  ): Promise<OrganizationUser> {
    const res = await api.patch(`${this.baseUrl}/update/${id}`, dto);
    return res.data.data;
  }

  // 4. Удалить OrganizationUser
  async delete(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/remove/${id}`);
  }

  // 5. Фильтрация OrganizationUsers (с пагинацией, сортировкой, поиском)
  async filter(query: Partial<OrgUserFilterDto>): Promise<{
    data: OrganizationUser[];
    total: number;
    page: number;
    limit: number;
  }> {
    const res = await api.post(`${this.baseUrl}/filter`, query);
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