import { create } from "zustand";
import { TenantLoginDto, tenantLoginSchema } from "@/schemas/auth.schema";
import { toast } from "sonner";
import {TenantAuthService} from "@/services/tenant-auth.service";

interface TenantAuthState {
  user: any | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  apiKey: string | null;

  init: () => Promise<void>;

  login: (dto: TenantLoginDto) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;

  saveTokenToStorage: (token: string) => Promise<void>;
  loadTokenFromStorage: () => Promise<string | null>;
  removeTokenFromStorage: () => Promise<void>;

  saveApiKeyToStorage: (key: string) => Promise<void>;
  loadApiKeyFromStorage: () => Promise<string | null>;
  removeApiKeyFromStorage: () => Promise<void>;
}

const service = new TenantAuthService();

export const useTenantAuthStore = create<TenantAuthState>((set, get) => ({
  user: null,
  accessToken: null,
  loading: true,
  error: null,
  apiKey: null,

  init: async () => {
    set({ loading: true });

    const loadedToken = await get().loadTokenFromStorage();
    const loadedApiKey = await get().loadApiKeyFromStorage();

    if (loadedToken && loadedApiKey) {
      set({
        accessToken: loadedToken,
        apiKey: loadedApiKey
      });


      const success = await get().refresh();


      if (!success) {
        await get().removeTokenFromStorage();
        await get().removeApiKeyFromStorage();
        set({ accessToken: null, apiKey: null, user: null });
        toast.error("Ваша сессия устарела. Пожалуйста, войдите снова.");
      }
    }

    set({ loading: false });
  },

  login: async (dto) => {
    try {
      tenantLoginSchema.parse(dto);

      set({ loading: true, error: null });
      const data = await service.login(dto);

      set({
        accessToken: data.accessToken,
        user: data.user,
      });

      await get().saveTokenToStorage(data.accessToken)
      await get().saveApiKeyToStorage(data.apiKey);

      toast.success("Muvafaqiyatli Kirish")

      return true;
    } catch (err: any) {
      const msg = err?.message || "Login failed";
      set({ error: msg });
      toast.error(msg);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      set({
        loading: true,
      });

      await get().removeTokenFromStorage()
      await get().removeApiKeyFromStorage();

      await service.logout();
    } catch (err: any) {
      toast.error(err?.message || "Logout failed");
    } finally {
      set({ user: null, accessToken: null, loading: false });
    }
  },

  refresh: async () => {
    try {
      set({ loading: true });
      const data = await service.refresh();

      set({
        accessToken: data.accessToken,
        user: data.user,
      });

      await get().saveTokenToStorage(data.accessToken)
      await get().saveApiKeyToStorage(data.apiKey);

      return true;
    } catch (err: any) {
      set({ user: null, accessToken: null });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  saveTokenToStorage: async (token: string) => {
    localStorage.setItem("tenant_access_token", token);
  },

  loadTokenFromStorage: async () =>   {
    return localStorage.getItem("tenant_access_token");
  },

  removeTokenFromStorage: async () => {
    localStorage.removeItem("tenant_access_token");
  },

  saveApiKeyToStorage: async (apiKey: string) => {
    localStorage.setItem("api_key", apiKey)
  },

  loadApiKeyFromStorage: async () => {
    return localStorage.getItem("api_key")
  },

  removeApiKeyFromStorage: async () => {
    localStorage.removeItem("api_key");
  }
}));
