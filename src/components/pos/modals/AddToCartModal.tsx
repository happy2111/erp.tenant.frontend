'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductVariant } from '@/schemas/product-variants.schema';
import { ProductPricesService } from '@/services/product-prices.service';
import { usePosStore } from '@/store/use-pos-store';
import {
  Dialog, DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Minus,
  Plus,
  Tag,
  Loader2,
  AlertCircle,
  Package,
  ExternalLink, X
} from 'lucide-react';
import {
  PriceType,
  PriceTypeLabels,
  PriceTypeValues
} from '@/schemas/product-prices.schema';
import { cn } from '@/lib/utils';
import Link from "next/link";

interface Props {
  variant: ProductVariant | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AddToCartModal({ variant, isOpen, onClose }: Props) {
  const { currencyId, addItem } = usePosStore();

  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [selectedPriceType, setSelectedPriceType] = useState<PriceType | 'DEFAULT'>('DEFAULT');
  const [source, setSource] = useState<'special' | 'variant_default' | 'manual'>('manual');

  // Расчет доступного остатка из массива stocks
  const totalStock = variant?.stocks?.reduce((acc, s) => acc + (s.quantity || 0), 0) || 0;
  const isOutOfStock = totalStock <= 0;
  const isInsufficient = quantity > totalStock;

  // 1. ЗАПРОС ЦЕН ПРОДУКТА
  const { data: productPrices, isLoading: pricesLoading } = useQuery({
    queryKey: ['product-prices', variant?.productId, currencyId],
    queryFn: () => ProductPricesService.getAllAdmin({
      productId: variant?.productId,
      limit: 100
    }),
    enabled: !!variant && isOpen && !!currencyId,
  });

  const findPriceValue = (type: PriceType | 'DEFAULT'): number | null => {
    if (!variant) return null;
    if (type === 'DEFAULT') {
      return (variant.currencyId === currencyId && variant.defaultPrice)
        ? Number(variant.defaultPrice)
        : null;
    }
    const found = productPrices?.items.find(
      (p) => p.priceType === type && p.currencyId === currencyId
    );
    return found ? Number(found.amount) : null;
  };

  useEffect(() => {
    if (variant && isOpen && !pricesLoading) {
      const cashPrice = findPriceValue('CASH');
      if (cashPrice) {
        setPrice(cashPrice);
        setSelectedPriceType('CASH');
        setSource('special');
      } else {
        const defPrice = findPriceValue('DEFAULT');
        setPrice(defPrice || 0);
        setSelectedPriceType('DEFAULT');
        setSource(defPrice ? 'variant_default' : 'manual');
      }
      setQuantity(1);
    }
  }, [variant, isOpen, productPrices, pricesLoading, currencyId]);

  const handlePriceTypeChange = (type: PriceType | 'DEFAULT') => {
    const newPrice = findPriceValue(type);
    setSelectedPriceType(type);
    if (newPrice !== null) {
      setPrice(newPrice);
      setSource(type === 'DEFAULT' ? 'variant_default' : 'special');
    } else {
      setPrice(0);
      setSource('manual');
    }
  };

  const handleConfirm = () => {
    if (!variant || price <= 0 || isInsufficient) return;
    addItem(variant, price);
    if (quantity > 1) {
      usePosStore.getState().updateQuantity(variant.id, quantity);
    }
    onClose();
  };

  if (!variant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose} >

      <DialogContent showCloseButton={false} className="sm:max-w-[480px] p-0 pt-12 w-full max-h-[90vh] overflow-hidden rounded-[3rem] bg-card/60 backdrop-blur-2xl border-white/20 shadow-2xl">
        <DialogClose asChild>
          <Button className="absolute bg-primary top-4 right-4 h-10 w-10 rounded-full hover:bg-muted/30 transition">
            <X className="size-5 text-gray-500" />
          </Button>
        </DialogClose>
        <div className="p-3 sm:p-8 space-y-8 overflow-y-auto max-h-[calc(90vh-64px)]">

          <DialogHeader>
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-2 flex-1">
                <DialogTitle className="text-3xl text-left flex items-center gap-2 font-black tracking-tight leading-tight">
                  {variant.title}
                  <Link  href={`/product-variants/${variant.id}`} className='text-blue-500' target='_blank'><ExternalLink /></Link>
                </DialogTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="rounded-lg border-primary/20 bg-primary/5 text-primary text-[10px] font-bold">
                    {variant.sku || 'Без SKU'}
                  </Badge>
                  <Badge className={cn(
                    "rounded-lg border-none font-bold text-[10px]",
                    isOutOfStock ? "bg-destructive/20 text-destructive" : "bg-emerald-500/20 text-emerald-600"
                  )}>
                    <Package className="size-3 mr-1" />
                    На складе: {totalStock}
                  </Badge>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-8">
            {/* ТИПЫ ЦЕН */}
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase opacity-50 tracking-widest flex items-center gap-2 ml-1">
                <Tag className="size-3" /> Выберите тариф
              </Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedPriceType === 'DEFAULT' ? 'default' : 'outline'}
                  className="rounded-2xl text-[11px] font-black h-10 px-4 transition-all"
                  onClick={() => handlePriceTypeChange('DEFAULT')}
                  disabled={!variant.defaultPrice || variant.currencyId !== currencyId}
                >
                  Standart
                </Button>
                {PriceTypeValues.map((type) => (
                  <Button
                    key={type}
                    variant={selectedPriceType === type ? 'default' : 'outline'}
                    className="rounded-2xl text-[11px] font-black h-10 px-4 transition-all"
                    onClick={() => handlePriceTypeChange(type)}
                    disabled={!productPrices?.items.some(p => p.priceType === type && p.currencyId === currencyId)}
                  >
                    {PriceTypeLabels[type]} {/* ← вот здесь используем узбекскую локализацию */}
                  </Button>
                ))}
              </div>
            </div>

