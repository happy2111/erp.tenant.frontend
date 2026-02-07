'use client'

import { useQuery } from '@tanstack/react-query';
import { SalesService } from '@/services/sales.service';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Package,
  User,
  CreditCard,
  Receipt,
  Landmark,
  History,
  ArrowLeft,
  Printer, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import {ReactNode} from "react";

export function SaleDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { data: sale, isLoading } = useQuery({
    queryKey: ['sale', id],
    queryFn: () => SalesService.findOne(id),
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse font-black opacity-20 uppercase tracking-widest">Загрузка продажи...</div>;
  if (!sale) return <div className="p-8 text-center">Продажа не найдена</div>;

  const statusStyles = {
    PAID: "bg-emerald-500/20 text-emerald-600 border-emerald-500/20",
    PENDING: "bg-orange-500/20 text-orange-600 border-orange-500/20",
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
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">Чек #{sale.invoiceNumber}</h1>
              <Badge className={cn("rounded-lg border font-black text-[10px]", statusStyles[sale.status])}>
                {sale.status}
              </Badge>
            </div>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">
              Создано: {format(new Date(sale.saleDate), 'dd.MM.yyyy HH:mm')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-2xl font-bold text-xs uppercase border-border/50 bg-card/40 backdrop-blur-md">
            <Printer className="size-4 mr-2" /> Печать
          </Button>
          {sale.status !== 'PAID' && (
            <Button className="rounded-2xl font-black text-xs uppercase shadow-lg shadow-primary/20">
              Оплатить чек
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Items & Summary */}
        <div className="lg:col-span-2 space-y-6">

          {/* ITEMS TABLE */}
          <Card className="rounded-[2.5rem] bg-card/40 backdrop-blur-xl border-border/40 overflow-hidden shadow-none">
            <div className="p-6 border-b border-border/20 bg-muted/20 flex items-center gap-2">
              <Package className="size-4 opacity-40" />
              <h2 className="text-sm font-black uppercase tracking-widest opacity-60">Позиции в чеке</h2>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/10 text-[10px] uppercase font-black opacity-30">
                      <th className="px-6 py-4">Товар</th>
                      <th className="px-6 py-4 text-center">Кол-во</th>
                      <th className="px-6 py-4 text-right">Цена</th>
                      <th className="px-6 py-4 text-right">Итого</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {sale.items.map((item) => (
                      <tr key={item.id} className="border-b border-border/5 group hover:bg-primary/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold group-hover:text-primary transition-colors">{item.product_variant?.title}</span>
                            <span className="text-[9px] font-black opacity-30 uppercase">{item.product_variant?.sku || 'Без SKU'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-black opacity-60">{item.quantity}</td>
                        <td className="px-6 py-4 text-right font-bold">{item.price.toLocaleString()} {sale.currency?.symbol}</td>
                        <td className="px-6 py-4 text-right font-black text-primary">{(item.price * item.quantity).toLocaleString()} {sale.currency?.symbol}</td>
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
              <h2 className="text-sm font-black uppercase tracking-widest opacity-60">История платежей</h2>
            </div>
            <CardContent className="p-6 space-y-4">
              {sale.payments.length > 0 ? sale.payments.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-3xl bg-muted/30 border border-border/20">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <CreditCard className="size-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black uppercase opacity-40 leading-none mb-1">{p.type}</span>
                      <span className="text-sm font-bold">{p.description || 'Оплата по счету'}</span>
                    </div>
                  </div>
                  <span className="font-black text-emerald-600">+{p.amount.toLocaleString()} {p.currency?.symbol}</span>
                </div>
              )) : (
                <div className="text-center py-8 opacity-20 italic text-sm">Платежей пока не было</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Details & Financials */}
        <div className="space-y-6">

          {/* TOTAL CARD */}
          <Card className="rounded-[2.5rem] bg-primary text-primary-foreground overflow-hidden shadow-2xl shadow-primary/20 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <CardContent className="p-8 space-y-6 relative z-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em]">Общая сумма</span>
                <span className="text-5xl font-black tracking-tighter">
                  {sale.totalAmount.toLocaleString()} <span className="text-2xl">{sale.currency?.symbol}</span>
                </span>
              </div>

              <div className="h-px bg-white/10 w-full" />

              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase opacity-60">Оплачено</span>
                  <span className="text-xl font-bold">{sale.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black uppercase opacity-60">Остаток</span>
                  <span className="text-xl font-bold text-destructive-foreground">
                    {(sale.totalAmount - sale.paidAmount).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                  style={{ width: `${(sale.paidAmount / sale.totalAmount) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* CUSTOMER & RESPONSIBLE */}
          <Card className="rounded-[2.5rem] bg-card/40 backdrop-blur-xl border-border/40 overflow-hidden shadow-none">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <LabelItem href={`/organizations/customers`} icon={User} label="Клиент" value={sale.customer ? `${sale.customer.firstName} ${sale.customer.lastName}` : 'Розничный покупатель'} />
                <LabelItem href={`/kassas/${sale?.kassa?.id}`} icon={Landmark} label="Касса" value={sale.kassa?.name || 'Не указана'} />
                <LabelItem href={`/tenant-users/${sale?.responsible?.id}`} icon={Receipt} label="Ответственный" value={`${sale.responsible?.profile?.firstName} ${sale.responsible?.profile?.lastName}`} />
              </div>

              {sale.notes && (
                <div className="mt-4 p-4 rounded-3xl bg-orange-500/5 border border-orange-500/10">
                  <span className="text-[9px] font-black uppercase text-orange-600 block mb-1">Заметки</span>
                  <p className="text-xs italic opacity-70 leading-relaxed">{sale.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


// Вспомогательный мини-компонент
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