'use client'

import { useState } from 'react';
import { usePosStore } from '@/store/use-pos-store';
import { SalesService } from '@/services/sales.service';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Trash2, Plus, Minus, CreditCard,
  ShoppingCart, ChevronUp, X
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer';

export function CheckoutPanel() {
  const { items, updateQuantity, removeItem, currencyId, customerId, kassaId, reset } = usePosStore();
  const [notes, setNotes] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const total = items.reduce((acc, item) => acc + item.total, 0);
  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const onCompleteSale = async () => {
    if (!currencyId) return toast.error("Выберите валюту");
    if (items.length === 0) return toast.error("Корзина пуста");

    try {
      await SalesService.create({
        currencyId,
        customerId: customerId || undefined,
        kassaId: kassaId || undefined,
        items: items.map(i => ({
          productVariantId: i.productVariantId,
          quantity: i.quantity,
          price: i.price,
        })),
        status: 'PAID',
        notes: notes || undefined
      });
      toast.success("Продажа успешно завершена");
      reset();
      setNotes('');
      setIsDrawerOpen(false);
    } catch (e) {
      toast.error("Ошибка при создании продажи");
    }
  };

  // Компонент списка товаров (общий для Desktop и Mobile)
  const CartList = () => (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 opacity-30">
          <ShoppingCart className="size-12 mb-2" />
          <p className="text-sm font-bold uppercase tracking-tighter">Корзина пуста</p>
        </div>
      ) : (
        items.map(item => (
          <div key={item.productVariantId} className="flex justify-between items-center gap-4 bg-muted/20 p-3 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-none truncate">{item.title}</p>
              <p className="text-[10px] font-black text-primary mt-1.5">
                {item.price.toLocaleString()} × {item.quantity}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-background rounded-xl p-1 shadow-sm border">
              <Button size="icon" variant="ghost" className="size-7 rounded-lg" onClick={() => updateQuantity(item.productVariantId, item.quantity - 1)}>
                <Minus className="size-3" />
              </Button>
              <span className="text-xs font-black w-6 text-center">{item.quantity}</span>
              <Button size="icon" variant="ghost" className="size-7 rounded-lg" onClick={() => updateQuantity(item.productVariantId, item.quantity + 1)}>
                <Plus className="size-3" />
              </Button>
              <div className="w-[1px] h-4 bg-muted mx-1" />
              <Button size="icon" variant="ghost" className="size-7 text-destructive hover:bg-destructive/10" onClick={() => removeItem(item.productVariantId)}>
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <>
      {/* --- DESKTOP VERSION --- */}
      <div className="hidden lg:flex flex-col h-full bg-background border-l w-[400px]">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="font-black uppercase tracking-[0.2em] text-xs opacity-50">Детали заказа</h2>
          <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded-lg">
            {totalItemsCount} ПОЗИЦИЙ
          </span>
        </div>

        <ScrollArea className="flex-1 px-6 py-4">
          <CartList />

          <div className="mt-8 space-y-3">
            <label className="text-[10px] font-black uppercase opacity-40 ml-1">Заметка к заказу</label>
            <Textarea
              placeholder="Введите комментарий..."
              className="resize-none rounded-2xl bg-muted/30 border-none focus-visible:ring-1 ring-primary min-h-[100px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </ScrollArea>

        <div className="p-6 bg-muted/30 border-t space-y-4">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[10px] font-black opacity-40 uppercase">Общая сумма</span>
              <span className="text-3xl font-black tracking-tighter">{total.toLocaleString()}</span>
            </div>
          </div>

          <Button
            className="w-full h-16 rounded-[1.5rem] text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
            onClick={onCompleteSale}
            disabled={items.length === 0}
          >
            <CreditCard className="mr-3 size-5" /> Завершить
          </Button>
        </div>
      </div>

      {/* --- MOBILE VERSION (Bottom Bar + Drawer) --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <div className="flex items-center gap-3">
            <DrawerTrigger asChild>
              <Button variant="outline" className="flex-1 h-14 rounded-2xl flex justify-between px-5 items-center border-2 border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <ShoppingCart className="size-5" />
                    {totalItemsCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-white text-[9px] font-black size-4 flex items-center justify-center rounded-full">
                        {totalItemsCount}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] font-black opacity-50 uppercase">Итого</span>
                    <span className="font-black text-lg">{total.toLocaleString()}</span>
                  </div>
                </div>
                <ChevronUp className={`size-5 transition-transform ${isDrawerOpen ? 'rotate-180' : ''}`} />
              </Button>
            </DrawerTrigger>

            <Button
              className="h-14 w-14 rounded-2xl shadow-lg shadow-primary/20"
              onClick={onCompleteSale}
              disabled={items.length === 0}
            >
              <CreditCard className="size-6" />
            </Button>
          </div>

          <DrawerContent className="max-h-[85vh] rounded-t-[2.5rem]">
            <DrawerHeader className="border-b pb-4">
              <div className="flex justify-between items-center">
                <DrawerTitle className="font-black uppercase tracking-widest text-sm">Ваша корзина</DrawerTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsDrawerOpen(false)}>
                  <X className="size-5" />
                </Button>
              </div>
            </DrawerHeader>

            <div className="p-6 overflow-y-auto">
              <CartList />

              <div className="mt-8 space-y-3 pb-20">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">Заметка к заказу</label>
                <Textarea
                  placeholder="Добавить комментарий к чеку..."
                  className="resize-none rounded-2xl bg-muted/50 border-none focus-visible:ring-1 ring-primary min-h-[80px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
              <Button
                className="w-full h-16 rounded-[1.5rem] text-lg font-black uppercase tracking-widest"
                onClick={onCompleteSale}
              >
                Оплатить {total.toLocaleString()}
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}