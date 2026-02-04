"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductBatchesService } from "@/services/product-batches.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Boxes,
  Plus,
  AlertCircle,
  Loader2,
  TrendingUp,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {useState} from "react";
import { CreateBatchDrawer } from "@/components/product-batches/drawers/create-batch-drawer";
import {ProductBatch} from "@/schemas/product-batches.schema";
import {
  EditBatchDrawer
} from "@/components/product-batches/drawers/edit-batch-drawer";

export function ProductVariantBatches({ variantId }: { variantId: string }) {
  // 1. Загрузка списка партий
  const { data: batches, isLoading } = useQuery({
    queryKey: ["product-batches", variantId],
    queryFn: () => ProductBatchesService.getBatchesByVariant(variantId),
  });

  // 2. Загрузка статистики
  const { data: stats } = useQuery({
    queryKey: ["product-batches-stats", variantId],
    queryFn: () => ProductBatchesService.getStats(variantId),
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);


  const [editingBatch, setEditingBatch] = useState<ProductBatch | null>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  // Функция открытия редактирования
  const handleEdit = (batch: ProductBatch) => {
    setEditingBatch(batch);
    setIsEditDrawerOpen(true);
  };
  

  return (
    <div className="space-y-4">
      {/* Мини-статистика сверху */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-3">
            <p className="text-[9px] uppercase font-black opacity-40 tracking-tighter">Umumiy miqdor</p>
            <p className="text-lg font-black text-orange-600 leading-none">{stats.totalQuantity} <span className="text-[10px]">dona</span></p>
          </div>
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-3">
            <p className="text-[9px] uppercase font-black opacity-40 tracking-tighter">Aktiv partiyalar</p>
            <p className="text-lg font-black text-primary leading-none">{stats.activeBatches} / {stats.totalBatches}</p>
          </div>
          <div className="bg-muted/30 border border-border/50 rounded-2xl p-3">
            <p className="text-[9px] uppercase font-black opacity-40 tracking-tighter">Yaqin tugash muddati</p>
            <p className="text-[11px] font-bold leading-none mt-1">
              {stats.nearestExpiry ? format(new Date(stats.nearestExpiry), "dd.MM.yyyy") : "Mavjud emas"}
            </p>
          </div>
        </div>
      )}

      <Card className="bg-card/30 backdrop-blur-xl border-border/60 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/10 bg-muted/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <Boxes className="size-4 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] opacity-60">
                Partiyalar Nazorati
              </CardTitle>
            </div>
          </div>
          <Button
            onClick={() => setIsDrawerOpen(true)}
            size="sm"
            className="rounded-xl h-8 px-3 font-bold text-[10px] uppercase tracking-wider bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="size-4 mr-1" /> Qo'shish
          </Button>
        </CardHeader>

        <CardContent className="pt-6 px-3 sm:px-6">
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-8 opacity-20">
                <Loader2 className="animate-spin size-6" />
              </div>
            ) : batches?.length ? (
              batches.map((batch) => {
                const isExpired = batch.expiryDate && new Date(batch.expiryDate) < new Date();

                return (
                  <div
                    key={batch.id}
                    className={cn(
                      "group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-3xl border gap-4 transition-all",
                      batch.isValid
                        ? "bg-background/40 border-border/40 hover:border-orange-500/30"
                        : "bg-destructive/5 border-destructive/10 grayscale-[0.8]"
                    )}
                  >
                    {/* Левая часть: Инфо о партии */}
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                      {/* Иконка/Номер (скрываем на совсем маленьких если нужно, или оставляем) */}
                      <div className="shrink-0 size-10 rounded-xl bg-orange-500/5 flex items-center justify-center font-mono text-[10px] font-bold border border-orange-500/20 text-orange-600">
                        #
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-mono text-sm font-bold tracking-tight italic uppercase truncate">
                            {batch.batchNumber}
                          </p>
                          {!batch.isValid && (
                            <Badge variant="destructive" className="text-[7px] sm:text-[8px] font-black uppercase px-1 py-0">
                              Yaroqsiz
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-1.5">
                          {/* Количество */}
                          <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm">
                            <TrendingUp className="size-3 text-orange-500" />
                            {batch.quantity}
                            <span className="text-[9px] opacity-40 font-bold uppercase ml-0.5">dona</span>
                          </div>

                          {/* Срок годности */}
                          {batch.expiryDate && (
                            <div className={cn(
                              "flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border shrink-0",
                              isExpired
                                ? "text-destructive border-destructive/20 bg-destructive/5"
                                : "text-muted-foreground border-border bg-muted/30"
                            )}>
                              <Clock className="size-3" />
                              {format(new Date(batch.expiryDate), "dd.MM.yyyy")}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Правая часть: Действия */}
                    <div className="flex sm:block border-t sm:border-t-0 border-border/10 pt-3 sm:pt-0">
                      <Button
                        onClick={() => handleEdit(batch)}
                        variant="secondary"
                        size="sm"
                        className="w-full sm:w-auto rounded-xl font-bold text-[10px] uppercase bg-muted/50 hover:bg-orange-600 hover:text-white transition-colors h-9"
                      >
                        Tahrirlash
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 opacity-20 border-2 border-dashed border-border/40 rounded-[2rem]">
                <AlertCircle className="size-8 mx-auto mb-2" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Partiyalar mavjud emas</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditBatchDrawer
        batch={editingBatch}
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
      />

      <CreateBatchDrawer
        variantId={variantId}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </div>
  );
}