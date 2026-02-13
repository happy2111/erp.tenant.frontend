'use client';

import { useQuery } from '@tanstack/react-query';
import { KassasService } from '@/services/kassas.service';
import { usePurchaseStore } from '@/store/use-purchase-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  disabled?: boolean;
}

export function KassaSelector({ disabled = false }: Props) {
  const { currencyId, kassaId, setKassa } = usePurchaseStore();

  const { data: kassas } = useQuery({
    queryKey: ['kassas', currencyId],
    queryFn: () =>
      KassasService.getAllAdmin({ limit: 100 }).then((r) => r.items),
    enabled: !!currencyId,
  });

  const filteredKassas = kassas?.filter((k) => k.currencyId === currencyId) || [];

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 bg-muted/30 px-3 py-1.5 rounded-2xl border border-border/50',
        disabled && 'opacity-50 pointer-events-none'
      )}
    >
      <Landmark className="size-4 opacity-60" />
      <Select
        value={kassaId || undefined}
        onValueChange={setKassa}
        disabled={disabled || !currencyId}
      >
        <SelectTrigger className="w-[140px] border-none bg-transparent shadow-none focus:ring-0 p-0 h-auto text-sm font-medium truncate">
          <SelectValue placeholder="Касса расхода" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {filteredKassas.map((k) => (
            <SelectItem key={k.id} value={k.id}>
              {k.name} ({k.type})
            </SelectItem>
          ))}
          {filteredKassas.length === 0 && currencyId && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              Нет касс в этой валюте
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}