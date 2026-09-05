'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PurchasesService } from '@/services/purchases.service';
import { Purchase } from '@/schemas/purchases.schema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Undo2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  purchase: Purchase;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Отмена проведённой закупки: партии удаляются, товар снимается со склада,
 * оплаты возвращаются компенсирующими платежами. Если из партии уже что-то
 * списали — бэкенд откажет, и это правильно: себестоимость продажи уже
 * посчитана по этой партии.
 */
export function CancelPurchaseDialog({ purchase, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');

  const touchedBatch = purchase.product_batches?.find(
    (b) => b.remainingQuantity !== b.quantity
  );

  const mutation = useMutation({
    mutationFn: () => PurchasesService.cancelPurchase(purchase.id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase', purchase.id] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['product-batches'] });
      queryClient.invalidateQueries({ queryKey: ['variant-cost'] });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      toast.success('Xarid bekor qilindi');
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const message = (
        err as { response?: { data?: { message?: string | { message?: string } } } }
      )?.response?.data?.message;
      toast.error(
        (typeof message === 'string' ? message : message?.message) ||
        'Bekor qilishda xatolik'
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] rounded-[2.5rem] p-8">
        <DialogHeader>
          <div className="size-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-3">
            <Undo2 className="size-7 text-destructive" />
          </div>
          <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
            Xaridni bekor qilish
          </DialogTitle>
          <DialogDescription className="text-xs font-bold opacity-50 leading-relaxed">
            Partiyalar o‘chiriladi, tovar ombordan yechiladi, to‘langan summa
            kassaga qaytariladi.
          </DialogDescription>
        </DialogHeader>

        {touchedBatch ? (
          // Списание уже было — предупреждаем до запроса, а не после 409
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs font-bold text-destructive leading-relaxed">
            <span className="font-mono">{touchedBatch.batchNumber}</span>{' '}
            partiyasidan{' '}
            {touchedBatch.quantity - touchedBatch.remainingQuantity} dona
            allaqachon yechilgan — bu xaridni bekor qilib bo‘lmaydi.
          </div>
        ) : (
          <div className="space-y-2 pt-2">
            <Label className="text-[10px] font-black uppercase opacity-40 ml-1">
              Sabab (ixtiyoriy)
            </Label>
            <Textarea
              placeholder="Nima uchun bekor qilinmoqda..."
              className="rounded-2xl bg-muted/40 border-none min-h-[90px] text-sm resize-none"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            variant="ghost"
            className="flex-1 h-13 rounded-2xl font-bold uppercase text-xs opacity-50"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Yopish
          </Button>
          <Button
            variant="destructive"
            className="flex-[2] h-13 rounded-2xl font-black uppercase text-xs"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !!touchedBatch}
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin size-4" />
            ) : (
              'Bekor qilish'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