            {/* КОЛИЧЕСТВО И ЦЕНА */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase opacity-50 ml-1">Количество</Label>
                <div className={cn(
                  "flex items-center justify-between bg-muted/40 rounded-3xl p-1.5 border transition-colors",
                  isInsufficient && "border-destructive/50 bg-destructive/5"
                )}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl size-10"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className={cn("font-black text-2xl", isInsufficient && "text-destructive")}>
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl size-10"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= totalStock}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                {isInsufficient && (
                  <p className="text-[10px] text-destructive font-bold flex items-center gap-1 ml-2">
                    <AlertCircle className="size-3" /> Недостаточно на складе
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase opacity-50 ml-1">Цена за единицу</Label>
                <div className="relative">
                  <Input
                    type="text"                     // text для контроля через pattern
                    inputMode="decimal"             // цифровая клавиатура с точкой на мобильных
                    pattern="^\d*\.?\d{0,2}$"      // только числа с 0-2 знаками после точки
                    className="h-14 rounded-3xl bg-muted/40 border-none font-black text-xl focus-visible:ring-2 ring-primary/20 px-6"
                    value={price}
                    onChange={(e) => {
                      // фильтруем ввод: только цифры и максимум 2 знака после точки
                      const value = e.target.value;
                      if (/^\d*\.?\d{0,2}$/.test(value)) {
                        setPrice(Number(value));
                        setSource('manual');
                      }
                    }}
                  />
                </div>
              </div>

            </div>

            {/* ИТОГОВАЯ ПАНЕЛЬ */}
            <div className="p-6 bg-primary/10 rounded-[2.5rem] border border-primary/20 flex justify-between items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />
              <div className="flex flex-col relative z-10">
                <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest leading-none mb-1">К оплате</span>
                <span className="text-4xl font-black text-primary tracking-tighter">
                  {(price * quantity).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col items-end gap-2 relative z-10">
                <Badge className={cn(
                  "rounded-xl border-none font-black text-[9px] px-3",
                  source === 'special' ? "bg-emerald-500 text-white" :
                    source === 'variant_default' ? "bg-blue-500 text-white" : "bg-orange-500 text-white"
                )}>
                  {source === 'special' ? 'ПРАЙС-ЛИСТ' : source === 'variant_default' ? 'СТАНДАРТ' : 'ВРУЧНУЮ'}
                </Badge>
              </div>
            </div>

            <Button
              className="w-full h-20 rounded-[2rem] text-xl font-black uppercase transition-all active:scale-[0.98]"
              disabled={price <= 0 || pricesLoading || isInsufficient || isOutOfStock}
              onClick={handleConfirm}
            >
              {pricesLoading ? (
                <Loader2 className="animate-spin size-6" />
              ) : isOutOfStock ? (
                "Нет в наличии"
              ) : (
                "В корзину"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}