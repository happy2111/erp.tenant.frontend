"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AttributesService } from "@/services/attributes.service";
import { AttributeValuesService } from "@/services/attribute-values.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Edit3,
  Plus,
  Trash2,
  Settings2,
  Key,
  ListTree,
  Type,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch"; // Или ваш аналог для уведомлений

export function AttributeDetails({ attributeId }: { attributeId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Состояния для CRUD значений
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<{ id: string; value: string } | null>(null);
  const [newValue, setNewValue] = useState("");

  // 1. Получение данных атрибута
  const { data: attribute, isLoading, error } = useQuery({
    queryKey: ["attributes", attributeId],
    queryFn: () => AttributesService.getByIdAdmin(attributeId),
  });

  const [isRequired, setIsRequired] = useState(attribute?.isRequired || false);

  // 2. Мутации для CRUD значений
  const createMutation = useMutation({
    mutationFn: () => AttributeValuesService.create({ attributeId, value: newValue }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes", attributeId] });
      setIsDialogOpen(false);
      setNewValue("");
      toast.success("Qiymat muvaffaqiyatli qo&apos;shildi");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, value }: { id: string; value: string }) =>
      AttributeValuesService.update(id, { value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes", attributeId] });
      setEditingValue(null);
      toast.success("Qiymat yangilandi");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => AttributeValuesService.hardDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes", attributeId] });
      toast.success("Qiymat o&apos;chirildi");
    },
    onError: () => toast.error("O&apos;chirishda xatolik (qiymat ishlatilayotgan bo&apos;lishi mumkin)")
  });

  const hadleCheckUpdate = (v: boolean) => {
    try {
      // alert(v)
      setIsRequired(v);
      AttributesService.update(attributeId, {isRequired: v});
    } catch (error: any) {
      toast.error(error.message);
    }
  };


  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="size-10 text-primary animate-spin" />
      <p className="text-muted-foreground animate-pulse font-medium">Yuklanmoqda...</p>
    </div>
  );

  if (error || !attribute) return (
    <div className="p-12 text-center bg-destructive/10 rounded-[2rem] border border-destructive/20 text-destructive">
      Xarakteristika ma&apos;lumotlarini yuklashda xatolik
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 lg:p-8 animate-in fade-in duration-500">

      {/* --- TOP BAR --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="group -ml-2 text-muted-foreground hover:text-primary rounded-full"
          >
            <ArrowLeft className="mr-2 size-4 transition-transform group-hover:-translate-x-1" />
            Orqaga
          </Button>
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
              <Settings2 className="size-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">{attribute.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase">
                  Xarakteristika
                </Badge>
                <span className="text-xs text-muted-foreground font-mono opacity-60">Key: {attribute.key}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* --- LEFT: Info --- */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard title="Asosiy ma&apos;lumotlar" icon={<Key className="size-4 text-primary" />}>
            <Info label="Nomi (RU/UZ)" value={attribute.name} />
            <Info label="System Key" value={attribute.key} />
            <div className="h-px bg-border/40 my-4" />

            <div className="py-3 px-1 group flex justify-between">
              <Label htmlFor="airplane-mode">Majburiy</Label>
              <Switch id="airplane-mode" checked={isRequired} onCheckedChange={(v) => hadleCheckUpdate(v)} />
            </div>
          </GlassCard>
        </div>

        {/* --- RIGHT: Values CRUD --- */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <ListTree className="size-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">Qiymatlar ro&apos;yxati</h2>
            </div>
            <Button
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className="rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <Plus className="mr-1 size-4" /> Qo&apos;shish
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {attribute.values?.length > 0 ? (
              attribute.values.map((item) => (
                <div
                  key={item.id}
                  className="group p-4 rounded-3xl bg-card/40 border border-border/60 hover:border-primary/40 transition-all shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Type className="size-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <span className="font-bold tracking-tight text-lg">{item.value}</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg text-muted-foreground hover:text-primary"
                      onClick={() => setEditingValue({ id: item.id, value: item.value })}
                    >
                      <Edit3 className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        if(confirm("Haqiqatan ham o&apos;chirmoqchimisiz?")) deleteMutation.mutate(item.id);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="sm:col-span-2 py-12 text-center border-2 border-dashed border-border/40 rounded-[2rem] text-muted-foreground/50 italic">
                Hozircha qiymatlar mavjud emas
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- DIALOG: CREATE VALUE --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-[2rem] max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Yangi qiymat qo&apos;shish</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Qiymatni kiriting (masalan: Qizil, XL...)"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="rounded-xl h-12"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Bekor qilish</Button>
            <Button
              disabled={!newValue || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DIALOG: EDIT VALUE --- */}
      <Dialog open={!!editingValue} onOpenChange={() => setEditingValue(null)}>
        <DialogContent className="rounded-[2rem] max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Qiymatni tahrirlash</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Qiymat"
              value={editingValue?.value || ""}
              onChange={(e) => setEditingValue(prev => prev ? {...prev, value: e.target.value} : null)}
              className="rounded-xl h-12"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingValue(null)}>Bekor qilish</Button>
            <Button
              disabled={updateMutation.isPending}
              onClick={() => editingValue && updateMutation.mutate({ id: editingValue.id, value: editingValue.value })}
            >
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function GlassCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="bg-card/30 backdrop-blur-xl border-border/60 shadow-2xl shadow-black/[0.02] rounded-[2.5rem] overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 pb-2 border-b border-border/20 bg-muted/5">
        <div className="p-2 rounded-xl bg-background shadow-sm border border-border/40">
          {icon}
        </div>
        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] opacity-60">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {children}
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="py-3 px-1 group">
      <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em] mb-1 group-hover:text-primary transition-colors">
        {label}
      </div>
      <div className="text-sm font-semibold tracking-tight">
        {value || <span className="text-muted-foreground/30 font-normal italic">ko&apos;rsatilmagan</span>}
      </div>
    </div>
  );
}