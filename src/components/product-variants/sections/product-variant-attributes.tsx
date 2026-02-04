"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductVariantAttributesService } from "@/services/product-variant-attributes.service";
import { AttributesService } from "@/services/attributes.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings2, Plus, Trash2, Loader2, Tag, ListFilter } from "lucide-react";
import { toast } from "sonner";

export function ProductVariantAttributes({ variantId }: { variantId: string }) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Состояния для выбора нового атрибута
  const [selectedAttrId, setSelectedAttrId] = useState<string>("");
  const [selectedValueId, setSelectedValueId] = useState<string>("");

  // 1. Загружаем текущие атрибуты этого варианта
  const { data: currentAttributes, isLoading: isAttrsLoading } = useQuery({
    queryKey: ["variant-attributes", variantId],
    queryFn: () => ProductVariantAttributesService.getAllAdmin({ productVariantId: variantId, limit: 100 }),
  });

  // 2. Загружаем список всех доступных атрибутов (для создания новых)
  const { data: allAttributes } = useQuery({
    queryKey: ["all-attributes-list"],
    queryFn: () => AttributesService.getAllAdmin({ limit: 100 }),
    enabled: isDialogOpen,
  });

  // 3. Находим выбранный атрибут, чтобы показать его значения
  const selectedAttribute = allAttributes?.items.find(a => a.id === selectedAttrId);

  // Мутация создания связи
  const createMutation = useMutation({
    mutationFn: () => ProductVariantAttributesService.create({
      productVariantId: variantId,
      attributeValueId: selectedValueId
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variant-attributes", variantId] });
      toast.success("Xarakteristika qo'shildi");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Bu xarakteristika allaqachon mavjud yoki xatolik yuz berdi")
  });

  // Мутация удаления связи
  const deleteMutation = useMutation({
    mutationFn: (id: string) => ProductVariantAttributesService.hardDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variant-attributes", variantId] });
      toast.success("O'chirildi");
    }
  });

  const resetForm = () => {
    setSelectedAttrId("");
    setSelectedValueId("");
  };

  return (
    <Card className="bg-card/30 backdrop-blur-xl border-border/60 shadow-2xl rounded-[2.5rem] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-2 border-b border-border/20 bg-muted/5 px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Иконка - чуть меньше на мобилках */}
          <div className="p-1.5 sm:p-2 rounded-xl bg-background border border-border/40 shadow-sm shrink-0">
            <Settings2 className="size-3.5 sm:size-4 text-primary" />
          </div>

          {/* Заголовок с динамическим размером и трекингом */}
          <CardTitle className="text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] opacity-60 truncate">
            Xarakteristikalar
          </CardTitle>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsDialogOpen(true)}
          className="rounded-xl hover:bg-primary/10 text-primary h-8 px-2 sm:px-3 shrink-0 ml-2"
        >
          <Plus className="size-4 sm:mr-1" />
          {/* Текст кнопки скрывается на очень маленьких экранах (меньше 400px) */}
          <span className="hidden xs:inline-block text-[10px] sm:text-xs font-bold">
            Qo'shish
          </span>
        </Button>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-3">
          {isAttrsLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="animate-spin size-5 opacity-20" /></div>
          ) : currentAttributes?.items.length ? (
            currentAttributes.items.map((attr) => (
              <div
                key={attr.id}
                className="group flex items-center justify-between p-3 rounded-2xl bg-background/40 border border-border/40 hover:border-primary/30 transition-all"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {attr.value?.attribute?.name}
                  </span>
                  <span className="text-sm font-bold tracking-tight">
                    {attr.value?.value}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteMutation.mutate(attr.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground/40 italic text-xs border-2 border-dashed border-border/20 rounded-3xl">
              Xarakteristikalar belgilanmagan
            </div>
          )}
        </div>
      </CardContent>

      {/* Dialog для добавления */}
      <div className={'mx-4'}>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
          <DialogContent className="rounded-[2.5rem] max-w-md ">
            <DialogHeader>
              <DialogTitle className="text-xl font-black italic uppercase tracking-tighter">
                Xarakteristika qo&apos;shish
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Выбор Атрибута */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Xarakteristika turi</label>
                <Select value={selectedAttrId} onValueChange={(val) => { setSelectedAttrId(val); setSelectedValueId(""); }}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="Tanlang (masalan: Rang)" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {allAttributes?.items.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Выбор Значения (только если выбран атрибут) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Qiymati</label>
                <Select
                  value={selectedValueId}
                  onValueChange={setSelectedValueId}
                  disabled={!selectedAttrId}
                >
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder={selectedAttrId ? "Qiymatni tanlang" : "Oldin xarakteristikani tanlang"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {selectedAttribute?.values.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Bekor qilish</Button>
              <Button
                disabled={!selectedValueId || createMutation.isPending}
                onClick={() => createMutation.mutate()}
                className="rounded-xl px-8"
              >
                {createMutation.isPending ? <Loader2 className="animate-spin size-4" /> : "Saqlash"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}