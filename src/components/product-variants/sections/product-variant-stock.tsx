"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StocksService } from "@/services/stocks.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Warehouse,
  History,
  Plus,
  Minus,
  Loader2,
  AlertTriangle,
  ArrowRightLeft
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ProductVariantStock({ variantId }: { variantId: string }) {
  const queryClient = useQueryClient();

  const { data: stock, isLoading } = useQuery({
    queryKey: ["stock", variantId],
    queryFn: () => StocksService.getStockByVariant(variantId),
  });

  // Мутация для быстрой корректировки (например, инвентаризация)
  const adjustMutation = useMutation({
    mutationFn: (delta: number) =>
      StocksService.adjustStock({
        productVariantId: variantId,
        quantityDelta: delta,
        reason: "Ручная корректировка из панели управления"
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock", variantId] });
      toast.success("Zaxira yangilandi");
    },
    onError: () => toast.error("Xatolik yuz berdi")
  });

  if (isLoading) return (
    <div className="h-32 flex items-center justify-center bg-muted/10 rounded-[2rem] border border-dashed">
      <Loader2 className="animate-spin text-primary/40" />
    </div>
  );

  const quantity = stock?.quantity || 0;
  const isLowStock = quantity > 0 && quantity < 5;
  const isOutOfStock = quantity <= 0;

  return (
    <Card className="p-0 bg-card/40 backdrop-blur-xl border-border/50 rounded-[2.5rem] overflow-hidden shadow-xl">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-12">

          {/* Левая часть: Большая цифра */}
          <div className={cn(
            "md:col-span-5 p-8 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-border/10",
            isOutOfStock ? "bg-destructive/5" : isLowStock ? "bg-amber-500/5" : "bg-primary/5"
          )}>
            <div className="p-3 rounded-2xl bg-background border border-border/50 mb-4 shadow-sm">
              <Warehouse className={cn(
                "size-6",
                isOutOfStock ? "text-destructive" : isLowStock ? "text-amber-500" : "text-primary"
              )} />
            </div>
            <div className="space-y-1">
              <span className="text-5xl font-black italic tracking-tighter">
                {quantity}
              </span>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                Ombordagi qoldiq
              </p>
            </div>
          </div>

          {/* Правая часть: Статус и управление */}
          <div className="md:col-span-7 p-8 flex flex-col justify-between space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm uppercase tracking-tight">Holat:</h3>
                  {isOutOfStock ? (
                    <span className="text-destructive text-[10px] font-black uppercase flex items-center gap-1">
                      <AlertTriangle className="size-3" /> Mavjud emas
                    </span>
                  ) : (
                    <span className="text-emerald-500 text-[10px] font-black uppercase">Sotuvda mavjud</span>
                  )}
                </div>
                {stock?.updatedAt && (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-medium">
                    <History className="size-3" />
                    Oxirgi yangilanish: {format(new Date(stock.updatedAt), 'dd.MM.yyyy, HH:mm')}
                  </p>
                )}
              </div>

              <Button variant="ghost" size="icon" className="rounded-xl opacity-20 hover:opacity-100">
                <ArrowRightLeft className="size-4" />
              </Button>
            </div>

            {/* Быстрые действия */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustMutation.mutate(-1)}
                disabled={adjustMutation.isPending || isOutOfStock}
                className="flex-1 h-12 rounded-2xl border-border/50 hover:bg-destructive/5 hover:text-destructive font-bold transition-all"
              >
                <Minus className="size-4 mr-2" /> 1
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustMutation.mutate(1)}
                disabled={adjustMutation.isPending}
                className="flex-1 h-12 rounded-2xl border-border/50 hover:bg-primary/5 hover:text-primary font-bold transition-all"
              >
                1 <Plus className="size-4 mr-2" />
              </Button>
              {/*<Button*/}
              {/*  className="flex-[1.5] h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] italic shadow-lg shadow-primary/20"*/}
              {/*>*/}
              {/*  Tuzatish*/}
              {/*</Button>*/}
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}