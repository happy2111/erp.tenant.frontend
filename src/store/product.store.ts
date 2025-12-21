import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  Product,
  ProductWithDetails,
  CreateProductDto,
  UpdateProductDto,
  ProductFilterDto,
  PaginatedProducts,
} from "@/schemas/product.schema";

import { productService } from "@/services/product.service";

interface ProductState {
  // ===== DATA =====
  products: Product[];
  total: number;
  page: number;
  limit: number;

  currentProduct: ProductWithDetails | null;

  // ===== UI STATE =====
  loading: boolean;
  error: string | null;

  // ===== FILTER STATE =====
  search: string;

  // ===== ACTIONS =====
  fetchProducts: (filter?: ProductFilterDto) => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;

  createProduct: (dto: CreateProductDto) => Promise<Product | null>;
  updateProduct: (
    id: string,
    dto: UpdateProductDto
  ) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;

  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  resetCurrentProduct: () => void;
}

export const useProductStore = create<ProductState>()(
  devtools(
    (set, get) => ({
      // ===== INITIAL STATE =====
      products: [],
      total: 0,
      page: 1,
      limit: 10,

      currentProduct: null,

      loading: false,
      error: null,

      search: "",

      // ===== ACTIONS =====

      fetchProducts: async (filter) => {
        const state = get();

        const finalFilter: ProductFilterDto = {
          search: filter?.search ?? state.search,
          page: filter?.page ?? state.page,
          limit: filter?.limit ?? state.limit,
        };

        try {
          set({ loading: true, error: null });

          const res: PaginatedProducts =
            await productService.findAll(finalFilter);

          set({
            products: res.data,
            total: res.total,
            page: res.page,
            limit: res.limit,
            search: finalFilter.search ?? "",
          });
        } catch (err: any) {
          set({
            error:
              err?.response?.data?.message ??
              "Ошибка при загрузке товаров",
          });
        } finally {
          set({ loading: false });
        }
      },

      fetchProductById: async (id) => {
        try {
          set({ loading: true, error: null });

          const product =
            await productService.findOne(id);

          set({ currentProduct: product });
        } catch (err: any) {
          set({
            error:
              err?.response?.data?.message ??
              "Ошибка при загрузке товара",
          });
        } finally {
          set({ loading: false });
        }
      },

      createProduct: async (dto) => {
        try {
          set({ loading: true, error: null });

          const product = await productService.create(dto);

          set((state) => ({
            products: [product, ...state.products],
            total: state.total + 1,
          }));

          return product;
        } catch (err: any) {
          set({
            error:
              err?.response?.data?.message ??
              "Ошибка при создании товара",
          });
          return null;
        } finally {
          set({ loading: false });
        }
      },

      updateProduct: async (id, dto) => {
        try {
          set({ loading: true, error: null });

          const updated =
            await productService.update(id, dto);

          set((state) => ({
            products: state.products.map((p) =>
              p.id === id ? updated : p
            ),
            currentProduct:
              state.currentProduct?.id === id
                ? { ...state.currentProduct, ...updated }
                : state.currentProduct,
          }));

          return updated;
        } catch (err: any) {
          set({
            error:
              err?.response?.data?.message ??
              "Ошибка при обновлении товара",
          });
          return null;
        } finally {
          set({ loading: false });
        }
      },

      deleteProduct: async (id) => {
        try {
          set({ loading: true, error: null });

          await productService.remove(id);

          set((state) => ({
            products: state.products.filter(
              (p) => p.id !== id
            ),
            total: Math.max(0, state.total - 1),
            currentProduct:
              state.currentProduct?.id === id
                ? null
                : state.currentProduct,
          }));

          return true;
        } catch (err: any) {
          set({
            error:
              err?.response?.data?.message ??
              "Ошибка при удалении товара",
          });
          return false;
        } finally {
          set({ loading: false });
        }
      },

      setSearch: (search) => {
        set({ search, page: 1 });
      },

      setPage: (page) => {
        set({ page });
      },

      resetCurrentProduct: () => {
        set({ currentProduct: null });
      },
    }),
    {
      name: "product-store",
    }
  )
);
