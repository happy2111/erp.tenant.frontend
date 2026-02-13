'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePurchaseStore } from '@/store/use-purchase-store';
import { cn } from '@/lib/utils';

export function PurchaseCartList() {
  const { items, updateQuantity, updatePrice, updateDiscount, removeItem } =
    usePurchaseStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <div className="text-7xl opacity-20 mb-4">🛒</div>
        <p className="text-xl font-medium mb-2">Корзина пуста</p>
        <p className="text-sm">Добавьте товары через поиск выше</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const itemTotalWithoutDiscount = item.quantity * item.price;
        const itemDiscountTotal = item.quantity * item.discount;

        return (
          <div
            key={item.productVariantId}
            className="bg-muted/40 rounded-2xl p-4 border border-border/50"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-medium line-clamp-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.sku || '—'} • {item.batchNumber || 'Без партии'}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => removeItem(item.productVariantId)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Количество */}
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Кол-во</label>
                <div className="flex border rounded-xl overflow-hidden bg-background">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-none border-r"
                    onClick={() => updateQuantity(item.productVariantId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <div className="flex-1 flex items-center justify-center font-medium">
                    {item.quantity}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-none border-l"
                    onClick={() => updateQuantity(item.productVariantId, item.quantity + 1)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Цена за единицу */}
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Цена</label>
                <Input
                  type="number"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => updatePrice(item.productVariantId, Number(e.target.value) || 0)}
                  className="h-9 text-center rounded-xl"
                />
              </div>

              {/* Скидка за единицу */}
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Скидка</label>
                <Input
                  type="number"
                  step="0.01"
                  value={item.discount}
                  onChange={(e) => updateDiscount(item.productVariantId, Number(e.target.value) || 0)}
                  className="h-9 text-center rounded-xl"
                />
              </div>

              {/* Итог позиции */}
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Сумма</label>
                <div className="h-9 flex items-center justify-end font-medium text-primary pr-2">
                  {item.total.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Маленькая строка с расчётом скидки (только если есть) */}
            {itemDiscountTotal > 0 && (
              <div className="mt-2 text-xs text-destructive text-right">
                Скидка: -{itemDiscountTotal.toLocaleString()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}