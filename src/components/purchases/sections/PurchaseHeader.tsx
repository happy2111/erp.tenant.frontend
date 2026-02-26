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
  const { items, reset, currencyId, kassaId, supplierId, initialPayment, notes } = usePurchaseStore();

  const handleReset = () => {
    if (confirm('Butun xaridni bekor qilish?')) {
      reset();
      toast.info('Forma tozalandi');
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
          <h1 className="text-lg sm:text-xl hidden sm:inline font-black tracking-tight">Yangi xarid</h1>
          <span className="hidden sm:inline text-sm text-muted-foreground">
            {items.length} ta mahsulot
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
            disabled={
              items.length === 0 &&
              !supplierId &&
              !currencyId &&
              !kassaId &&
              !notes &&
              initialPayment === 0
            }
          >
            <RotateCcw className="size-4" />
            <span className="hidden sm:inline">Tozalash</span>
          </Button>
        </div>
      </div>

      <div className="sm:hidden flex gap-2 mt-3 overflow-x-auto pb-1">
        <CurrencySelector />
        <KassaSelector disabled={!currencyId} />
      </div>
    </header>
  );
}