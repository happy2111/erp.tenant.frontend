// src/store/organization.user.store.ts
import { create } from "zustand";
import { toast } from "sonner";
import {
  OrganizationUserService,
  OrganizationUser,
} from "@/services/organization.user.service";
import {
  CreateOrganizationUserDto,
  // 🔑 Updated DTO name for the create-with-user endpoint
  CreateOrgUserWithUserDto,
  UpdateOrganizationUserDto,
  OrgUserFilterDto,
} from "@/schemas/organization.user.schema";

// ---------------------------------------------------
// 1. Interface Update
// ---------------------------------------------------

interface OrganizationUserState {
  users: OrganizationUser[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;

  service: OrganizationUserService;

  // CRUD
  createUser: (dto: CreateOrganizationUserDto) => Promise<OrganizationUser | null>;
  // 🔑 Renamed and updated signature to match the backend service/controller logic
  // The organizationId is now inside the DTO (CreateOrgUserWithUserDto)
  createUserWithUser: (
    dto: CreateOrgUserWithUserDto
  ) => Promise<OrganizationUser | null>;
  updateUser: (id: string, dto: UpdateOrganizationUserDto) => Promise<OrganizationUser | null>;
  deleteUser: (id: string) => Promise<boolean>;
  fetchUsers: (query?: Partial<OrgUserFilterDto>) => Promise<void>;

  // Helpers
  hasRole: (userId: string, roles: string[]) => boolean;
  getRole: (userId: string) => string | undefined;
  getPosition: (userId: string) => string | undefined | null;

  clearError: () => void;
  clearUsers: () => void;
}

const service = new OrganizationUserService();

// ---------------------------------------------------
// 2. Store Implementation Update
// ---------------------------------------------------

export const useOrganizationUserStore = create<OrganizationUserState>((set, get) => ({
  users: [],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  error: null,
  service,

  // Existing: Creates OrgUser with an EXISTING Tenant User
  createUser: async (dto) => {
    set({ loading: true, error: null });
    try {
      const user = await service.create(dto);
      set((state) => ({ users: [user, ...state.users] }));
      toast.success("User successfully assigned to organization");
      return user;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error creating organization user";
      set({ error: msg });
      toast.error(msg);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // 🔑 Updated implementation: Creates OrgUser with a NEW Tenant User
  createUserWithUser: async (dto) => {
    set({ loading: true, error: null });
    try {
      // 🔑 Call the new service method: service.createWithUser(dto)
      const user = await service.createWithUser(dto);
      set((state) => ({ users: [user, ...state.users] }));
      toast.success("New user and organization assignment successfully created");
      return user;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error creating new user and organization assignment";
      set({ error: msg });
      toast.error(msg);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // Renamed the original (now unused) method to the correct implementation name.
  // The original store had:
  // createUserWithTenant: async (orgId, dto) => { ... service.createWithTenantUser(orgId, dto) ... }
  // This has been replaced by the more accurate: createUserWithUser: async (dto) => { ... service.createWithUser(dto) ... }
  // The old signature is not needed, as the new DTO contains organizationId.
  // I will remove the old definition to prevent conflicts and keep the store clean.


  updateUser: async (id, dto) => {
    set({ loading: true, error: null });
    try {
      const updated = await service.update(id, dto);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updated : u)),
      }));
      toast.success("User successfully updated");
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error updating user";
      set({ error: msg });
      toast.error(msg);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  deleteUser: async (id) => {
    set({ loading: true, error: null });
    try {
      await service.delete(id);
      set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
      toast.success("User successfully deleted");
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error deleting user";
      set({ error: msg });
      toast.error(msg);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  fetchUsers: async (query) => {
    set({ loading: true, error: null });
    try {
      const res = await service.filter(query || {});
      set({
        users: res.data,
        total: res.total,
        page: res.page,
        limit: res.limit,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error fetching users";
      set({ error: msg });
      console.error(msg);
    } finally {
      set({ loading: false });
    }
  },

  hasRole: (userId, roles) => {
    const user = get().users.find((u) => u.id === userId);
    return user ? service.hasRole(user, roles) : false;
  },

  getRole: (userId) => {
    const user = get().users.find((u) => u.id === userId);
    return user ? service.getRole(user) : undefined;
  },

  getPosition: (userId) => {
    const user = get().users.find((u) => u.id === userId);
    return user ? service.getPosition(user) : undefined;
  },

  clearError: () => set({ error: null }),
  clearUsers: () => set({ users: [], total: 0, page: 1, limit: 10 }),
}));