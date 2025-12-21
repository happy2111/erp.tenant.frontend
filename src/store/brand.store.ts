import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  Brand,
  CreateBrandDto,
  UpdateBrandDto,
  BrandFilterDto,
  PaginatedBrands,
} from "@/schemas/brand.schema";

import { BrandService } from "@/services/brand.service";

const brandService = new BrandService();

interface BrandState {
  // ===== STATE =====
  brands: Brand[];
  total: number;
  page: number;
  limit: number;

  currentBrand: Brand | null;
  loading: boolean;
  error: string | null;

  // ===== ACTIONS =====
  fetchBrands: (filter: BrandFilterDto) => Promise<void>;
  fetchBrandById: (id: string) => Promise<void>;
  createBrand: (dto: CreateBrandDto) => Promise<Brand | null>;
  updateBrand: (id: string, dto: UpdateBrandDto) => Promise<Brand | null>;
  deleteBrand: (id: string) => Promise<boolean>;
  resetCurrentBrand: () => void;
}

export const useBrandStore = create<BrandState>()(
  devtools((set, get) => ({
    // ===== INITIAL STATE =====
    brands: [],
    total: 0,
    page: 1,
    limit: 10,

    currentBrand: null,
    loading: false,
    error: null,

    // ===== ACTIONS =====
    fetchBrands: async (filter) => {
      try {
        set({ loading: true, error: null });

        const res: PaginatedBrands = await brandService.findAll(filter);

        set({
          brands: res.data,
          total: res.total,
          page: res.page,
          limit: res.limit,
        });
      } catch (err: any) {
        set({
          error:
            err?.response?.data?.message ??
            "Ошибка при получении брендов",
        });
      } finally {
        set({ loading: false });
      }
    },

    fetchBrandById: async (id) => {
      try {
        set({ loading: true, error: null });

        const brand = await brandService.findOne(id);

        set({ currentBrand: brand });
      } catch (err: any) {
        set({
          error:
            err?.response?.data?.message ??
            "Ошибка при получении бренда",
        });
      } finally {
        set({ loading: false });
      }
    },

    createBrand: async (dto) => {
      try {
        set({ loading: true, error: null });

        const brand = await brandService.create(dto);

        set((state) => ({
          brands: [brand, ...state.brands],
          total: state.total + 1,
        }));

        return brand;
      } catch (err: any) {
        set({
          error:
            err?.response?.data?.message ??
            "Ошибка при создании бренда",
        });
        return null;
      } finally {
        set({ loading: false });
      }
    },

    updateBrand: async (id, dto) => {
      try {
        set({ loading: true, error: null });

        const updated = await brandService.update(id, dto);

        set((state) => ({
          brands: state.brands.map((b) =>
            b.id === id ? updated : b
          ),
          currentBrand:
            state.currentBrand?.id === id
              ? updated
              : state.currentBrand,
        }));

        return updated;
      } catch (err: any) {
        set({
          error:
            err?.response?.data?.message ??
            "Ошибка при обновлении бренда",
        });
        return null;
      } finally {
        set({ loading: false });
      }
    },

    deleteBrand: async (id) => {
      try {
        set({ loading: true, error: null });

        await brandService.remove(id);

        set((state) => ({
          brands: state.brands.filter((b) => b.id !== id),
          total: Math.max(0, state.total - 1),
          currentBrand:
            state.currentBrand?.id === id
              ? null
              : state.currentBrand,
        }));

        return true;
      } catch (err: any) {
        set({
          error:
            err?.response?.data?.message ??
            "Ошибка при удалении бренда",
        });
        return false;
      } finally {
        set({ loading: false });
      }
    },

    resetCurrentBrand: () => {
      set({ currentBrand: null });
    },
  }))
);
