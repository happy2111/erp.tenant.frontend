
"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ProductInstancesService } from "@/services/product-instances.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Cpu,
  Plus,
  ChevronRight,
  User,
  Loader2,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusMap = {
  IN_STOCK: { label: "Omborda", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  SOLD: { label: "Sotilgan", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  RETURNED: { label: "Qaytarilgan", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  LOST: { label: "Yo'qolgan", color: "bg-destructive/10 text-destructive border-destructive/20" },
};

export function ProductVariantInstances({ variantId }: { variantId: string }) {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["product-instances", variantId],
    queryFn: () => ProductInstancesService.findAll({ productVariantId: variantId, limit: 50 }),
  });

  return (
    <Card className="bg-card/30 backdrop-blur-xl border-border/60 shadow-2xl rounded-[2.5rem] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/10 bg-muted/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-background border border-border/40">
            <Cpu className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] opacity-60">
              Nusxalar
            </CardTitle>
            <p className="text-[10px] text-muted-foreground font-bold uppercase opacity-40">
              Jami: {data?.total || 0} dona
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => router.push(`/product-instances/create?variantId=${variantId}`)}
          className="rounded-xl hover:bg-primary/10 text-primary h-8 px-3 font-bold text-[10px] uppercase"
        >
          <Plus className="size-4 mr-1" /> Qo&apos;shish
        </Button>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-10 opacity-20"><Loader2 className="animate-spin size-6" /></div>
          ) : data?.data?.length ? (
            data.data.map((instance) => (
              <div
                key={instance.id}
                className="group flex items-center justify-between p-4 rounded-2xl bg-background/40 border border-border/40 hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full">
                  {/* Иконка ID - фиксированный размер, чтобы не сжималась */}
                  <div className="shrink-0 size-9 sm:size-10 rounded-xl bg-muted/50 flex items-center justify-center font-mono text-[9px] sm:text-[10px] font-bold border border-border/50">
                    ID
                  </div>

                  {/* Основной контейнер с min-w-0, чтобы работал truncate внутри */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="font-mono text-sm font-bold tracking-tighter truncate max-w-[120px] xs:max-w-[180px] sm:max-w-none">
                        {instance.serialNumber}
                      </p>

                      {/* Бейдж статуса */}
                      <Badge
                        className={cn(
                          "text-[8px] px-1.5 py-0 uppercase font-black border whitespace-nowrap",
                          statusMap[instance.currentStatus].color
                        )}
                      >
                        {statusMap[instance.currentStatus].label}
                      </Badge>
                    </div>

                    {instance.current_owner && (
                      <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                        <User className="size-3 shrink-0" />
                        <span className="text-[10px] font-medium truncate">
                          {instance.current_owner.firstName} {instance.current_owner.lastName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => router.push(`/product-instances/${instance.id}`)}
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors"
                  >
                    <ChevronRight className="size-4 text-primary" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-border/20 rounded-[2rem]">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-20 italic">
                Hozircha nusxalar mavjud emas
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}