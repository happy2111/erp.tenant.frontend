'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PurchasesService } from '@/services/purchases.service';
import { KassasService } from '@/services/kassas.service';
import { Purchase } from '@/schemas/purchases.schema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PackageCheck, AlertTriangle, Landmark } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  purchase: Purchase;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Проведение закупки. Здесь решаются две вещи, которые уже нельзя будет
 * переиграть: из какой кассы платим и по какому курсу пересчитываем
 * себестоимость в базовую валюту.
 */
export function ConfirmPurchaseDialog({ purchase, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();

  const [payNow, setPayNow] = useState(false);
  const [kassaId, setKassaId] = useState<string | undefined>(
    purchase.kassaId || undefined
  );
  const [rate, setRate] = useState('');

  const { data: kassas } = useQuery({
    queryKey: ['kassas', purchase.currencyId],
    queryFn: () => KassasService.getAllAdmin({ limit: 100 }).then((r) => r.items),
    enabled: open,
  });

  // Платить можно только из кассы в валюте документа
  const suitableKassas =
    kassas?.filter((k) => k.currencyId === purchase.currencyId) ?? [];

  const mutation = useMutation({
    mutationFn: () =>
      PurchasesService.confirmPurchase(purchase.id, {
        kassaId: payNow ? kassaId : undefined,
        exchangeRate: rate ? Number(rate) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase', purchase.id] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['product-batches'] });
      queryClient.invalidateQueries({ queryKey: ['variant-cost'] });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      toast.success(
        payNow
          ? 'Xarid o‘tkazildi va to‘landi'
          : 'Tovar omborga qabul qilindi'
      );
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const message = (
        err as { response?: { data?: { message?: string | { message?: string } } } }
      )?.response?.data?.message;
      toast.error(
        (typeof message === 'string' ? message : message?.message) ||
        'O‘tkazishda xatolik'
      );
    },
  });

  const totalItems = purchase.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-8">
        <DialogHeader>
          <div className="size-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-3">
            <PackageCheck className="size-7 text-violet-600" />
          </div>
          <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
            Xaridni o‘tkazish
          </DialogTitle>
          <DialogDescription className="text-xs font-bold opacity-50">
            {purchase.items.length} pozitsiya / {totalItems} dona omborga
            kiritiladi va har biriga tannarxli partiya ochiladi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Оплатить сейчас или принять товар в долг */}
          <div className="flex p-1 bg-muted/40 rounded-2xl border border-border/40">
            {([
              { key: false, label: 'To‘lovsiz qabul' },
              { key: true, label: 'Qabul + to‘lov' },
            ] as const).map((mode) => (
              <button
                key={String(mode.key)}
                onClick={() => setPayNow(mode.key)}
                className={cn(
                  'flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all',
                  payNow === mode.key
                    ? 'bg-background shadow-sm text-primary'
                    : 'opacity-40'
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {payNow && (
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40 ml-1 flex items-center gap-2">
                <Landmark size={13} /> Kassa
              </Label>
              <Select value={kassaId} onValueChange={setKassaId}>
                <SelectTrigger className="h-12 rounded-2xl bg-muted/40 border-none font-bold w-full">
                  <SelectValue placeholder="Kassani tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {suitableKassas.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.name} — {Number(k.balance).toLocaleString()}{' '}
                      {purchase.currency?.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {suitableKassas.length === 0 && (
                <p className="text-[10px] font-bold text-destructive flex items-center gap-1.5">
                  <AlertTriangle className="size-3" />
                  {purchase.currency?.code} valyutasida kassa yo‘q
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase opacity-40 ml-1">
              Kurs (ixtiyoriy)
            </Label>
            <Input
              type="number"
              inputMode="decimal"
              placeholder="Hujjat sanasidagi kurs olinadi"
              className="h-12 rounded-2xl bg-muted/40 border-none font-bold"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
            <p className="text-[10px] font-bold opacity-40 leading-relaxed">
              Kurs hujjatga yoziladi va tannarx shu kurs bo‘yicha muzlatiladi.
              Keyin kurs o‘zgarsa ham bu partiyaning tannarxi o‘zgarmaydi.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              className="flex-1 h-13 rounded-2xl font-bold uppercase text-xs opacity-50"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Bekor qilish
            </Button>
            <Button
              className="flex-[2] h-13 rounded-2xl font-black uppercase text-xs bg-violet-600 hover:bg-violet-700"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || (payNow && !kassaId)}
            >
              {mutation.isPending ? (
                <Loader2 className="animate-spin size-4" />
              ) : (
                'O‘tkazish'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
