'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePurchaseStore } from '@/store/use-purchase-store';
import { toast } from 'sonner';
import { SupplierSelector } from '../selectors/SupplierSelector';
import { CurrencySelector } from '../selectors/CurrencySelector';
import { KassaSelector } from '../selectors/KassaSelector';

export function PurchaseHeader() {
  const router = useRouter();
  const { items, reset, currencyId } = usePurchaseStore();

  const handleReset = () => {
    if (items.length === 0) return;
    if (confirm('Сбросить всю закупку?')) {
      reset();
      toast.info('Форма очищена');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-xl border-b border-border/40 px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between gap-4">
        {/* Левая часть */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-lg sm:text-xl font-black tracking-tight">Новая закупка</h1>
          <span className="hidden sm:inline text-sm text-muted-foreground">
            {items.length} позиций
          </span>
        </div>

        {/* Правая часть */}
        <div className="flex items-center gap-2 sm:gap-3">
          <SupplierSelector />

          <div className="hidden sm:flex items-center gap-2">
            <CurrencySelector />
            <KassaSelector disabled={!currencyId} />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={handleReset}
            disabled={items.length === 0}
          >
            <RotateCcw className="size-4" />
            <span className="hidden sm:inline">Сброс</span>
          </Button>
        </div>
      </div>

      {/* Мобильные селекторы валюты и кассы */}
      <div className="sm:hidden flex gap-2 mt-3 overflow-x-auto pb-1">
        <CurrencySelector />
        <KassaSelector disabled={!currencyId} />
      </div>
    </header>
  );
}