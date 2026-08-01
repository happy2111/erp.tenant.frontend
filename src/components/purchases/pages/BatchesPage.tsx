'use client';

import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { PurchasesService } from '@/services/purchases.service';
import {
  BatchSource,
  BatchSourceLabels,
  BatchSourceValues,
} from '@/schemas/purchases.schema';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Boxes,
  Loader2,
  ArrowDownUp,
  Calendar,
  Truck,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

/**
 * Партии организации: за сколько куплена каждая пачка товара и сколько
 * от неё осталось. Сортировка по возрастанию даты прихода показывает тот
 * же порядок, в котором партии будет списывать FIFO.
 */
export function BatchesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 400);
  const [source, setSource] = useState<BatchSource | undefined>(undefined);
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: [
      'product-batches',
      debouncedSearch,
      source,
      onlyAvailable,
      order,
      page,
    ],
    queryFn: () =>
      PurchasesService.getBatches({
        search: debouncedSearch || undefined,
        source,
        onlyAvailable: onlyAvailable ? 'true' : undefined,
        order,
        page,
        limit,
      }),
    placeholderData: keepPreviousData,
  });

  const batches = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">
            Partiyalar
          </h1>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">
            Har bir partiya — bitta xarid qatori: qanchaga olingan va qancha qolgan
          </p>
        </div>

        <Button
          variant="outline"
          className="rounded-2xl font-bold text-xs uppercase border-border/50 self-start sm:self-auto"
          onClick={() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
        >
          <ArrowDownUp className="size-4 mr-2" />
          {order === 'asc' ? 'Eski avval (FIFO)' : 'Yangi avval'}
        </Button>
      </div>

      {/* Фильтры */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <Input
          placeholder="Partiya raqami bo‘yicha qidirish..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm h-11 rounded-2xl bg-muted/40 border-none font-bold"
        />

        <Select
          value={source ?? 'all'}
          onValueChange={(v) => {
            setSource(v === 'all' ? undefined : (v as BatchSource));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-56 h-11 rounded-2xl bg-muted/40 border-none font-bold">
            <SelectValue placeholder="Manba" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha manbalar</SelectItem>
            {BatchSourceValues.map((s) => (
              <SelectItem key={s} value={s}>
                {BatchSourceLabels[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={onlyAvailable ? 'default' : 'outline'}
          className="h-11 rounded-2xl font-bold text-xs uppercase"
          onClick={() => {
            setOnlyAvailable((v) => !v);
            setPage(1);
          }}
        >
          {onlyAvailable ? 'Faqat qoldiqli' : 'Barchasi'}
        </Button>
      </div>

      {error && (
        <div className="text-destructive text-center py-10 p-4 bg-destructive/10 rounded-3xl font-bold">
          Partiyalarni yuklashda xatolik:{' '}
          {error instanceof Error ? error.message : 'Noma’lum xatolik'}
        </div>
      )}

      <Card className="rounded-[2.5rem] bg-card/40 backdrop-blur-xl border-border/40 overflow-hidden shadow-none">
        <div className="p-6 border-b border-border/20 bg-muted/20 flex items-center gap-2">
          <Boxes className="size-4 opacity-40" />
          <h2 className="text-sm font-black uppercase tracking-widest opacity-60">
            {data?.total ?? 0} ta partiya
          </h2>
        </div>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16 opacity-20">
              <Loader2 className="animate-spin size-8" />
            </div>
          ) : batches.length === 0 ? (
            <div className="text-center py-16 opacity-20">
              <AlertCircle className="size-8 mx-auto mb-2" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                Partiyalar topilmadi
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/10 text-[10px] uppercase font-black opacity-30">
                    <th className="px-6 py-4">Partiya / Mahsulot</th>
                    <th className="px-6 py-4">Kelgan sana</th>
                    <th className="px-6 py-4 text-center">Kirdi</th>
                    <th className="px-6 py-4 text-center">Qoldiq</th>
                    <th className="px-6 py-4 text-right">Tannarx</th>
                    <th className="px-6 py-4 text-right">Baza valyutada</th>
                    <th className="px-6 py-4">Manba</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {batches.map((batch) => {
                    const sold = batch.quantity - batch.remainingQuantity;
                    const expired =
                      batch.expiryDate && new Date(batch.expiryDate) < new Date();

                    return (
                      <tr
                        key={batch.id}
                        className="border-b border-border/5 hover:bg-primary/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono font-bold text-xs">
                              {batch.batchNumber}
                            </span>
                            {batch.product_variant && (
                              <Link
                                href={`/product-variants/${batch.product_variant.id}`}
                                className="text-xs font-bold hover:text-primary transition-colors"
                              >
                                {batch.product_variant.title}
                              </Link>
                            )}
                            {batch.expiryDate && (
                              <span
                                className={cn(
                                  'text-[9px] font-bold flex items-center gap-1 mt-0.5',
                                  expired ? 'text-destructive' : 'opacity-40'
                                )}
                              >
                                <Calendar className="size-2.5" />
                                {format(new Date(batch.expiryDate), 'dd.MM.yyyy')}
                                {expired && ' — muddati o‘tgan'}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold">
                              {format(new Date(batch.receivedAt), 'dd.MM.yyyy')}
                            </span>
                            {batch.purchase?.invoiceNumber && (
                              <Link
                                href={`/purchases/${batch.purchase.id}`}
                                className="text-[9px] font-black opacity-40 uppercase hover:text-primary hover:opacity-100 transition-all"
                              >
                                {batch.purchase.invoiceNumber}
                              </Link>
                            )}
                            {batch.supplier && (
                              <span className="text-[9px] font-bold opacity-40 flex items-center gap-1 mt-0.5">
                                <Truck className="size-2.5" />
                                {batch.supplier.firstName} {batch.supplier.lastName}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center font-black opacity-60">
                          {batch.quantity}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span
                            className={cn(
                              'font-black',
                              batch.remainingQuantity === 0
                                ? 'opacity-30'
                                : 'text-emerald-600'
                            )}
                          >
                            {batch.remainingQuantity}
                          </span>
                          {sold > 0 && (
                            <span className="block text-[9px] font-bold opacity-40 uppercase">
                              {sold} sotilgan
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right font-bold whitespace-nowrap">
                          {batch.costPrice.toLocaleString()}{' '}
                          <span className="text-[10px] opacity-40">
                            {batch.currency?.symbol}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right font-black text-primary whitespace-nowrap">
                          {batch.costPriceBase.toLocaleString()}
                        </td>

                        <td className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className="rounded-lg text-[8px] font-black uppercase border-border/50"
                          >
                            {BatchSourceLabels[batch.source]}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            className="rounded-2xl font-bold text-xs uppercase"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Oldingi
          </Button>
          <span className="text-xs font-black opacity-40 uppercase tracking-widest">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            className="rounded-2xl font-bold text-xs uppercase"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Keyingi
          </Button>
        </div>
      )}
    </div>
  );
}
