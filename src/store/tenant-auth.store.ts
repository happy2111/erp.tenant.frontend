import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TenantAuthService } from '@/services/tenant-auth.service';
import {
  LoginSuccessResponse,
  OrgSelectionRequiredResponse
} from "@/schemas/auth.schema";
import {components} from "@/shared/api/api-types";

export type AuthState = {
  isAuthenticated: boolean;
  user: LoginSuccessResponse['user'] | null;
  currentOrganizationId: string | null;
  apiKey: string | null;
  isLoading: boolean;
  isInitialized: boolean;

  requiresOrgSelection: boolean;
  pendingOrganizations: OrgSelectionRequiredResponse['organizations'] | null;

  login: (
    credentials: components['schemas']['TenantLoginDto']
  ) => Promise<{ success: boolean; requiresOrgSelection: boolean; error?: string }>;

  selectOrganization: (orgUserId: string) => Promise<boolean>;

  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;

  initializeAuth: () => Promise<void>;

  clearAuthState: () => void;
};


export const useTenantAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      currentOrganizationId: null,
      apiKey: null,
      isLoading: false, // Начинаем с false
      isInitialized: false, // Новый флаг для контроля RPS

      requiresOrgSelection: false,
      pendingOrganizations: null,

      login: async (credentials) => {
        try {
          const response = await TenantAuthService.login(credentials);

          // Успешный логин → сразу одна организация
          if ('user' in response) {
            set({
              isAuthenticated: true,
              user: response.user,
              currentOrganizationId: response.organizationId,
              apiKey: response.apiKey,           // сохраняем apiKey
              requiresOrgSelection: false,
              pendingOrganizations: null,
            });
            return { success: true, requiresOrgSelection: false };
          }

          if ('requiresOrgSelection' in response) {
            set({
              isAuthenticated: false,
              user: null,
              currentOrganizationId: null,
              apiKey: response.apiKey,
              requiresOrgSelection: true,
              pendingOrganizations: response.organizations,
            });
            return { success: true, requiresOrgSelection: true };
          }

          return { success: false, error: 'Неизвестный ответ сервера' };
        } catch (err: any) {
          console.error('Login error:', err);
          const message = err.response?.data?.message || 'Ошибка входа';
          return { success: false, requiresOrgSelection: false, error: message };
        }
      },

      selectOrganization: async (orgUserId: string) => {
        const { apiKey } = get();

        if (!apiKey) {
          console.error('apiKey отсутствует при попытке смены организации');
          return false;
        }

        try {
          const response = await TenantAuthService.switchOrganization(orgUserId);

          set({
            isAuthenticated: true,
            user: response.user,
            currentOrganizationId: response.organizationId,
            apiKey: response.apiKey || apiKey,
            requiresOrgSelection: false,
            pendingOrganizations: null,
          });

          return true;
        } catch (err: unknown) {
          console.error('Switch organization error:', err);
          return false;
        }
      },

      logout: async () => {
        try {
          await TenantAuthService.logout();
        } catch (err) {
          console.warn('Logout request failed, clearing state anyway...', err);
        } finally {
          set({
            isAuthenticated: false,
            user: null,
            currentOrganizationId: null,
            apiKey: null,
            requiresOrgSelection: false,
            pendingOrganizations: null,
          });
        }
      },

      refresh: async () => {
        try {
          const response = await TenantAuthService.refresh();
          if ('user' in response) {
            set({
              isAuthenticated: true,
              user: response.user,
              currentOrganizationId: response.organizationId,
              apiKey: response.apiKey,
            });
            return true;
          }
          return false;
        } catch {
          get().clearAuthState();
          return false;
        }
      },

      initializeAuth: async () => {
        const { isInitialized, isLoading, isAuthenticated } = get();

        // Если уже авторизованы или в процессе — выходим
        if (isInitialized || isLoading || isAuthenticated) return;

        set({ isLoading: true });

        try {
          const response = await TenantAuthService.me();
          set({
            isAuthenticated: true,
            user: response.user,
            currentOrganizationId: response.organizationId,
            apiKey: response.apiKey,
            requiresOrgSelection: false,
            isInitialized: true,
          });
        } catch (err: any) {
          // Если это 401, интерцептор сам вызовет refresh()
          // Мы помечаем инициализацию завершенной только если это НЕ 401,
          // либо позволяем интерцептору решить судьбу сессии.
          if (err.response?.status !== 401) {
            set({ isInitialized: true });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      clearAuthState: () => {
        set({
          isAuthenticated: false,
          user: null,
          currentOrganizationId: null,
          apiKey: null,
          requiresOrgSelection: false,
          pendingOrganizations: null,
          isLoading: false,
          isInitialized: true,
        });
      },
    }),
    { name: 'TenantAuthStore' }
  )
);