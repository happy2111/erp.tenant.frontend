'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PurchasesService } from '@/services/purchases.service';
import { KassasService } from '@/services/kassas.service';
import { OrganizationCustomerService } from '@/services/org.customer.service';
import { CustomerTypeValues } from '@/schemas/org-customer.schema';
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
import { Loader2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  /**
   * Диалог монтируется на конкретную закупку (см. key на месте вызова),
   * поэтому поля инициализируются один раз из пропа — без синхронизации
   * через useEffect.
   */
  purchase: Purchase;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Правка шапки черновика: поставщик, касса, дата, примечание.
 * Позиции и суммы через этот эндпоинт не меняются, статус — только
 * через confirm / pay / cancel.
 */
export function PurchaseEditDialog({ purchase, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();

  const [supplierId, setSupplierId] = useState<string | undefined>(
    purchase.supplierId
  );
  const [kassaId, setKassaId] = useState<string | undefined>(
    purchase.kassaId || undefined
  );
  // datetime-local ждёт значение без зоны — обрезаем ISO до минут
  const [purchaseDate, setPurchaseDate] = useState(() =>
    new Date(purchase.purchaseDate).toISOString().slice(0, 16)
  );
  const [notes, setNotes] = useState(purchase.notes || '');

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers', 'all'],
    queryFn: () =>
      OrganizationCustomerService.getAllAdmin({
        type: CustomerTypeValues[1],
        limit: 100,
      }),
    enabled: open,
  });

  const { data: kassas } = useQuery({
    queryKey: ['kassas', purchase.currencyId],
    queryFn: () => KassasService.getAllAdmin({ limit: 100 }).then((r) => r.items),
    enabled: open,
  });

  const suitableKassas =
    kassas?.filter((k) => k.currencyId === purchase.currencyId) ?? [];

  const mutation = useMutation({
    mutationFn: () =>
      PurchasesService.update(purchase.id, {
        supplierId,
        kassaId: kassaId ?? null,
        purchaseDate: purchaseDate
          ? new Date(purchaseDate).toISOString()
          : undefined,
        notes: notes || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchase', purchase.id] });
      toast.success('Xarid yangilandi');
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const message = (
        err as { response?: { data?: { message?: string | { message?: string } } } }
      )?.response?.data?.message;
      toast.error(
        (typeof message === 'string' ? message : message?.message) ||
        'Yangilashda xatolik'
      );
    },
  });

  const isDraft = purchase.status === 'DRAFT';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-8">
        <DialogHeader>
          <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
            <Pencil className="size-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
            Xaridni tahrirlash
          </DialogTitle>
          <DialogDescription className="text-xs font-bold opacity-50">
            #{purchase.invoiceNumber || 'B/R'} — faqat hujjat sarlavhasi
            o‘zgaradi, pozitsiyalar emas.
          </DialogDescription>
        </DialogHeader>

        {!isDraft ? (
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs font-bold text-destructive leading-relaxed">
            O‘tkazilgan hujjatni tahrirlab bo‘lmaydi. Avval bekor qiling.
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40 ml-1">
                Yetkazib beruvchi
              </Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger className="h-12 w-full rounded-2xl bg-muted/40 border-none font-bold">
                  <SelectValue placeholder="Tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers?.items?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40 ml-1">
                Kassa
              </Label>
              <Select value={kassaId} onValueChange={setKassaId}>
                <SelectTrigger className="h-12 w-full rounded-2xl bg-muted/40 border-none font-bold">
                  <SelectValue placeholder="Ko‘rsatilmagan" />
                </SelectTrigger>
                <SelectContent>
                  {suitableKassas.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40 ml-1">
                Hujjat sanasi
              </Label>
              <Input
                type="datetime-local"
                className="h-12 rounded-2xl bg-muted/40 border-none font-bold"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
              <p className="text-[10px] font-bold opacity-40 ml-1">
                Shu sanadagi kurs olinadi va partiyalar shu sana bo‘yicha
                FIFO’da saflanadi
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40 ml-1">
                Izoh
              </Label>
              <Textarea
                className="rounded-2xl bg-muted/40 border-none min-h-[80px] text-sm resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
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
            className="flex-[2] h-13 rounded-2xl font-black uppercase text-xs"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !isDraft}
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin size-4" />
            ) : (
              'Saqlash'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
