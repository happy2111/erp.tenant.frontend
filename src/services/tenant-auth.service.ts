import api from "@/lib/axiosInstance";
import {components} from "@/shared/api/api-types";

export class TenantAuthService {
  static async login(dto: components["schemas"]["TenantLoginDto"]) {
    const res = await api.post("/tenant-auth/login", dto);
    return res.data.data;
  }

  static async refresh() {
    const res = await api.post("/tenant-auth/refresh"); // cookie отправляется автоматически
    return res.data.data;
  }

  static async logout() {
    const res = await api.post("/tenant-auth/logout");
    return res.data.data;
  }

  static async switchOrganization(orgUserId: string) {
    const res = await api.post("/tenant-auth/switch-organization", { orgUserId });
    return res.data.data;
  }

  static async me() {
    const res = await api.post("/tenant-auth/me"); // accessToken из cookie
    return res.data.data;
  }
}