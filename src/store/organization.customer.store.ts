import { create } from "zustand";
import { toast } from "sonner";
import { OrganizationCustomerService, OrganizationCustomer, FilterResponse, ConvertedUser } from "@/services/organization.customer.service";
import {
  CreateOrgCustomerRequest,
  UpdateOrgCustomerRequest,
  OrganizationCustomerFilterRequest,
  ConvertCustomerToUserRequest,
} from "@/schemas/organization.customer.schema";

// --- Интерфейс состояния (State Interface) ---

interface OrganizationCustomerState {
  customers: OrganizationCustomer[];
  filterData: FilterResponse<OrganizationCustomer> | null;
  loading: boolean;
  error: string | null;

  // Сервис для взаимодействия с API
  service: OrganizationCustomerService;

  // Методы для операций
  createCustomer: (dto: CreateOrgCustomerRequest) => Promise<OrganizationCustomer | null>;
  updateCustomer: (id: string, dto: UpdateOrgCustomerRequest) => Promise<OrganizationCustomer | null>;
  deleteCustomer: (id: string) => Promise<boolean>;
  filterCustomers: (dto: OrganizationCustomerFilterRequest) => Promise<void>;
  convertToUser: (dto: ConvertCustomerToUserRequest) => Promise<ConvertedUser | null>;

  // Вспомогательные методы
  clearError: () => void;
  clearCustomers: () => void;
}

// Создание экземпляра сервиса
const organizationCustomerService = new OrganizationCustomerService();

/**
 * Zustand Store для управления состоянием OrganizationCustomer
 */
export const useOrganizationCustomerStore = create<OrganizationCustomerState>((set, get) => ({
  customers: [],
  filterData: null,
  loading: false,
  error: null,
  service: organizationCustomerService,

  // --- Операции CRUD и Фильтрация ---

  createCustomer: async (dto: CreateOrgCustomerRequest) => {
    set({ loading: true, error: null });

    try {
      const customer = await organizationCustomerService.create(dto);

      // Добавляем нового клиента в локальный список
      set((state) => ({
        customers: [customer, ...state.customers],
        // Опционально: Обновляем общее количество в filterData
        filterData: state.filterData ? { ...state.filterData, total: state.filterData.total + 1 } : null,
      }));

      toast.success("Mijoz muvaffaqiyatli yaratildi (Customer created successfully)");
      return customer;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Mijoz yaratishda xatolik yuz berdi (Error creating customer)";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  updateCustomer: async (id: string, dto: UpdateOrgCustomerRequest) => {
    set({ loading: true, error: null });

    try {
      const updatedCustomer = await organizationCustomerService.update(id, dto);

      // Обновляем клиента в списке customers
      set((state) => ({
        customers: state.customers.map((c) =>
          c.id === id ? { ...c, ...updatedCustomer } : c
        ),
        filterData: state.filterData
          ? {
            ...state.filterData,
            data: state.filterData.data.map((c: any) =>
              c.id === id ? { ...c, ...updatedCustomer } : c
            ),
          }
          : null,
      }));

      toast.success("Mijoz muvaffaqiyatli yangilandi (Customer updated successfully)");
      return updatedCustomer;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Mijozni yangilashda xatolik yuz berdi (Error updating customer)";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  deleteCustomer: async (id: string) => {
    set({ loading: true, error: null });

    try {
      await organizationCustomerService.delete(id);

      set((state) => ({
        customers: state.customers.filter((c) => c.id !== id),
        filterData: state.filterData
          ? {
            ...state.filterData,
            data: state.filterData.data.filter((c: any) => c.id !== id),
            total: state.filterData.total - 1,
          }
          : null,
      }));

      toast.success("Mijoz muvaffaqiyatli o'chirildi (Customer deleted successfully)");
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Mijozni o'chirishda xatolik yuz berdi (Error deleting customer)";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  filterCustomers: async (dto: OrganizationCustomerFilterRequest) => {
    set({ loading: true, error: null });

    try {
      const result = await organizationCustomerService.filter(dto);

      set({
        customers: result.data, // Заменяем список клиентов данными из фильтра
        filterData: result // Сохраняем полный ответ с пагинацией
      });

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Mijozlarni filtrlashda xatolik yuz berdi (Error filtering customers)";
      set({ error: errorMessage });
      console.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  convertToUser: async (dto: ConvertCustomerToUserRequest) => {
    set({ loading: true, error: null });

    try {
      const convertedUser = await organizationCustomerService.convertToUser(dto);

      // Обновляем OrganizationCustomer в сторе, так как у него теперь есть userId
      set(state => ({
        customers: state.customers.map(c =>
          c.id === dto.customerId ? { ...c, userId: convertedUser.id } : c
        ),
        filterData: state.filterData
          ? {
            ...state.filterData,
            data: state.filterData.data.map((c: any) =>
              c.id === dto.customerId ? { ...c, userId: convertedUser.id } : c
            ),
          }
          : null,
      }));

      toast.success("Mijoz foydalanuvchiga aylantirildi (Customer converted to user)");
      return convertedUser;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Konvertatsiya qilishda xatolik (Error during conversion)";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // --- Вспомогательные методы ---

  clearError: () => {
    set({ error: null });
  },

  clearCustomers: () => {
    set({
      customers: [],
      filterData: null
    });
  },
}));