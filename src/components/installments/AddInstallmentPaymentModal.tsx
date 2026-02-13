'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { InstallmentsService } from '@/services/installments.service';
import { KassasService } from '@/services/kassas.service'; // Импортируем сервис касс
import { CreateInstallmentPaymentSchema, CreateInstallmentPaymentDto } from '@/schemas/installments.schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Wallet, Landmark, CreditCard, Banknote } from 'lucide-react';

export function AddInstallmentPaymentModal({
                                             isOpen,
                                             onClose,
                                             installmentId,
                                             remainingAmount,
                                             monthlyPayment
                                           }: {
  isOpen: boolean;
  onClose: () => void;
  installmentId: string;
  remainingAmount: number;
  monthlyPayment: number;
}) {
  const queryClient = useQueryClient();

  // 1. Получаем список касс
  const { data: kassasData, isLoading: isLoadingKassas } = useQuery({
    queryKey: ['kassas', 'admin-all'],
    queryFn: () => KassasService.getAllAdmin({ limit: 100 }),
    enabled: isOpen, // Загружаем только когда модалка открыта
  });

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm<CreateInstallmentPaymentDto>({
    resolver: zodResolver(CreateInstallmentPaymentSchema),
    defaultValues: {
      installmentId,
      amount: monthlyPayment,
      paymentMethod: 'cash',
      kassaId: '',
    }
  });

  // Следим за выбранной кассой для отображения в UI если нужно
  const currentKassaId = watch('kassaId');

  const mutation = useMutation({
    mutationFn: (dto: CreateInstallmentPaymentDto) => InstallmentsService.addPayment(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installment', installmentId] });
      toast.success('Платеж успешно проведен');
      reset();
      onClose();
    },
    onError: (error: any) => {
      const serverMessage = error?.response?.data?.message;

      const text =
        typeof serverMessage === 'string'
          ? serverMessage
          : serverMessage?.message;

      toast.error(text || 'Ошибка при проведении платежа');
    }

  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] bg-card/95 backdrop-blur-2xl border-border/50 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
            <Banknote className="size-6 text-primary" />
            Приём оплаты
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5 pt-2">

          {/* ВЫБОР КАССЫ */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase opacity-40 ml-1">Зачислить на кассу</Label>
            <Select
              onValueChange={(val) => setValue('kassaId', val)}
              value={currentKassaId}
            >
              <SelectTrigger className="h-14 rounded-2xl bg-muted/50 border-none font-bold focus:ring-primary/20 transition-all">
                <SelectValue placeholder={isLoadingKassas ? "Загрузка касс..." : "Выберите кассу"} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/50 bg-card/95 backdrop-blur-xl">
                {kassasData?.items.map((kassa) => (
                  <SelectItem key={kassa.id} value={kassa.id} className="rounded-xl py-3 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {kassa.type === 'наличные' ? <Wallet size={16} /> : <Landmark size={16} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm leading-none">{kassa.name}</span>
                        <span className="text-[10px] opacity-50 font-medium">
                          Баланс: {kassa.balance.toLocaleString()} {kassa.currency?.symbol}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.kassaId && <p className="text-destructive text-[10px] font-bold ml-1">{errors.kassaId.message}</p>}
          </div>

          <div className="space-y-4">
            {/* СУММА */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40 ml-1">Сумма платежа</Label>
              <div className="relative group">
                <Input
                  {...register('amount', { valueAsNumber: true })}
                  type="number"
                  className="h-14 rounded-2xl bg-muted/50 border-none font-black text-xl focus-visible:ring-primary/20 transition-all group-hover:bg-muted/80"
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setValue('amount', remainingAmount)}
                  className="absolute right-2 top-2 h-10 rounded-xl text-[10px] font-black uppercase bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  Весь остаток
                </Button>
              </div>
              {errors.amount && <p className="text-destructive text-[10px] font-bold ml-1">{errors.amount.message}</p>}
            </div>

            {/* МЕТОД ОПЛАТЫ */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40 ml-1">Метод оплаты</Label>
              <Select defaultValue="cash" onValueChange={(val) => setValue('paymentMethod', val)}>
                <SelectTrigger className="h-14 rounded-2xl bg-muted/50 border-none font-bold">
                  <SelectValue placeholder="Выберите метод" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/50 bg-card/95 backdrop-blur-xl">
                  <SelectItem value="cash" className="rounded-xl">💵 Наличные</SelectItem>
                  <SelectItem value="click" className="rounded-xl">📱 Click / Payme</SelectItem>
                  <SelectItem value="transfer" className="rounded-xl">🏦 Перечисление</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ЗАМЕТКА */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40 ml-1">Заметка (необязательно)</Label>
              <Input
                {...register('note')}
                placeholder="Комментарий к платежу..."
                className="h-14 rounded-2xl bg-muted/50 border-none italic font-medium"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !currentKassaId}
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 bg-primary hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              {isSubmitting ? 'Выполнение...' : 'Подтвердить зачисление'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}