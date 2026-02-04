"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductInstancesService } from "@/services/product-instances.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Loader2, QrCode, User,
  Calendar, History, Package, ArrowRightLeft,
  Trash2, ShoppingCart, RefreshCcw
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const statusConfig = {
  IN_STOCK: { label: "Omborda", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  SOLD: { label: "Sotilgan", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  RETURNED: { label: "Qaytarilgan", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  LOST: { label: "Yo'qolgan", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function ProductInstanceDetailPage({id}: {id: string}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: instance, isLoading } = useQuery({
    queryKey: ["product-instance", id],
    queryFn: () => ProductInstancesService.findOne(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => ProductInstancesService.remove(id),
    onSuccess: () => {
      toast.success("O'chirildi");
      router.back();
    }
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="size-10 animate-spin text-primary opacity-20" />
    </div>
  );

  if (!instance) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="rounded-xl group">
            <ArrowLeft className="mr-2 size-4 group-hover:-translate-x-1 transition-transform" />
            Orqaga
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5" onClick={() => {
              if(confirm("Haqiqatan ham o'chirmoqchimisiz?")) deleteMutation.mutate();
            }}>
              <Trash2 className="size-4 mr-2" /> O'chirish
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Основная инфа */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-card/40 backdrop-blur-2xl border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-8 text-center border-b border-border/10 bg-muted/5">
                <div className="mx-auto size-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-4 border border-primary/20">
                  <QrCode className="size-10 text-primary" />
                </div>
                <h1 className="text-xl font-black font-mono tracking-tighter">{instance.serialNumber}</h1>
                <Badge className={cn("mt-3 uppercase font-black text-[10px] tracking-widest", statusConfig[instance.currentStatus].className)}>
                  {statusConfig[instance.currentStatus].label}
                </Badge>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-black opacity-40 tracking-widest">Mahsulot</p>
                  <p className="font-bold text-sm">{instance.productVariant?.product?.name}</p>
                  <p className="text-xs text-muted-foreground">{instance.productVariant?.title}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-black opacity-40 tracking-widest">Yaratilgan sana</p>
                  <p className="font-bold text-sm flex items-center gap-2">
                    <Calendar className="size-3 text-primary" />
                    {format(new Date(instance.createdAt), 'dd.MM.yyyy HH:mm')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Владелец */}
            {instance.current_owner && (
              <Card className="bg-primary/5 border-primary/10 rounded-[2rem]">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <User className="size-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black opacity-60 tracking-widest">Hozirgi ega</p>
                    <p className="font-bold text-sm">{instance.current_owner.firstName} {instance.current_owner.lastName}</p>
                    <p className="text-xs opacity-60">{instance.current_owner.phone}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: История транзакций */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <History className="size-5 text-primary" />
                <h2 className="text-lg font-black uppercase italic tracking-tighter">Harakatlar tarixi</h2>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-[10px] uppercase tracking-wider h-9">
                  <ShoppingCart className="size-3 mr-2" /> Sotish
                </Button>
                <Button size="sm" variant="outline" className="rounded-xl font-bold text-[10px] uppercase tracking-wider h-9">
                  <RefreshCcw className="size-3 mr-2" /> Qaytarish
                </Button>
              </div>
            </div>

            <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:via-border before:to-transparent">
              {instance.transactions?.map((tx, idx) => (
                <div key={tx.id} className="relative flex items-start gap-6 group animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="absolute left-0 mt-1.5 size-10 rounded-full border-4 border-background bg-card flex items-center justify-center z-10 shadow-sm group-hover:scale-110 transition-transform">
                    {getActionIcon(tx.action)}
                  </div>

                  <Card className="flex-1 ml-6 bg-card/20 hover:bg-card/40 border-border/40 rounded-2xl transition-all overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <Badge variant="outline" className="w-fit text-[9px] font-black uppercase tracking-tighter border-primary/20 text-primary">
                          {tx.action}
                        </Badge>
                        <span className="text-[10px] font-mono opacity-40">
                          {format(new Date(tx.date), 'dd MMM yyyy, HH:mm')}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        {tx.from_customer && (
                          <div className="text-muted-foreground line-through opacity-50">{tx.from_customer.firstName}</div>
                        )}
                        {tx.from_customer && tx.to_customer && <ArrowRightLeft className="size-3 opacity-30" />}
                        {tx.to_customer && (
                          <div className="font-bold text-primary flex items-center gap-2">
                            <User className="size-3" />
                            {tx.to_customer.firstName} {tx.to_customer.lastName}
                          </div>
                        )}
                      </div>

                      {tx.description && (
                        <p className="mt-2 text-xs italic text-muted-foreground border-l-2 border-border pl-2">
                          "{tx.description}"
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Хелпер для иконок действий
function getActionIcon(action: string) {
  switch (action) {
    case 'SOLD': return <ShoppingCart className="size-4 text-blue-500" />;
    case 'RETURNED': return <RefreshCcw className="size-4 text-amber-500" />;
    case 'PURCHASED': return <Package className="size-4 text-emerald-500" />;
    default: return <ArrowRightLeft className="size-4 text-primary" />;
  }
}