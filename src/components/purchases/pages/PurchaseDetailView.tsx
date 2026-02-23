'use client'

import { useQuery } from '@tanstack/react-query';
import { PurchasesService } from '@/services/purchases.service';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Package,
  Truck,
  CreditCard,
  Receipt,
  Landmark,
  History,
  ArrowLeft,
  Printer,
  ExternalLink,
  Calendar,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import {PurchaseStatusLabels} from "@/schemas/purchases.schema";

export function PurchaseDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { data: purchase, isLoading } = useQuery({
    queryKey: ['purchase', id],
    queryFn: () => PurchasesService.findOne(id),
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse font-black opacity-20 uppercase tracking-widest">Xarid yuklanmoqda...</div>;
  if (!purchase) return <div className="p-8 text-center">Xarid topilmadi</div>;

  const statusStyles = {
    PAID: "bg-emerald-500/20 text-emerald-600 border-emerald-500/20",
    PARTIAL: "bg-orange-500/20 text-orange-600 border-orange-500/20",
    DRAFT: "bg-blue-500/20 text-blue-600 border-blue-500/20",
    CANCELLED: "bg-destructive/20 text-destructive border-destructive/20",
  };

  return (
    <div className="flex flex-col h-full space-y-6 p-4 lg:p-8 bg-transparent max-w-[1400px] mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-2xl bg-card/40 backdrop-blur-xl border border-border/50"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">
                Xarid #{purchase.invoiceNumber || 'B/R'}
              </h1>
              <Badge className={cn("rounded-lg border font-black text-[10px]", statusStyles[purchase.status])}>
                {PurchaseStatusLabels[purchase.status]}
              </Badge>
            </div>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">
              Xarid sanasi: {format(new Date(purchase.purchaseDate), 'dd.MM.yyyy HH:mm')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-2xl font-bold text-xs uppercase border-border/50 bg-card/40 backdrop-blur-md">
            <Printer className="size-4 mr-2" /> Chop etish
          </Button>
          {purchase.status !== 'PAID' && (
            <Button className="rounded-2xl font-black text-xs uppercase shadow-lg shadow-primary/20">
              Xaridni to‘lash
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Items & Payments */}
        <div className="lg:col-span-2 space-y-6">

          {/* PURCHASE ITEMS TABLE */}
          <Card className="rounded-[2.5rem] bg-card/40 backdrop-blur-xl border-border/40 overflow-hidden shadow-none">
            <div className="p-6 border-b border-border/20 bg-muted/20 flex items-center gap-2">
              <Package className="size-4 opacity-40" />
              <h2 className="text-sm font-black uppercase tracking-widest opacity-60">Yetkazib beruvchidan mahsulotlar</h2>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/10 text-[10px] uppercase font-black opacity-30">
                      <th className="px-6 py-4">Mahsulot / Partiya</th>
                      <th className="px-6 py-4 text-center">Miqdor</th>
                      <th className="px-6 py-4 text-right">Xarid narxi</th>
                      <th className="px-6 py-4 text-right">Chegirma</th>
                      <th className="px-6 py-4 text-right">Jami</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {purchase.items.map((item) => (
                      <tr key={item.id} className="border-b border-border/5 group hover:bg-primary/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold group-hover:text-primary transition-colors">
                              {item.product_variant?.title}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] font-black opacity-30 uppercase">
                                SKU: {item.product_variant?.sku || 'N/A'}
                              </span>
                              {item.batchNumber && (
                                <Badge variant="outline" className="h-4 text-[8px] border-orange-500/20 text-orange-600 bg-orange-500/5 px-1">
                                  <Layers className="size-2 mr-1" /> {item.batchNumber}
                                </Badge>
                              )}
                            </div>
                            {item.expiryDate && (
                              <span className="text-[9px] font-bold text-destructive/60 mt-1 flex items-center">
                                <Calendar className="size-2 mr-1" /> {format(new Date(item.expiryDate), 'dd.MM.yyyy')} gacha
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-black opacity-60">{item.quantity}</td>
                        <td className="px-6 py-4 text-right font-bold">{item.price.toLocaleString()} {purchase.currency?.symbol}</td>
                        <td className="px-6 py-4 text-right font-bold text-destructive/60">-{item.discount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-black text-primary">
                          {item.total.toLocaleString()} {purchase.currency?.symbol}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* PAYMENTS HISTORY */}
          <Card className="rounded-[2.5rem] bg-card/40 backdrop-blur-xl border-border/40 overflow-hidden shadow-none">
            <div className="p-6 border-b border-border/20 bg-muted/20 flex items-center gap-2">
              <History className="size-4 opacity-40" />
              <h2 className="text-sm font-black uppercase tracking-widest opacity-60">Yetkazib beruvchiga to‘lovlar tarixi</h2>
            </div>
            <CardContent className="p-6 space-y-4">
              {purchase.payments && purchase.payments.length > 0 ? purchase.payments.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-3xl bg-muted/30 border border-border/20">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                      <CreditCard className="size-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black uppercase opacity-40 leading-none mb-1">
                        {p.type === 'EXPENSE' ? 'XARAJAT' : 'QAYTARISH'}
                      </span>
                      <span className="text-sm font-bold">{p.description || 'Yetkazib beruvchiga to‘lov'}</span>
                      <span className="text-[9px] opacity-40">{format(new Date(p.createdAt), 'dd.MM.yyyy HH:mm')}</span>
                    </div>
                  </div>
                  <span className="font-black text-destructive">-{Number(p.amount).toLocaleString()} {purchase.currency?.symbol}</span>
                </div>
              )) : (
                <div className="text-center py-8 opacity-20 italic text-sm">Ushbu xarid bo‘yicha to‘lovlar qayd etilmagan</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Summary & Entities */}
        <div className="space-y-6">

          {/* FINANCIAL SUMMARY */}
          <Card className="rounded-[2.5rem] bg-[#1a1a1a] text-white overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent pointer-events-none" />
            <CardContent className="p-8 space-y-6 relative z-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em]">To‘lash uchun jami</span>
                <span className="text-5xl font-black tracking-tighter">
                  {purchase.totalAmount.toLocaleString()} <span className="text-2xl">{purchase.currency?.symbol}</span>
                </span>
              </div>

              <div className="h-px bg-white/10 w-full" />

              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase opacity-60">To‘langan</span>
                  <span className="text-xl font-bold text-emerald-400">{purchase.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black uppercase opacity-60">Qarz</span>
                  <span className="text-xl font-bold text-orange-400">
                    {(purchase.totalAmount - purchase.paidAmount).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-orange-500 transition-all duration-1000 shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                  style={{ width: `${(purchase.paidAmount / purchase.totalAmount) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* SUPPLIER & RESPONSIBLE INFO */}
          <Card className="rounded-[2.5rem] bg-card/40 backdrop-blur-xl border-border/40 overflow-hidden shadow-none">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <LabelItem
                  href={`/suppliers/${purchase.supplier?.id}`}
                  icon={Truck}
                  label="Yetkazib beruvchi"
                  value={purchase.supplier ? `${purchase.supplier.firstName} ${purchase.supplier.lastName}` : 'Noma’lum yetkazib beruvchi'}
                />
                <LabelItem
                  href={`/kassas/${purchase?.kassa?.id}`}
                  icon={Landmark}
                  label="Ayiriladigan kassa"
                  value={purchase.kassa?.name || 'Ko‘rsatilmagan'}
                />
                <LabelItem
                  href={`/tenant-users/${purchase?.responsible?.id}`}
                  icon={Receipt}
                  label="Xaridchi"
                  value={`${purchase.responsible?.profile?.firstName} ${purchase.responsible?.profile?.lastName}`}
                />
              </div>

              {purchase.notes && (
                <div className="mt-4 p-4 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                  <span className="text-[9px] font-black uppercase text-blue-600 block mb-1">Xaridga izohlar</span>
                  <p className="text-xs italic opacity-70 leading-relaxed">{purchase.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Помощник для рендеринга строк с иконками
function LabelItem({ icon: Icon, label, value, href }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="size-9 rounded-2xl bg-muted/50 flex items-center justify-center border border-border/20">
        <Icon className="size-4 opacity-40" />
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] font-black uppercase opacity-40 tracking-widest">{label}</span>
        <span className="text-sm font-bold truncate">{value}</span>
      </div>
      {href && (
        <Link href={href} className="ml-auto text-primary opacity-70 hover:opacity-100 transition-opacity text-xs uppercase font-black">
          <ExternalLink className="size-4 text-blue-500" />
        </Link>
      )}
    </div>
  );
}