import { create } from 'zustand';
import { OrganizationService } from '@/services/organization.service';
import {Organization} from "@/schemas/organization.schema";

interface OrganizationState {
  organizations: Organization[];
  isLoading: boolean;
  fetchOrganizations: () => Promise<void>;
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  organizations: [],
  isLoading: false,
  fetchOrganizations: async () => {
    set({ isLoading: true });
    try {
      const data = await OrganizationService.getAll();
      set({ organizations: data, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch organizations", error);
      set({ isLoading: false });
    }
  },
}));