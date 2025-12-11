import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  Organization,
  OrganizationWithUserRole
} from "@/schemas/organization.schema";
import api from "@/lib/axiosInstance";

export class OrganizationService {
  async create(dto: CreateOrganizationDto): Promise<Organization> {
    const res = await api.post("/organization/create", dto);
    return res.data.data;
  }

  async getAll(): Promise<Organization[]> {
    const res = await api.get("/organization/admin/all");
    return res.data.data;
  }

  async getById(id: string): Promise<Organization> {
    const res = await api.get(`/organization/admin/${id}`);
    return res.data.data;
  }

  async getAllForUser(): Promise<OrganizationWithUserRole[]> {
    const res = await api.get("/organization/all");
    return res.data.data;
  }

  async getOneForUser(id: string): Promise<OrganizationWithUserRole> {
    const res = await api.get(`/organization/${id}`);
    return res.data.data;
  }

  async update(id: string, dto: UpdateOrganizationDto): Promise<Organization> {
    const res = await api.patch(`/organization/update/${id}`, dto);
    return res.data.data;
  }

  async hardDelete(id: string): Promise<void> {
    await api.delete(`/organization/remove/${id}/hard`);
  }

  hasRole(org: OrganizationWithUserRole, roles: string[]): boolean {
    if (!org.org_users || org.org_users.length === 0) return false;
    return org.org_users.some(user => roles.includes(user.role));
  }

  getUserRole(org: OrganizationWithUserRole): string | undefined {
    return org.org_users?.[0]?.role;
  }

  getUserPosition(org: OrganizationWithUserRole): string | undefined | null {
    return org.org_users?.[0]?.position;
  }
}