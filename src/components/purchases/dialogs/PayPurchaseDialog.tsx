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
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2,
  Wallet,
  AlertTriangle,
  Landmark,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  /** Диалог монтируется на конкретную закупку (key на месте вызова) */
  purchase: Purchase;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Оплата проведённой закупки из кассы. Черновик оплатить нельзя — сначала
 * проведение. Полная оплата переводит документ в PAID, частичная — в PARTIAL.
 */
export function PayPurchaseDialog({ purchase, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();

  const remaining = purchase.totalAmount - purchase.paidAmount;

  const [kassaId, setKassaId] = useState<string | undefined>(
    purchase.kassaId || undefined
  );
  const [amount, setAmount] = useState(String(remaining));
  const [note, setNote] = useState('');

  const { data: kassas } = useQuery({
    queryKey: ['kassas', purchase.currencyId],
    queryFn: () => KassasService.getAllAdmin({ limit: 100 }).then((r) => r.items),
    enabled: open,
  });

  // Платить можно только из кассы в валюте документа — бэкенд это проверяет
  const suitableKassas =
    kassas?.filter((k) => k.currencyId === purchase.currencyId) ?? [];
  const selectedKassa = suitableKassas.find((k) => k.id === kassaId);

  const parsedAmount = Number(amount);
  const amountValid =
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    parsedAmount <= remaining;
  const notEnoughMoney =
    !!selectedKassa && amountValid && parsedAmount > Number(selectedKassa.balance);

  const mutation = useMutation({
    mutationFn: () =>
      PurchasesService.pay(purchase.id, {
        kassaId: kassaId!,
        amount: parsedAmount,
        note: note || undefined,
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['purchase', purchase.id] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['kassas'] });
      toast.success(
        updated.status === 'PAID'
          ? 'Xarid to‘liq to‘landi'
          : 'Qisman to‘lov qabul qilindi'
      );
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const message = (
        err as { response?: { data?: { message?: string | { message?: string } } } }
      )?.response?.data?.message;
      toast.error(
        (typeof message === 'string' ? message : message?.message) ||
        'To‘lovda xatolik'
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] rounded-[2.5rem] p-8">
        <DialogHeader>
          <div className="size-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
            <Wallet className="size-7 text-emerald-600" />
          </div>
          <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
            Xaridni to‘lash
          </DialogTitle>
          <DialogDescription className="text-xs font-bold opacity-50">
            #{purchase.invoiceNumber || 'B/R'} — qarz{' '}
            {remaining.toLocaleString()} {purchase.currency?.symbol}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase opacity-40 ml-1 flex items-center gap-2">
              <Landmark size={13} /> Kassa
            </Label>
            <Select value={kassaId} onValueChange={setKassaId}>
              <SelectTrigger className="h-12 w-full rounded-2xl bg-muted/40 border-none font-bold">
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

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <Label className="text-[10px] font-black uppercase opacity-40">
                Summa
              </Label>
              <button
                type="button"
                onClick={() => setAmount(String(remaining))}
                className="text-[10px] font-black uppercase text-primary opacity-70 hover:opacity-100 transition-opacity"
              >
                Butun qarz
              </button>
            </div>
            <div className="relative">
              <Input
                type="number"
                inputMode="decimal"
                className={cn(
                  'h-14 rounded-2xl bg-muted/40 border-2 font-black text-xl pr-16',
                  amountValid ? 'border-transparent' : 'border-destructive/40'
                )}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold opacity-40">
                {purchase.currency?.symbol}
              </span>
            </div>
            {!amountValid && amount !== '' && (
              <p className="text-[10px] font-bold text-destructive">
                Summa 0 dan katta va qarzdan ({remaining.toLocaleString()}) kichik
                bo‘lishi kerak
              </p>
            )}
            {/* Баланс кассы бэкенд при оплате не проверяет — предупреждаем сами */}
            {notEnoughMoney && (
              <p className="text-[10px] font-bold text-orange-600 flex items-center gap-1.5">
                <AlertTriangle className="size-3" />
                Kassada yetarli mablag‘ yo‘q — balans minusga tushadi
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase opacity-40 ml-1">
              Izoh (ixtiyoriy)
            </Label>
            <Textarea
              placeholder="To‘lov haqida..."
              className="rounded-2xl bg-muted/40 border-none min-h-[70px] text-sm resize-none"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
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
              className="flex-[2] h-13 rounded-2xl font-black uppercase text-xs bg-emerald-600 hover:bg-emerald-700"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !kassaId || !amountValid}
            >
              {mutation.isPending ? (
                <Loader2 className="animate-spin size-4" />
              ) : (
                'To‘lash'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
