'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateKassaTransferSchema, CreateKassaTransferDto } from '@/schemas/kassa-transfers.schema';
import { KassasService } from '@/services/kassas.service';
import { KassaTransfersService } from '@/services/kassa-transfers.service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowRightLeft, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Проверка одинаковых касс
const extendedSchema = CreateKassaTransferSchema.refine(
  (data) => data.fromKassaId !== data.toKassaId,
  {
    message: "Qabul qiluvchi kassa yuboruvchi kassaga teng bo‘la olmaydi",
    path: ["toKassaId"],
  }
);

export function CreateKassaTransferForm({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const { data: kassasData } = useQuery({
    queryKey: ['kassas-list'],
    queryFn: () => KassasService.getAllAdmin({ limit: 100 })
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CreateKassaTransferDto>({
    resolver: zodResolver(extendedSchema),
    defaultValues: {
      rate: '1',
      amount: '',
    }
  });

  const fromKassaId = watch('fromKassaId');
  const toKassaId = watch('toKassaId');
  const amount = watch('amount');
  const rate = watch('rate');

  const selectedFromKassa = kassasData?.items.find(k => k.id === fromKassaId);
  const selectedToKassa = kassasData?.items.find(k => k.id === toKassaId);

  const mutation = useMutation({
    mutationFn: KassaTransfersService.create,
    onSuccess: () => {
      toast.success('O‘tkazish muvaffaqiyatli bajarildi');
      queryClient.invalidateQueries({ queryKey: ['kassa-history'] });
      queryClient.invalidateQueries({ queryKey: ['kassa'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'O‘tkazishda xatolik');
    }
  });

  const onSubmit = (data: CreateKassaTransferDto) => {
    mutation.mutate(data);
  };

  const convertedAmount = (Number(amount || 0) * Number(rate || 1)).toLocaleString();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* ОТКУДА И КУДА */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        {/* Qayerdan */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase opacity-40 ml-1 tracking-widest">Qayerdan (Chegirma)</Label>
          <Select onValueChange={(val) => setValue('fromKassaId', val)}>
            <SelectTrigger className="h-14 rounded-3xl bg-muted/40 border-none px-6 font-bold">
              <SelectValue placeholder="Kassani tanlang" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl bg-background/80">
              {kassasData?.items.map(k => (
                <SelectItem key={k.id} value={k.id} className="rounded-xl">
                  <div className="flex flex-col">
                    <span className="font-bold">{k.name}</span>
                    <span className="text-[10px] opacity-50">{k.balance.toLocaleString()} {k.currency?.code}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.fromKassaId && <p className="text-[10px] text-destructive font-bold ml-2">{errors.fromKassaId.message}</p>}
        </div>

        {/* Стрелка */}
        <div className="hidden md:flex absolute left-1/2 top-[55px] -translate-x-1/2 -translate-y-1/2 size-10 rounded-full bg-primary text-white items-center justify-center shadow-lg z-10 border-4 border-background">
          <ArrowRightLeft className="size-4" />
        </div>

        {/* Qayerga */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase opacity-40 ml-1 tracking-widest">Qayerga (Qabul)</Label>
          <Select onValueChange={(val) => setValue('toKassaId', val)}>
            <SelectTrigger className="h-14 rounded-3xl bg-muted/40 border-none px-6 font-bold">
              <SelectValue placeholder="Kassani tanlang" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl  bg-background/80">
              {kassasData?.items
                .filter(k => k.id !== fromKassaId)
                .map(k => (
                  <SelectItem key={k.id} value={k.id} className="rounded-xl">
                    <div className="flex flex-col">
                      <span className="font-bold">{k.name}</span>
                      <span className="text-[10px] opacity-50">{k.currency?.code}</span>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors.toKassaId && <p className="text-[10px] text-destructive font-bold ml-2">{errors.toKassaId.message}</p>}
        </div>
      </div>

      {/* SUMMA И KURS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Summa */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase opacity-40 ml-1 tracking-widest">O‘tkazish summasi</Label>
          <div className="relative">
            <Input
              {...register('amount')}
              placeholder="0.00"
              className="h-14 rounded-3xl bg-muted/40 border-none px-6 font-black text-xl"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black opacity-30">
              {selectedFromKassa?.currency?.code}
            </div>
          </div>
        </div>

        {/* Kurs */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase opacity-40 ml-1 tracking-widest">Ayirboshlash kursi</Label>
          <div className="relative flex items-center">
            <span className="font-black mr-2 whitespace-nowrap">1 {selectedFromKassa?.currency?.symbol} =</span>
            <Input
              {...register('rate')}
              placeholder="1.00"
              className="h-14 rounded-3xl bg-muted/40 border-none px-6 font-black text-xl"
            />
            <Info
              className="absolute right-4 top-1/2 -translate-y-1/2 size-4 opacity-20 cursor-pointer"
              onClick={() =>
                toast.info(
                  `Valyuta kursi — bu qabul qiluvchi kassaga yuborilayotgan kassaning 1 ${selectedFromKassa?.currency?.code} birligi uchun qancha birlik tushishini ko‘rsatadi.\nMasalan: 1 USD → 12000 UZS, shunda 12000 ni kiriting.`
                )
              }
            />
          </div>
        </div>

      </div>

      {/* Konvertatsiya paneli */}
      {(selectedFromKassa && selectedToKassa) && (
        <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex flex-col items-center justify-center space-y-2">
          <span className="text-[10px] font-black uppercase opacity-40 tracking-[0.2em]">Qabul qilinadi</span>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-primary italic tracking-tighter">{convertedAmount}</span>
            <span className="text-sm font-bold opacity-60 uppercase">{selectedToKassa.currency?.code}</span>
          </div>
        </div>
      )}

      {/* Izoh */}
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase opacity-40 ml-1 tracking-widest">Izoh</Label>
        <Input
          {...register('description')}
          placeholder="Masalan: Aylanma mablag‘larni to‘ldirish"
          className="h-14 rounded-3xl bg-muted/40 border-none px-6 font-medium"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-16 rounded-[2rem] text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95"
      >
        {isSubmitting ? <Loader2 className="animate-spin" /> : 'O‘tkazishni tasdiqlash'}
      </Button>
    </form>
  );
}
