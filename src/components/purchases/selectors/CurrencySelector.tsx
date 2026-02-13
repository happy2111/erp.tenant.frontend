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

export function CurrencySelector() {
  const { currencyId, setCurrency } = usePurchaseStore();

  const { data: currencies } = useQuery({
    queryKey: ['currencies'],
    queryFn: () => currencyService.findAll(),
  });

  const selected = currencies?.find(c => c.id === currencyId);

  return (
    <div className="flex items-center gap-1.5 bg-muted/30 px-3 py-1.5 rounded-2xl border border-border/50 min-w-[100px]">
      <Globe className="size-4 opacity-60" />

      <Select
        value={currencyId || undefined}
        onValueChange={setCurrency}
      >
        <SelectTrigger className="border-none bg-transparent shadow-none focus:ring-0 p-0 h-auto text-sm font-bold">
          <SelectValue placeholder="Валюта">
            {selected ? (
              <span className="flex items-center gap-1.5">
                {selected.code}
                <span className="text-xs opacity-70">{selected.symbol}</span>
              </span>
            ) : (
              'Валюта'
            )}
          </SelectValue>
        </SelectTrigger>

        <SelectContent className="rounded-xl">
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