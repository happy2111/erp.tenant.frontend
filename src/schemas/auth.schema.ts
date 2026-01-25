import { z } from "zod";
import {components} from "@/shared/api/api-types";

export const tenantLoginSchema = z.object({
  login: z
    .string()
    .min(1, { message: "Email или телефон обязателен" }), // аналог IsString
  password: z
    .string()
    .min(8, { message: "Пароль должен быть минимум 8 символов" })
    .max(255, { message: "Пароль слишком длинный" }),
});

export type TenantLoginDto = z.infer<typeof tenantLoginSchema>;


export type LoginSuccessResponse = {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    phoneNumbers: Array<{ id: string; phone: string; isPrimary: boolean }>;
  };
  organizationId: string;
  apiKey: string;
};

export type OrgSelectionRequiredResponse = {
  requiresOrgSelection: true;
  organizations: Array<{
    orgName: string;
    orgUserId: string;
    orgId: string;
    role: string;
  }>;
  apiKey: string;
};

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
