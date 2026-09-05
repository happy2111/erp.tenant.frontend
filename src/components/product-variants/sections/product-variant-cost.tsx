'use client';

import { useQuery } from '@tanstack/react-query';
import { PurchasesService } from '@/services/purchases.service';
import { BatchSourceLabels } from '@/schemas/purchases.schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Coins,
  Loader2,
  TrendingUp,
  AlertTriangle,
  Truck,
  History,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

/**
 * «За сколько куплена эта единица товара» — считается по партиям с
 * ненулевым остатком, то есть по тому, что реально лежит на складе,
 * а не по всей истории закупок.
 */
export function ProductVariantCost({ variantId }: { variantId: string }) {
  const { data: cost, isLoading } = useQuery({
    queryKey: ['variant-cost', variantId],
    queryFn: () => PurchasesService.getVariantCost(variantId),
  });

  const { data: history } = useQuery({
    queryKey: ['variant-price-history', variantId],
    queryFn: () => PurchasesService.getPriceHistory(variantId, { limit: 5 }),
  });

  if (isLoading) {
    return (
      <Card className="rounded-[2.5rem] bg-card/30 border-border/60">
        <CardContent className="flex justify-center py-10 opacity-20">
          <Loader2 className="animate-spin size-6" />
        </CardContent>
      </Card>
    );
  }

  if (!cost) return null;

  const margin =
    cost.variant.defaultPrice && cost.averageCostBase
      ? Number(cost.variant.defaultPrice) - cost.averageCostBase
      : null;

  return (
    <Card className="bg-card/30 backdrop-blur-xl border-border/60 shadow-2xl rounded-[2.5rem] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/10 bg-muted/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Coins className="size-4 text-emerald-600" />
          </div>
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] opacity-60">
            Tannarx
          </CardTitle>
        </div>
        <Link
          href={`/purchases/batches`}
          className="text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-primary transition-all"
        >
          Barcha partiyalar
        </Link>
      </CardHeader>

      <CardContent className="pt-6 space-y-5">
        {/* Расхождение Stock и суммы партий — сигнал, что учёт разъехался */}
        {!cost.inSync && (
          <div className="flex items-start gap-2 p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
            <div className="text-[11px] font-bold text-destructive leading-relaxed">
              Ombor qoldig‘i ({cost.stockQuantity}) partiyalar yig‘indisiga
              ({cost.batchesQuantity}) mos kelmayapti. Boshlang‘ich qoldiqlar
              partiyasiz kiritilgan bo‘lishi mumkin.
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4">
            <p className="text-[9px] uppercase font-black opacity-40 tracking-tighter">
              O‘rtacha tannarx
            </p>
            <p className="text-xl font-black text-emerald-600 leading-none mt-1">
              {cost.averageCostBase.toLocaleString()}
            </p>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4">
            <p className="text-[9px] uppercase font-black opacity-40 tracking-tighter">
              Qoldiq qiymati
            </p>
            <p className="text-xl font-black text-primary leading-none mt-1">
              {cost.totalCostBase.toLocaleString()}
            </p>
          </div>

          <div className="bg-muted/30 border border-border/50 rounded-2xl p-4">
            <p className="text-[9px] uppercase font-black opacity-40 tracking-tighter">
              Narx oralig‘i
            </p>
            <p className="text-sm font-black leading-none mt-1.5">
              {cost.minCostBase.toLocaleString()} —{' '}
              {cost.maxCostBase.toLocaleString()}
            </p>
          </div>

          <div className="bg-muted/30 border border-border/50 rounded-2xl p-4">
            <p className="text-[9px] uppercase font-black opacity-40 tracking-tighter">
              Partiyalar
            </p>
            <p className="text-sm font-black leading-none mt-1.5">
              {cost.availableBatchesCount} / {cost.batchesCount}
              <span className="text-[9px] opacity-40 font-bold uppercase ml-1">
                qoldiqli
              </span>
            </p>
          </div>
        </div>

        {/* Сколько заработаем, если продадим по прайсу */}
        {margin !== null && (
          <div
            className={cn(
              'flex items-center justify-between p-4 rounded-2xl border',
              margin >= 0
                ? 'bg-emerald-500/5 border-emerald-500/15'
                : 'bg-destructive/5 border-destructive/15'
            )}
          >
            <div className="flex items-center gap-2">
              <TrendingUp
                className={cn(
                  'size-4',
                  margin >= 0 ? 'text-emerald-600' : 'text-destructive'
                )}
              />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                Sotuv narxidagi foyda
              </span>
            </div>
            <span
              className={cn(
                'font-black',
                margin >= 0 ? 'text-emerald-600' : 'text-destructive'
              )}
            >
              {margin >= 0 ? '+' : ''}
              {margin.toLocaleString()}
            </span>
          </div>
        )}

        {/* Последний приход — по нему видно, растёт ли закупочная цена */}
        {cost.lastPurchase && (
          <div className="p-4 rounded-2xl bg-muted/20 border border-border/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase opacity-40 tracking-widest">
                Oxirgi kelgan partiya
              </span>
              <span className="text-[9px] font-bold opacity-40">
                {format(new Date(cost.lastPurchase.receivedAt), 'dd.MM.yyyy')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold">
                {cost.lastPurchase.batchNumber}
              </span>
              <span className="font-black text-sm">
                {cost.lastPurchase.costPrice.toLocaleString()}{' '}
                <span className="text-[10px] opacity-40">
                  {cost.lastPurchase.currency?.symbol}
                </span>
              </span>
            </div>
            {cost.lastPurchase.supplier && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-40">
                <Truck className="size-3" />
                {cost.lastPurchase.supplier.firstName}{' '}
                {cost.lastPurchase.supplier.lastName}
              </div>
            )}
          </div>
        )}

        {/* История закупочных цен: почём брали раньше и у кого */}
        {history && history.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 opacity-30">
              <History size={13} />
              <span className="text-[9px] font-black uppercase tracking-widest">
                Xarid narxlari tarixi
              </span>
            </div>
            <div className="space-y-1.5">
              {history.map((h) => (
                <Link
                  key={`${h.purchaseId}-${h.batchNumber ?? ''}`}
                  href={`/purchases/${h.purchaseId}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/30 hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold truncate">
                      {h.supplier
                        ? `${h.supplier.firstName ?? ''} ${h.supplier.lastName ?? ''}`.trim()
                        : h.invoiceNumber || '—'}
                    </span>
                    <span className="text-[9px] font-bold opacity-40">
                      {format(new Date(h.purchaseDate), 'dd.MM.yyyy')} ·{' '}
                      {h.quantity} dona
                    </span>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="font-black text-xs">
                      {h.costPrice.toLocaleString()}{' '}
                      <span className="text-[9px] opacity-40">
                        {h.currency?.symbol}
                      </span>
                    </span>
                    {h.costPriceBase != null &&
                      h.costPriceBase !== h.costPrice && (
                        <span className="block text-[9px] font-bold opacity-40">
                          ≈ {h.costPriceBase.toLocaleString()}
                        </span>
                      )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {cost.batchesCount === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-border/40 rounded-2xl">
            <Badge
              variant="outline"
              className="text-[9px] font-black uppercase border-border/50"
            >
              {BatchSourceLabels.OPENING_BALANCE}
            </Badge>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-2">
              Partiyalar yo‘q — tannarx noma’lum
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
