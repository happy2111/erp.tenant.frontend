import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Currency } from '@/schemas/currency.schema';

/** Черновик серийной единицы в корзине закупки */
export type PurchaseCartInstance = {
  serialNumber: string;
  price?: number;
  discount?: number;
  attributeValueIds: string[];
};

export type PurchaseCartItem = {
  productVariantId: string;
  title: string;
  sku: string | null;
  price: number;
  discount: number;
  quantity: number;
  total: number;
  batchNumber?: string;
  expiryDate?: string;
  /** Если есть — позиция серийная (namuna), quantity = instances.length */
  instances?: PurchaseCartInstance[];
};

function lineTotal(item: {
  price: number;
  discount: number;
  quantity: number;
  instances?: PurchaseCartInstance[];
}): number {
  if (item.instances?.length) {
    return item.instances.reduce((sum, inst) => {
      const p = inst.price ?? item.price;
      const d = inst.discount ?? item.discount;
      return sum + (p - d);
    }, 0);
  }
  return item.quantity * (item.price - item.discount);
}

interface PurchaseState {
  items: PurchaseCartItem[];
  supplierId: string | null;
  currencyId: string | null;
  kassaId: string | null;
  notes: string;
  confirmNow: boolean;
  setConfirmNow: (value: boolean) => void;
  payFromKassa: boolean;
  setPayFromKassa: (value: boolean) => void;
  currency: Currency | null;
  setCurrencyData: (currency: Currency) => void;

  addItem: (item: PurchaseCartItem) => { ok: true } | { ok: false; error: string };
  updateQuantity: (productVariantId: string, qty: number) => void;
  updatePrice: (productVariantId: string, price: number) => void;
  updateDiscount: (productVariantId: string, discount: number) => void;
  updateBatch: (
    productVariantId: string,
    batch?: string,
    expiry?: string,
  ) => void;
  removeItem: (productVariantId: string) => void;

  setSupplier: (id: string | null) => void;
  setCurrency: (id: string | null) => void;
  setKassa: (id: string | null) => void;
  setNotes: (text: string) => void;

  getSubtotal: () => number;
  getTotalDiscount: () => number;
  getGrandTotal: () => number;

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
      confirmNow: true,
      payFromKassa: false,
      currency: null,

      setCurrencyData: (currency: Currency) => set({ currency }),

      addItem: (newItem) => {
        const state = get();
        const existing = state.items.find(
          (i) => i.productVariantId === newItem.productVariantId,
        );
        const incomingSerial = !!newItem.instances?.length;
        const existingSerial = !!existing?.instances?.length;

        if (existing && incomingSerial !== existingSerial) {
          return {
            ok: false as const,
            error: incomingSerial
              ? 'Bu variant allaqachon oddiy (dona) sifatida qo‘shilgan. Avval olib tashlang.'
              : 'Bu variant allaqachon namuna sifatida qo‘shilgan. Avval olib tashlang.',
          };
        }

        if (existing && incomingSerial && existingSerial) {
          const merged = [...(existing.instances ?? []), ...(newItem.instances ?? [])];
          const serials = merged.map((i) => i.serialNumber.trim().toLowerCase());
          if (new Set(serials).size !== serials.length) {
            return {
              ok: false as const,
              error: 'Bir xil serial raqam takrorlanmoqda',
            };
          }
          set({
            items: state.items.map((i) => {
              if (i.productVariantId !== newItem.productVariantId) return i;
              const next = {
                ...i,
                price: newItem.price,
                discount: newItem.discount,
                instances: merged,
                quantity: merged.length,
              };
              return { ...next, total: lineTotal(next) };
            }),
          });
          return { ok: true as const };
        }

        if (existing && !incomingSerial) {
          set({
            items: state.items.map((i) => {
              if (i.productVariantId !== newItem.productVariantId) return i;
              const quantity = i.quantity + newItem.quantity;
              const next = {
                ...i,
                price: newItem.price,
                discount: newItem.discount,
                quantity,
              };
              return { ...next, total: lineTotal(next) };
            }),
          });
          return { ok: true as const };
        }

        set({
          items: [
            ...state.items,
            {
              ...newItem,
              total: lineTotal(newItem),
            },
          ],
        });
        return { ok: true as const };
      },

      setConfirmNow: (confirmNow) => set({ confirmNow }),
      setPayFromKassa: (payFromKassa) => set({ payFromKassa }),

      updateQuantity: (id, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => {
              if (i.productVariantId !== id) return i;
              // Серийные строки qty только через список instances
              if (i.instances?.length) return i;
              const next = { ...i, quantity: qty };
              return { ...next, total: lineTotal(next) };
            })
            .filter((i) => i.quantity > 0),
        })),

      updatePrice: (id, price) =>
        set((state) => ({
          items: state.items.map((i) => {
            if (i.productVariantId !== id) return i;
            const next = { ...i, price };
            return { ...next, total: lineTotal(next) };
          }),
        })),

      updateDiscount: (id, discount) =>
        set((state) => ({
          items: state.items.map((i) => {
            if (i.productVariantId !== id) return i;
            const next = { ...i, discount };
            return { ...next, total: lineTotal(next) };
          }),
        })),

      updateBatch: (id, batchNumber, expiryDate) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productVariantId === id ? { ...i, batchNumber, expiryDate } : i,
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
        return state.items.reduce((sum, item) => {
          if (item.instances?.length) {
            return (
              sum +
              item.instances.reduce(
                (s, inst) => s + (inst.price ?? item.price),
                0,
              )
            );
          }
          return sum + item.quantity * item.price;
        }, 0);
      },

      getTotalDiscount: () => {
        const state = get();
        return state.items.reduce((sum, item) => {
          if (item.instances?.length) {
            return (
              sum +
              item.instances.reduce(
                (s, inst) => s + (inst.discount ?? item.discount),
                0,
              )
            );
          }
          return sum + item.quantity * item.discount;
        }, 0);
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
          confirmNow: true,
          payFromKassa: false,
          currency: null,
        }),
    }),
    {
      name: 'purchase-draft-storage',
      // v3 — в корзине появились instances (namuna)
      version: 3,
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Record<string, unknown>;
        if (version < 2) {
          delete state.status;
          delete state.initialPayment;
          state.confirmNow = true;
          state.payFromKassa = false;
        }
        if (version < 3) {
          // Старые строки без instances остаются bulk — ок
        }
        return state as PurchaseState;
      },
    },
  ),
);
