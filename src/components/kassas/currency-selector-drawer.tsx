"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { currencyService } from "@/services/currency.service";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {Check, Coins, Globe, Search} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  selectedId?: string;
  onSelect: (id: string, code: string) => void;
}

export function CurrencySelectorDrawer({ selectedId, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: currencies, isLoading } = useQuery({
    queryKey: ["currencies"],
    queryFn: () => currencyService.findAll(),
  });

  const filtered = currencies?.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full justify-between h-12 rounded-2xl">
          {selectedId ? (
            currencies?.find(c => c.id === selectedId)?.code || "Валюта выбрана"
          ) : (
            <span className="opacity-50">Выберите валюту</span>
          )}
          <Coins className="size-4 ml-2 opacity-50" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader>
          <DrawerTitle className="text-center font-black uppercase tracking-tighter">Валюта кассы</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 opacity-40" />
            <Input
              placeholder="Поиск валюты..."
              className="pl-10 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            {isLoading && <p className="text-center py-4 opacity-40">Загрузка валют...</p>}
            {filtered?.map((currency) => (
              <button
                key={currency.id}
                onClick={() => {
                  onSelect(currency.id, currency.code);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl transition-all border",
                  selectedId === currency.id
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-muted border-transparent"
                )}
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="size-10 bg-background rounded-full flex items-center justify-center font-bold text-xs border">
                    {currency.symbol}
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-none">{currency.code}</p>
                    <p className="text-[10px] opacity-50 uppercase font-bold">{currency.name}</p>
                  </div>
                </div>
                {selectedId === currency.id && <Check className="size-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}