import { TenantLoginDto} from "@/schemas/auth.schema";
import api from "@/lib/axiosInstance";

export class TenantAuthService {
  async login(dto: TenantLoginDto) {
    const res = await api.post("/tenant-auth/login", dto);
    return res.data.data;
  }

  async refresh() {
    const res = await api.post("/tenant-auth/refresh"); // cookie отправляется автоматически
    return res.data.data;
  }

  async logout() {
    const res = await api.post("/tenant-auth/logout");
    return res.data.data;
  }
}