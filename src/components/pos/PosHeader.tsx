'use client'

import { useQuery } from '@tanstack/react-query';
import { currencyService } from '@/services/currency.service';
import { KassasService } from '@/services/kassas.service';
import { usePosStore } from '@/store/use-pos-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {  Landmark, Globe } from 'lucide-react';
import { CustomerSelector } from './sections/CustomerSelector';
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
    if (items.length > 0) {
      const confirmReset = confirm("Смена валюты приведет к очистке корзины. Продолжить?");
      if (!confirmReset) return;
      usePosStore.getState().reset();
    }
    setCurrency(id);
    setKassa(null);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-2xl border-b border-border/40">
      <div className="pb-2">
        <div
          className="flex items-center gap-2 overflow-x-auto no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* ВЫБОР КЛИЕНТА - Фиксируем ширину на мобилках, чтобы не прыгало */}
          <div className="shrink-0 w-[160px] sm:w-[220px]">
            <CustomerSelector />
          </div>

          {/* Небольшой визуальный разделитель, который не ломает строку */}
          <div className="h-6 w-px bg-border/40 shrink-0 mx-1" />

         <div className="flex items-center gap-2 flex-1 justify-end">
           {/* ВАЛЮТА - Компактный вид */}
           <div className="flex items-center gap-1.5 bg-muted/30 p-1 pr-2 rounded-2xl border border-border/50 shrink-0">
             <div className="size-7 rounded-xl bg-background/50 flex items-center justify-center shadow-sm">
               <Globe className="size-3.5 opacity-50 text-primary" />
             </div>
             <Select value={currencyId || ''} onValueChange={handleCurrencyChange}>
               <SelectTrigger className="h-7 w-auto min-w-[60px] border-none bg-transparent shadow-none focus:ring-0 p-0 pr-1 text-[11px] font-black uppercase">
                 <SelectValue placeholder="Валюта" />
               </SelectTrigger>
               <SelectContent className="rounded-2xl border-border/40 backdrop-blur-xl">
                 {currencies?.map(c => (
                   <SelectItem key={c.id} value={c.id} className="text-xs font-bold">{c.code}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
         </div>

           {/* КАССА - Компактный вид */}
           <div className={cn(
             "flex items-center gap-1.5 bg-muted/30 p-1 pr-2 rounded-2xl border border-border/50 shrink-0 transition-opacity",
             !currencyId && "opacity-40 pointer-events-none"
           )}>
             <div className="size-7 rounded-xl bg-background/50 flex items-center justify-center shadow-sm">
               <Landmark className="size-3.5 opacity-50 text-primary" />
             </div>
             <Select value={kassaId || ''} onValueChange={setKassa}>
               <SelectTrigger className="h-7 w-auto min-w-[80px] lg:min-w-[120px] border-none bg-transparent shadow-none focus:ring-0 p-0 pr-1 text-[11px] font-black uppercase truncate">
                 <SelectValue placeholder="Касса" />
               </SelectTrigger>
               <SelectContent className="rounded-2xl border-border/40 backdrop-blur-xl">
                 {kassas?.filter(k => k.currencyId === currencyId).map(k => (
                   <SelectItem key={k.id} value={k.id} className="text-xs font-bold">
                     {k.name}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>

         </div>
        </div>


      {/* CSS для скрытия скроллбара (можно вынести в globals.css) */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </header>
  );
}