import { useQuery } from "@tanstack/react-query";
import { currencyService } from "@/services/currency.service";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Coins, Loader2 } from "lucide-react";
import { Currency } from "@/schemas/currency.schema";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (currency: Currency) => void;
}

export function CurrencySelectDrawer({ open, onOpenChange, onSelect }: Props) {
  const { data: currencies, isLoading } = useQuery({
    queryKey: ["currencies-all"],
    queryFn: () => currencyService.findAll(),
    enabled: open,
  });

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[70vh] bg-background/80 backdrop-blur-2xl border-t border-border/50">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-black tracking-tighter italic uppercase text-center">Valyuta tanlash</DrawerTitle>
          </DrawerHeader>

          <ScrollArea className="px-4 h-[300px]">
            <div className="space-y-2 pb-6">
              {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin size-8 text-primary" /></div>
              ) : (
                currencies?.map((cur) => (
                  <button
                    key={cur.id}
                    onClick={() => onSelect(cur)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-card/40 border border-border/40 hover:bg-primary/5 hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-xs">
                        {cur.symbol || cur.code[0]}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm">{cur.name}</p>
                        <p className="text-[10px] font-mono opacity-50 uppercase">{cur.code}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>

          <DrawerFooter className="pb-8">
            <Button variant="ghost" onClick={() => {
              // Логика сброса валюты (так как она опциональна)
              // @ts-ignore
              onSelect({ id: null, code: "Tanlanmagan" });
            }} className="text-[10px] font-bold uppercase opacity-50">Tanlovni bekor qilish</Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}