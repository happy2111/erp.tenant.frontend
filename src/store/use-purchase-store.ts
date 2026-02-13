import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PurchaseItem {
  productVariantId: string;
  title: string;
  sku: string | null;
  price: number;
  discount: number; // скидка на единицу товара
  quantity: number;
  total: number; // (price - discount) * quantity
  batchNumber?: string;
  expiryDate?: string;
}

interface PurchaseState {
  items: PurchaseItem[];
  supplierId: string | null;
  currencyId: string | null;
  kassaId: string | null;
  notes: string;

  addItem: (item: PurchaseItem) => void;
  updateQuantity: (productVariantId: string, qty: number) => void;
  updatePrice: (productVariantId: string, price: number) => void;
  updateDiscount: (productVariantId: string, discount: number) => void;
  updateBatch: (productVariantId: string, batch?: string, expiry?: string) => void;
  removeItem: (productVariantId: string) => void;

  setSupplier: (id: string | null) => void;
  setCurrency: (id: string | null) => void;
  setKassa: (id: string | null) => void;
  setNotes: (text: string) => void;

  // Геттеры для удобства
  getSubtotal: () => number;        // сумма без учёта скидок
  getTotalDiscount: () => number;   // общая сумма скидок
  getGrandTotal: () => number;      // итоговая сумма к оплате

  reset: () => void;
}

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set, get) => ({
      items: [],
      supplierId: null,
      currencyId: null,
      kassaId: null,
      notes: '',

      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productVariantId === newItem.productVariantId
          );

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productVariantId === newItem.productVariantId
                  ? {
                    ...i,
                    quantity: i.quantity + newItem.quantity,
                    total: (i.quantity + newItem.quantity) * (i.price - i.discount),
                  }
                  : i
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...newItem,
                total: newItem.quantity * (newItem.price - newItem.discount),
              },
            ],
          };
        }),

      updateQuantity: (id, qty) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productVariantId === id
                ? {
                  ...i,
                  quantity: qty,
                  total: qty * (i.price - i.discount),
                }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),

      updatePrice: (id, price) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productVariantId === id
              ? {
                ...i,
                price,
                total: i.quantity * (price - i.discount),
              }
              : i
          ),
        })),

      updateDiscount: (id, discount) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productVariantId === id
              ? {
                ...i,
                discount,
                total: i.quantity * (i.price - discount),
              }
              : i
          ),
        })),

      updateBatch: (id, batchNumber, expiryDate) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productVariantId === id ? { ...i, batchNumber, expiryDate } : i
          ),
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.productVariantId !== id),
        })),

      setSupplier: (id) => set({ supplierId: id }),
      setCurrency: (id) => set({ currencyId: id }),
      setKassa: (id) => set({ kassaId: id }),
      setNotes: (text) => set({ notes: text }),

      getSubtotal: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
      },

      getTotalDiscount: () => {
        const state = get();
        return state.items.reduce(
          (sum, item) => sum + item.quantity * item.discount,
          0
        );
      },

      getGrandTotal: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.total, 0);
      },

      reset: () =>
        set({
          items: [],
          supplierId: null,
          currencyId: null,
          kassaId: null,
          notes: '',
        }),
    }),
    { name: 'purchase-draft-storage' }
  )
);