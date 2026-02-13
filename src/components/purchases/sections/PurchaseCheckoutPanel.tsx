'use client';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { usePurchaseStore } from '@/store/use-purchase-store';
import { PurchasesService } from '@/services/purchases.service';
import { toast } from 'sonner';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  onSuccess?: () => void;
}

export function PurchaseCheckoutPanel({ onSuccess }: Props) {
  const {
    items,
    supplierId,
    currencyId,
    kassaId,
    notes,
    setNotes,
    getSubtotal,
    getTotalDiscount,
    getGrandTotal,
    reset,
  } = usePurchaseStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = getSubtotal();
  const totalDiscount = getTotalDiscount();
  const grandTotal = getGrandTotal();

  const handleCreatePurchase = async () => {
    if (!supplierId) {
      toast.error('Выберите поставщика');
      return;
    }
    if (!currencyId) {
      toast.error('Выберите валюту');
      return;
    }
    if (items.length === 0) {
      toast.error('Добавьте хотя бы один товар');
      return;
    }

    setIsSubmitting(true);

    try {
      const dto = {
        supplierId,
        currencyId,
        kassaId: kassaId || undefined,
        status: 'DRAFT' as const,
        notes: notes || undefined,
        items: items.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
        })),
      };

      await PurchasesService.create(dto);

      toast.success('Закупка успешно создана');
      reset();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message || 'Ошибка при создании закупки');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-5 lg:p-6 space-y-6 bg-background/80 backdrop-blur-sm border-t lg:border-t-0 lg:border-l">
      {/* Суммы */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Сумма без скидки:</span>
          <span>{subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Скидка:</span>
          <span className="text-destructive">-{totalDiscount.toLocaleString()}</span>
        </div>

        <div className="h-px bg-border my-2" />

        <div className="flex justify-between items-center text-lg font-bold">
          <span>Итого к оплате:</span>
          <span className="text-primary text-2xl">{grandTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* Заметки */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Заметки / комментарий</label>
        <Textarea
          placeholder="Дополнительная информация, условия поставки..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[90px] rounded-2xl resize-none"
        />
      </div>

      {/* Кнопка создания */}
      <Button
        id="purchase-submit-btn"
        size="lg"
        className="w-full h-14 rounded-2xl text-base font-bold"
        onClick={handleCreatePurchase}
        disabled={isSubmitting || items.length === 0 || !supplierId || !currencyId}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Создание...
          </>
        ) : (
          'Создать закупку'
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Закупка будет создана в статусе «Черновик»
      </p>
    </div>
  );
}
