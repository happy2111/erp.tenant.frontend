'use client';

import { useQuery } from '@tanstack/react-query';
import { currencyService } from '@/services/currency.service';
import { usePurchaseStore } from '@/store/use-purchase-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { Currency } from "@/schemas/currency.schema";

export function CurrencySelector() {
  const { currencyId, setCurrency, setCurrencyData } = usePurchaseStore();

  const { data: currencies } = useQuery({
    queryKey: ['currencies'],
    queryFn: () => currencyService.findAll(),
  });

  // Эта переменная нужна только для отображения текущего выбора в UI
  const selected = currencies?.find(c => c.id === currencyId);

  const handleValueChange = (id: string) => {
    // Находим нужный объект прямо из массива данных запроса по новому ID
    const newCurrency = currencies?.find(c => c.id === id);

    if (newCurrency) {
      setCurrency(id);
      setCurrencyData(newCurrency); // Теперь передаем актуальный объект
    }
  };

  return (
    <div className="flex   dark:bg-input/20 items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-border/50 min-w-[100px]">
      <Globe className="size-4 opacity-60" />

      <Select
        value={currencyId || undefined}
        onValueChange={handleValueChange}
      >
        <SelectTrigger className="border-none shadow-none focus:ring-0 p-0 h-auto text-sm font-bold bg-transparent!">
          <SelectValue placeholder="Валюта">
            {selected ? (
              <span className="flex items-center gap-1.5  ">
                {selected.code}
                <span className="text-xs opacity-70">{selected.symbol}</span>
              </span>
            ) : (
              'Валюта'
            )}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {currencies?.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              <span className="flex items-center gap-2">
                <span className="font-medium">{c.code}</span>
                <span className="text-xs text-muted-foreground">{c.symbol}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}