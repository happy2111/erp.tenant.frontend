'use client'

import { useQuery } from '@tanstack/react-query';
import { currencyService } from '@/services/currency.service';
import { KassasService } from '@/services/kassas.service';
import { usePosStore } from '@/store/use-pos-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Landmark, Globe, RotateCcw } from 'lucide-react';
import { CustomerSelector } from './CustomerSelector';
import { cn } from '@/lib/utils';

export function PosHeader() {
  const { currencyId, setCurrency, kassaId, setKassa, items } = usePosStore();

  const { data: currencies } = useQuery({
    queryKey: ['currencies'],
    queryFn: () => currencyService.findAll()
  });

  const { data: kassas } = useQuery({
    queryKey: ['kassas'],
    queryFn: () => KassasService.getAllAdmin({ limit: 100 }).then(r => r.items)
  });

  const handleCurrencyChange = (id: string) => {
    const selectedCurrency = currencies?.find(c => c.id === id);
    if (!selectedCurrency) return;

    if (items.length > 0) {
      const confirmReset = confirm("Valyutani o‘zgartirish savatni tozalaydi. Davom ettirasizmi?");
      if (!confirmReset) return;
      usePosStore.getState().reset();
    }

    usePosStore.getState().setCurrencyValues(selectedCurrency);
    setKassa(null);
  };


  const handleReset = () => {
    if (items.length === 0) return;

    const ok = confirm('Savatni tozalash va tanlangan ma’lumotlarni tiklash?');
    if (!ok) return;

    usePosStore.getState().reset();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-2xl border-b border-border/40">
      <div className="pb-2">
        <div
          className="flex items-center gap-2 overflow-x-auto no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* ВЫБОР КЛИЕНТА - Фиксируем ширину на мобилках, чтобы не прыгало */}
          <div className="shrink-0 w-[160px] sm:w-[220px]  ">
            <CustomerSelector />
          </div>

          {/* Небольшой визуальный разделитель */}
          <div className="h-6 w-px bg-border/40 shrink-0 mx-1" />

          <div className="flex items-center gap-2 flex-1 justify-end">
            {/* ВАЛЮТА */}
            <div className="flex items-center gap-1.5 bg-muted/30 p-1 pr-2 rounded-2xl border border-border/50 shrink-0">
              <div className="size-7 rounded-xl bg-background/50 flex items-center justify-center shadow-sm">
                <Globe className="size-3.5 opacity-50 text-primary" />
              </div>
              <Select value={currencyId || ''} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="h-7 w-auto min-w-[60px] border-none bg-transparent shadow-none focus:ring-0 p-0 pr-1 text-[11px] font-black uppercase">
                  <SelectValue placeholder="Valyuta" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/40 backdrop-blur-xl">
                  {currencies?.map(c => (
                    <SelectItem key={c.id} value={c.id} className="text-xs font-bold">{c.code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* КАССА */}
            <div className={cn(
              "flex items-center gap-1.5 bg-muted/30 p-1 pr-2 rounded-2xl border border-border/50 shrink-0 transition-opacity",
              !currencyId && "opacity-40 pointer-events-none"
            )}>
              <div className="size-7 rounded-xl bg-background/50 flex items-center justify-center shadow-sm">
                <Landmark className="size-3.5 opacity-50 text-primary" />
              </div>
              <Select value={kassaId || ''} onValueChange={setKassa}>
                <SelectTrigger className="h-7 w-auto min-w-[80px] lg:min-w-[120px] border-none bg-transparent shadow-none focus:ring-0 p-0 pr-1 text-[11px] font-black uppercase truncate">
                  <SelectValue placeholder="Kassa" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/40 backdrop-blur-xl">
                  {kassas?.filter(k => k.currencyId === currencyId).map(k => (
                    <SelectItem key={k.id} value={k.id} className="text-xs font-bold">
                      {k.name} ({k.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* СБРОС */}
            <div
              className={cn(
                "flex items-center gap-1.5 bg-muted/30 p-1 pr-2 rounded-2xl border border-border/50 shrink-0 cursor-pointer transition-all",
                items.length === 0 && "opacity-40 pointer-events-none",
                "hover:bg-muted/40 active:scale-[0.97]"
              )}
              onClick={handleReset}
            >
              <div className="size-7 min-h-7 rounded-xl bg-background/50 flex items-center justify-center shadow-sm">
                <RotateCcw className="size-3.5 opacity-50 text-primary" />
              </div>

              <span className="text-[11px] font-black uppercase pr-1">
                Tozalash
              </span>
            </div>
          </div>
        </div>

        {/* CSS для скрытия скроллбара */}
        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </header>
  );
}