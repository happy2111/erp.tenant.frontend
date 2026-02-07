import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductVariant } from '@/schemas/product-variants.schema';
import { v4 as uuidv4 } from 'uuid';
import {Currency} from "@/schemas/currency.schema";


interface InstallmentDraft {
  totalAmount: number;      // вся сумма в рассрочку
  initialPayment: number;   // первый взнос
  totalMonths: number;      // срок
  dueDate?: string;
  notes?: string;
}


interface CartItem {
  productVariantId: string;
  title: string;
  sku: string | null;
  price: number;
  quantity: number;
  total: number;
  instanceId: string | null;
}
interface PosState {
  items: CartItem[];
  currencyId: string | null;
  customerId: string | null;
  kassaId: string | null;
  notes: string;
  installment: InstallmentDraft | null;
  currency: Currency | null;
  setCurrencyValues: (currency: Currency) => void;

  addItem: (variant: ProductVariant, selectedPrice?: number, instanceId?: string) => void;
  removeItem: (variantId: string, instanceId: string | undefined) => void;
  updateQuantity: (variantId: string, quantity: number, instanceId: string | undefined) => void;
  updatePrice: (variantId: string, price: number) => void;

  setInstallment: (data: InstallmentDraft | null) => void;
  clearInstallment: () => void;


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
      currency: null,

      installment: null,

      setCurrencyValues: (currency: Currency) =>
        set({ currencyId: currency.id, currency }),

      setInstallment: (data) => set({ installment: data }),

      clearInstallment: () => set({ installment: null }),


      addItem: (variant, selectedPrice, instanceId?: string) => set((state) => {
        const price = selectedPrice ?? variant.defaultPrice ?? 0;

        // Если передан instanceId — создаем отдельный item
        if (instanceId) {
          return {
            items: [...state.items, {
              productVariantId: variant.id,
              title: variant.title,
              sku: variant.sku,
              price,
              quantity: 1,
              total: price,
              instanceId,
            }],
          };
        }

        const existingItem = state.items.find(i => i.productVariantId === variant.id && !i.instanceId);

        if (existingItem) {
          return {
            items: state.items.map(i =>
              i.productVariantId === variant.id && !i.instanceId
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
            price,
            quantity: 1,
            total: price,
            instanceId: instanceId ?? undefined
          }]
        };
      }),

      updateQuantity: (variantId, quantity, instanceId?) =>
        set((state) => ({
          items: state.items
            .map(i => {
              if (instanceId) {
                return i.instanceId === instanceId
                  ? { ...i, quantity, total: quantity * i.price }
                  : i;
              }

              return i.productVariantId === variantId && !i.instanceId
                ? { ...i, quantity, total: quantity * i.price }
                : i;
            })
            .filter(i => i.quantity > 0)
        })),


      updatePrice: (id, p) => set((state) => ({
        items: state.items.map(i =>
          i.productVariantId === id ? { ...i, price: p, total: i.quantity * p } : i
        )
      })),

      removeItem: (variantId, instanceId?) =>
        set((state) => ({
          items: state.items.filter(i =>
            instanceId
              ? i.instanceId !== instanceId
              : !(i.productVariantId === variantId && !i.instanceId)
          )
        })),



      setCurrency: (id) => set({ currencyId: id }),
      setCustomer: (id) => set({ customerId: id }),
      setKassa: (id) => set({ kassaId: id }),
      setNotes: (text) => set({ notes: text }),

      reset: () => set({
        items: [],
        currencyId: null,
        customerId: null,
        kassaId: null,
        notes: '',
        installment: null,
        currency: null
      }),


    }),
    { name: 'pos-storage' }
  )
);