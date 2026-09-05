'use client'

import { useState, type ElementType, Fragment } from 'react';
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
  Layers,
  PackageCheck,
  Undo2,
  Boxes,
  ArrowLeftRight,
  AlertTriangle,
  Wallet,
  Hash,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import {
  BatchSourceLabels,
  PurchaseStatusLabels,
  PurchaseStatusStyles,
  type PurchaseItem,
} from "@/schemas/purchases.schema";
import {
  ConfirmPurchaseDialog
} from "@/components/purchases/dialogs/ConfirmPurchaseDialog";
import {
  CancelPurchaseDialog
} from "@/components/purchases/dialogs/CancelPurchaseDialog";
import {
  PayPurchaseDialog
} from "@/components/purchases/dialogs/PayPurchaseDialog";
import { PRODUCT_LABELS } from "@/lib/product-labels";

export function PurchaseDetailView({ id }: { id: string }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const { data: purchase, isLoading } = useQuery({
    queryKey: ['purchase', id],
    queryFn: () => PurchasesService.findOne(id),
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse font-black opacity-20 uppercase tracking-widest">Xarid yuklanmoqda...</div>;
  if (!purchase) return <div className="p-8 text-center">Xarid topilmadi</div>;

  const isDraft = purchase.status === 'DRAFT';
  const isCancelled = purchase.status === 'CANCELLED';
  // Отменить можно всё проведённое: партии ещё живы, деньги вернутся в кассу
  const canCancel = !isDraft && !isCancelled;
  const remaining = purchase.totalAmount - purchase.paidAmount;
  // CONFIRMED — товар принят, но не оплачен; PARTIAL — оплачен частично.
  // Черновик платить нельзя: сначала проведение
  const canPay = !isDraft && !isCancelled && remaining > 0;
  const batches = purchase.product_batches ?? [];

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
              <Badge className={cn("rounded-lg border font-black text-[10px]", PurchaseStatusStyles[purchase.status])}>
                {PurchaseStatusLabels[purchase.status]}
              </Badge>
            </div>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">
              Xarid sanasi: {format(new Date(purchase.purchaseDate), 'dd.MM.yyyy HH:mm')}
              {purchase.confirmedAt && (
                <> · O‘tkazilgan: {format(new Date(purchase.confirmedAt), 'dd.MM.yyyy HH:mm')}</>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-2xl font-bold text-xs uppercase border-border/50 bg-card/40 backdrop-blur-md">
            <Printer className="size-4 mr-2" /> Chop etish
          </Button>

          {isDraft && (
            <Button
              className="rounded-2xl font-black text-xs uppercase bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-600/20"
              onClick={() => setConfirmOpen(true)}
            >
              <PackageCheck className="size-4 mr-2" /> O‘tkazish
            </Button>
          )}

          {canPay && (
            <Button
              className="rounded-2xl font-black text-xs uppercase bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
              onClick={() => setPayOpen(true)}
            >
              <Wallet className="size-4 mr-2" /> To‘lash
            </Button>
          )}

          {canCancel && (
            <Button
              variant="outline"
              className="rounded-2xl font-bold text-xs uppercase border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => setCancelOpen(true)}
            >
              <Undo2 className="size-4 mr-2" /> Bekor qilish
            </Button>
          )}
        </div>
      </div>

      {/* Черновик ничего не изменил в учёте — об этом надо сказать прямо */}
      {isDraft && (
        <div className="flex items-start gap-3 p-5 rounded-3xl bg-blue-500/5 border border-blue-500/20">
          <AlertTriangle className="size-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs font-bold leading-relaxed">
            <span className="text-blue-600 uppercase">Bu qoralama.</span>{' '}
            Tovar hali omborga kirmagan, pul kassadan yechilmagan. Hujjatni
            o‘tkazganingizda har bir pozitsiyaga tannarxli partiya ochiladi.
          </div>
        </div>
      )}

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
                    {purchase.items.map((item) => {
                      const variantId = item.product_variant?.id ?? item.productVariantId;
                      const namunaRows = getNamunaRows(item);
                      const isNamuna = namunaRows.length > 0;
                      return (
                      <Fragment key={item.id}>
                      <tr
                        role="link"
                        tabIndex={0}
                        onClick={() => router.push(`/product-variants/${variantId}`)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            router.push(`/product-variants/${variantId}`);
                          }
                        }}
                        className="border-b border-border/5 group hover:bg-primary/5 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold group-hover:text-primary transition-colors">
                                {item.product_variant?.title}
                              </span>
                              {isNamuna && (
                                <Badge className="h-5 text-[8px] font-black uppercase bg-violet-500/15 text-violet-600 border-none px-1.5">
                                  <Smartphone className="size-2.5 mr-1" />
                                  {PRODUCT_LABELS.instance.short}
                                </Badge>
                              )}
                            </div>
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

                      {isNamuna && (
                        <tr className="border-b border-border/5 bg-violet-500/[0.03]">
                          <td colSpan={5} className="px-6 py-3">
                            <div className="rounded-2xl border border-violet-500/15 bg-background/60 divide-y divide-border/30 overflow-hidden">
                              {namunaRows.map((row) => (
                                <div
                                  key={row.key}
                                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3"
                                >
                                  <div className="min-w-0 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Hash className="size-3 opacity-40 shrink-0" />
                                      <span className="font-mono text-xs font-bold truncate">
                                        {row.serialNumber}
                                      </span>
                                      {row.status && (
                                        <Badge
                                          variant="outline"
                                          className="h-4 text-[8px] font-bold uppercase opacity-60"
                                        >
                                          {row.status}
                                        </Badge>
                                      )}
                                      {row.isDraft && (
                                        <span className="text-[8px] font-black uppercase opacity-40">
                                          Qoralama
                                        </span>
                                      )}
                                    </div>
                                    {row.attrs.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 pl-5">
                                        {row.attrs.map((a) => (
                                          <span
                                            key={a.key}
                                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted/60"
                                          >
                                            <span className="opacity-50">{a.name}: </span>
                                            {a.value}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="sm:text-right shrink-0 pl-5 sm:pl-0">
                                    <span className="text-xs font-black text-primary">
                                      {row.unitCost.toLocaleString()}{' '}
                                      {purchase.currency?.symbol}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                      </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* BATCHES — что реально легло на склад */}
          {batches.length > 0 && (
            <Card className="rounded-[2.5rem] bg-card/40 backdrop-blur-xl border-border/40 overflow-hidden shadow-none">
              <div className="p-6 border-b border-border/20 bg-muted/20 flex items-center gap-2">
                <Boxes className="size-4 opacity-40" />
                <h2 className="text-sm font-black uppercase tracking-widest opacity-60">
                  Omborga kirgan partiyalar
                </h2>
              </div>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/10 text-[10px] uppercase font-black opacity-30">
                        <th className="px-6 py-4">Partiya</th>
                        <th className="px-6 py-4 text-center">Kirdi</th>
                        <th className="px-6 py-4 text-center">Qoldiq</th>
                        <th className="px-6 py-4 text-right">Tannarx</th>
                        <th className="px-6 py-4 text-right">Baza valyutada</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {batches.map((batch) => {
                        const sold = batch.quantity - batch.remainingQuantity;
                        return (
                          <tr key={batch.id} className="border-b border-border/5 hover:bg-primary/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-mono font-bold text-xs">{batch.batchNumber}</span>
                                <span className="text-[9px] font-black opacity-30 uppercase mt-0.5">
                                  {BatchSourceLabels[batch.source]}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center font-black opacity-60">{batch.quantity}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={cn(
                                "font-black",
                                batch.remainingQuantity === 0 ? "opacity-30" : "text-emerald-600"
                              )}>
                                {batch.remainingQuantity}
                              </span>
                              {sold > 0 && (
                                <span className="block text-[9px] font-bold opacity-40 uppercase">
                                  {sold} sotilgan
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right font-bold">
                              {batch.costPrice.toLocaleString()} {purchase.currency?.symbol}
                            </td>
                            <td className="px-6 py-4 text-right font-black text-primary">
                              {batch.costPriceBase.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* PAYMENTS HISTORY */}
          <Card className="rounded-[2.5rem] bg-card/40 backdrop-blur-xl border-border/40 overflow-hidden shadow-none">
            <div className="p-6 border-b border-border/20 bg-muted/20 flex items-center gap-2">
              <History className="size-4 opacity-40" />
              <h2 className="text-sm font-black uppercase tracking-widest opacity-60">Yetkazib beruvchiga to‘lovlar tarixi</h2>
            </div>
            <CardContent className="p-6 space-y-4">
              {purchase.payments && purchase.payments.length > 0 ? purchase.payments.map((p: {
                id: string;
                type: string;
                description?: string | null;
                amount: number | string;
                createdAt: string;
              }) => {
                const isRefund = p.type !== 'EXPENSE';
                return (
                  <div key={p.id} className="flex items-center justify-between p-4 rounded-3xl bg-muted/30 border border-border/20">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "size-10 rounded-2xl flex items-center justify-center",
                        isRefund ? "bg-emerald-500/10 text-emerald-600" : "bg-orange-500/10 text-orange-600"
                      )}>
                        {isRefund ? <ArrowLeftRight className="size-5" /> : <CreditCard className="size-5" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black uppercase opacity-40 leading-none mb-1">
                          {isRefund ? 'QAYTARISH' : 'XARAJAT'}
                        </span>
                        <span className="text-sm font-bold">{p.description || 'Yetkazib beruvchiga to‘lov'}</span>
                        <span className="text-[9px] opacity-40">{format(new Date(p.createdAt), 'dd.MM.yyyy HH:mm')}</span>
                      </div>
                    </div>
                    <span className={cn("font-black", isRefund ? "text-emerald-600" : "text-destructive")}>
                      {isRefund ? '+' : '-'}{Number(p.amount).toLocaleString()} {purchase.currency?.symbol}
                    </span>
                  </div>
                );
              }) : (
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

              {/* Progress Bar. totalAmount может быть 0 — деление защищено */}
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-orange-500 transition-all duration-1000 shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                  style={{
                    width: `${purchase.totalAmount > 0
                      ? Math.min(100, (purchase.paidAmount / purchase.totalAmount) * 100)
                      : 0}%`
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* КУРС — зафиксирован при проведении */}
          {purchase.exchangeRate != null && (
            <Card className="rounded-[2.5rem] bg-card/40 backdrop-blur-xl border-border/40 overflow-hidden shadow-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <ArrowLeftRight className="size-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase opacity-40 tracking-widest">
                      Muzlatilgan kurs
                    </span>
                    <span className="text-sm font-bold">
                      1 {purchase.currency?.code} = {purchase.exchangeRate.toLocaleString()}
                      {purchase.baseCurrency?.code ? ` ${purchase.baseCurrency.code}` : ''}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] font-bold opacity-40 mt-3 leading-relaxed">
                  Tannarx shu kurs bo‘yicha hisoblangan va keyingi kurs
                  o‘zgarishlaridan ta’sirlanmaydi.
                </p>
              </CardContent>
            </Card>
          )}

          {/* SUPPLIER & RESPONSIBLE INFO */}
          <Card className="rounded-[2.5rem] bg-card/40 backdrop-blur-xl border-border/40 overflow-hidden shadow-none">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <LabelItem
                  href={`/organizations/customers/${purchase.supplier?.id}`}
                  icon={Truck}
                  label="Yetkazib beruvchi"
                  value={purchase.supplier ? `${purchase.supplier.firstName} ${purchase.supplier.lastName}` : 'Noma’lum yetkazib beruvchi'}
                />
                <LabelItem
                  href={purchase.kassa?.id ? `/kassas/${purchase.kassa.id}` : undefined}
                  icon={Landmark}
                  label="Ayiriladigan kassa"
                  value={purchase.kassa?.name || 'Ko‘rsatilmagan'}
                />
                <LabelItem
                  href={purchase.responsible?.id ? `/tenant-users/${purchase.responsible.id}` : undefined}
                  icon={Receipt}
                  label="Xaridchi"
                  value={
                    purchase.responsible?.profile
                      ? `${purchase.responsible.profile.firstName ?? ''} ${purchase.responsible.profile.lastName ?? ''}`.trim()
                      : purchase.responsible?.email || 'Ko‘rsatilmagan'
                  }
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

      <ConfirmPurchaseDialog
        purchase={purchase}
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
      />
      <CancelPurchaseDialog
        purchase={purchase}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
      />
      {/* key по остатку: диалог держит сумму в локальном состоянии, после
          частичной оплаты его надо перемонтировать с новым долгом */}
      <PayPurchaseDialog
        key={`pay-${remaining}`}
        purchase={purchase}
        open={payOpen}
        onOpenChange={setPayOpen}
      />
    </div>
  );
}

type NamunaRow = {
  key: string;
  serialNumber: string;
  unitCost: number;
  status?: string;
  isDraft?: boolean;
  attrs: { key: string; name: string; value: string }[];
};

/** После проведения — product_instances; в черновике — instancesJson */
function getNamunaRows(item: PurchaseItem): NamunaRow[] {
  if (item.product_instances?.length) {
    return item.product_instances.map((inst) => ({
      key: inst.id,
      serialNumber: inst.serialNumber,
      unitCost: inst.costPrice ?? item.price - item.discount,
      status: inst.currentStatus,
      attrs: (inst.attributes ?? [])
        .map((a, i) => ({
          key: a.id ?? `${inst.id}-${i}`,
          name: a.value?.attribute?.name ?? 'Attr',
          value: a.value?.value ?? '—',
        }))
        .filter((a) => a.value !== '—'),
    }));
  }

  const drafts = item.instancesJson ?? [];
  return drafts.map((draft, i) => ({
    key: `${item.id}-draft-${i}`,
    serialNumber: draft.serialNumber,
    unitCost:
      (draft.price ?? item.price) - (draft.discount ?? item.discount),
    isDraft: true,
    attrs: [],
  }));
}

// Помощник для рендеринга строк с иконками
function LabelItem({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: ElementType;
  label: string;
  value: string;
  href?: string;
}) {
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
