import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductVariant } from '@/schemas/product-variants.schema';

interface CartItem {
  productVariantId: string;
  title: string;
  sku: string | null;
  price: number; // Цена, по которой продаем (может отличаться от defaultPrice)
  quantity: number;
  total: number;
}

interface PosState {
  // Данные корзины
  items: CartItem[];
  currencyId: string | null;
  customerId: string | null;
  kassaId: string | null;
  notes: string;

  // Действия
  addItem: (variant: ProductVariant, selectedPrice?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  updatePrice: (variantId: string, price: number) => void;

  setCurrency: (id: string) => void;
  setCustomer: (id: string | null) => void;
  setKassa: (id: string | null) => void;
  setNotes: (text: string) => void;

  reset: () => void;
}

export const usePosStore = create<PosState>()(
  persist(
    (set) => ({
      items: [],
      currencyId: null,
      customerId: null,
      kassaId: null,
      notes: '',

      addItem: (variant, selectedPrice) => set((state) => {
        const price = selectedPrice ?? variant.defaultPrice ?? 0;
        const existingItem = state.items.find(i => i.productVariantId === variant.id);

        if (existingItem) {
          return {
            items: state.items.map(i =>
              i.productVariantId === variant.id
                ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price }
                : i
            )
          };
        }

        return {
          items: [...state.items, {
            productVariantId: variant.id,
            title: variant.title,
            sku: variant.sku,
            price: price,
            quantity: 1,
            total: price,
          }]
        };
      }),

      updateQuantity: (id, q) => set((state) => ({
        items: state.items
          .map(i => i.productVariantId === id ? { ...i, quantity: q, total: q * i.price } : i)
          .filter(i => i.quantity > 0)
      })),

      updatePrice: (id, p) => set((state) => ({
        items: state.items.map(i =>
          i.productVariantId === id ? { ...i, price: p, total: i.quantity * p } : i
        )
      })),

      setCurrency: (id) => set({ currencyId: id }),
      setCustomer: (id) => set({ customerId: id }),
      setKassa: (id) => set({ kassaId: id }),
      setNotes: (text) => set({ notes: text }),

      reset: () => set({ items: [], customerId: null, notes: '', installment: null }),
    }),
    { name: 'pos-storage' }
  )
);