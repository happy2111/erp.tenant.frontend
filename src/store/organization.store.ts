import { create } from "zustand";
import { OrganizationService } from "@/services/organization.service";
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  Organization,
  OrganizationWithUserRole,
  GetOrganizationsQueryDto
} from "@/schemas/organization.schema";
import { toast } from "sonner";

interface OrganizationState {
  organizations: OrganizationWithUserRole[];
  allOrganizations: Organization[];
  currentOrganization: OrganizationWithUserRole | null;
  loading: boolean;
  error: string | null;

  service: OrganizationService;

  createOrganization: (dto: CreateOrganizationDto) => Promise<Organization | null>;
  updateOrganization: (id: string, dto: UpdateOrganizationDto) => Promise<Organization | null>;
  deleteOrganization: (id: string) => Promise<boolean>;
  fetchUserOrganizations: () => Promise<void>;
  fetchAllOrganizations: (query?: GetOrganizationsQueryDto) => Promise<void>;
  fetchOrganizationById: (id: string) => Promise<OrganizationWithUserRole | null>;
  setCurrentOrganization: (org: OrganizationWithUserRole | null) => void;
  clearError: () => void;
  clearOrganizations: () => void;

  getUserRole: (orgId: string) => string | undefined;
  hasRole: (orgId: string, roles: string[]) => boolean;
  getUserPosition: (orgId: string) => string | undefined | null;
}

const organizationService = new OrganizationService();

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  organizations: [],
  allOrganizations: [],
  currentOrganization: null,
  loading: false,
  error: null,
  service: organizationService,

  createOrganization: async (dto: CreateOrganizationDto) => {
    set({ loading: true, error: null });

    try {
      const organization = await organizationService.create(dto);

      set(state => ({
        organizations: [organization as OrganizationWithUserRole, ...state.organizations],
        allOrganizations: [organization, ...state.allOrganizations]
      }));

      toast.success("Tashkilot muvaffaqiyatli yaratildi");
      return organization;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Tashkilot yaratishda xatolik yuz berdi";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  updateOrganization: async (id: string, dto: UpdateOrganizationDto) => {
    set({ loading: true, error: null });

    try {
      const updatedOrg = await organizationService.update(id, dto);

      // Update in all lists
      set(state => ({
        organizations: state.organizations.map(org =>
          org.id === id ? { ...org, ...updatedOrg } : org
        ),
        allOrganizations: state.allOrganizations.map(org =>
          org.id === id ? updatedOrg : org
        ),
        currentOrganization: state.currentOrganization?.id === id
          ? { ...state.currentOrganization, ...updatedOrg }
          : state.currentOrganization
      }));

      return updatedOrg;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Tashkilotni yangilashda xatolik yuz berdi";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  deleteOrganization: async (id: string) => {
    set({ loading: true, error: null });

    try {
      await organizationService.hardDelete(id);

      set(state => ({
        organizations: state.organizations.filter(org => org.id !== id),
        allOrganizations: state.allOrganizations.filter(org => org.id !== id),
        currentOrganization: state.currentOrganization?.id === id
          ? null
          : state.currentOrganization
      }));

      toast.success("Tashkilot muvaffaqiyatli o'chirildi");
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Tashkilotni o'chirishda xatolik yuz berdi";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  fetchUserOrganizations: async () => {
    set({ loading: true, error: null });

    try {
      const organizations = await organizationService.getAllForUser();
      set({ organizations });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Tashkilotlarni yuklashda xatolik yuz berdi";
      set({ error: errorMessage });
      console.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  fetchAllOrganizations: async (query?: GetOrganizationsQueryDto) => {
    set({ loading: true, error: null });

    try {
      const organizations = await organizationService.getAll(query);
      set({ allOrganizations: organizations });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Barcha tashkilotlarni yuklashda xatolik yuz berdi";
      set({ error: errorMessage });
      console.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },



  fetchOrganizationById: async (id: string) => {
    set({ loading: true, error: null });

    try {
      const organization = await organizationService.getOneForUser(id);
      set({ currentOrganization: organization });
      return organization;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Tashkilotni yuklashda xatolik yuz berdi";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  setCurrentOrganization: (org) => {
    set({ currentOrganization: org });
  },

  clearError: () => {
    set({ error: null });
  },

  clearOrganizations: () => {
    set({
      organizations: [],
      allOrganizations: [],
      currentOrganization: null
    });
  },

  getUserRole: (orgId: string) => {
    const { organizations } = get();
    const org = organizations.find(o => o.id === orgId);
    return org?.org_users?.[0]?.role;
  },

  hasRole: (orgId: string, roles: string[]) => {
    const { organizations } = get();
    const org = organizations.find(o => o.id === orgId);

    if (!org?.org_users || org.org_users.length === 0) return false;
    return org.org_users.some(user => roles.includes(user.role));
  },

  getUserPosition: (orgId: string) => {
    const { organizations } = get();
    const org = organizations.find(o => o.id === orgId);
    return org?.org_users?.[0]?.position;
  }
}));