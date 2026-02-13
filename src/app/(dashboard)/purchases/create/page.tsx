'use client';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { PurchaseHeader } from '@/components/purchases/sections/PurchaseHeader';
import { ProductSearchAndAdd } from '@/components/purchases/sections/ProductSearchAndAdd';
import { PurchaseCartList } from '@/components/purchases/sections/PurchaseCartList';
import { PurchaseCheckoutPanel } from '@/components/purchases/sections/PurchaseCheckoutPanel';

import { usePurchaseStore } from '@/store/use-purchase-store';

export default function PurchaseCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { reset } = usePurchaseStore();

  const handlePurchaseCreated = () => {
    reset();
    queryClient.invalidateQueries({ queryKey: ['purchases'] });
    queryClient.invalidateQueries({ queryKey: ['stocks'] });
    queryClient.invalidateQueries({ queryKey: ['product-variants'] });
    toast.success('Закупка успешно создана');
    router.push('/purchases');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Шапка */}
      <PurchaseHeader />

      {/* Основной контент */}
      <div className="flex flex-1 overflow-hidden">
        {/* Левая часть — поиск и добавление товаров */}
        <section className="flex-1 overflow-y-auto custom-scrollbar bg-muted/20 p-4 lg:p-6">
          <ProductSearchAndAdd />
        </section>

        {/* Правая панель — корзина + итоги (десктоп) */}
        <aside className="hidden lg:flex lg:w-96 lg:flex-col lg:border-l lg:bg-card/30 lg:overflow-y-auto">
          <div className="flex-1 overflow-y-auto p-5 lg:p-6">
            <PurchaseCartList />
          </div>

          <div className="border-t bg-background/90 backdrop-blur-sm p-5 lg:p-6">
            <PurchaseCheckoutPanel onSuccess={handlePurchaseCreated} />
          </div>
        </aside>
      </div>

      {/* Мобильная нижняя панель с корзиной и оплатой */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-background/95 backdrop-blur-lg border-t">
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="p-4 pb-20">
            <PurchaseCartList />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <PurchaseCheckoutPanel onSuccess={handlePurchaseCreated} />
        </div>
      </div>
    </div>
  );
}