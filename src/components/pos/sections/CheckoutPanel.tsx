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
import { cn } from "@/lib/utils";
import { InstallmentForm } from "@/components/pos/InstallmentForm";

interface CheckoutPanelProps {
  onSaleComplete?: () => void;
}
type PaymentMode = 'FULL' | 'INSTALLMENT';

export function CheckoutPanel({ onSaleComplete }: CheckoutPanelProps) {
  const { items, updateQuantity, removeItem, currencyId, customerId, kassaId, reset } = usePosStore();
  const currency = usePosStore(state => state.currency);
  const [notes, setNotes] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('FULL');
  const [initialPayment, setInitialPayment] = useState(0);
  const [totalMonths, setTotalMonths] = useState(12);

  const total = items.reduce((acc, item) => acc + item.total, 0);
  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const onCompleteSale = async () => {
    if (!currencyId) return toast.error("Valyutani tanlang");
    if (items.length === 0) return toast.error("Savat bo‘sh");
    if (paymentMode === 'INSTALLMENT' && !customerId) return toast.error("Mijoz tanlanishi shart");

    try {
      await SalesService.create({
        currencyId,
        customerId: customerId || undefined,
        kassaId: kassaId || undefined,
        status: 'PAID',
        items: items.map(i => ({
          productVariantId: i.productVariantId,
          quantity: i.quantity,
          price: i.price,
          ...(i.instanceId ? { instanceId: i.instanceId } : {})
        })),
        notes: notes || undefined,
        ...(paymentMode === 'INSTALLMENT' && {
          installment: {
            totalAmount: total - initialPayment,
            initialPayment,
            totalMonths,
            dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
          }
        })
      });

      toast.success("Sotuv muvaffaqiyatli yakunlandi");
      reset();
      setNotes('');
      setIsDrawerOpen(false);
      if (onSaleComplete) onSaleComplete();
    } catch (e) {
      toast.error("Xatolik yuz berdi");
    }
  };

  const PaymentToggle = () => (
    <div className="flex p-1 bg-muted/40 rounded-2xl border border-white/5 mb-4">
      {(['FULL', 'INSTALLMENT'] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => setPaymentMode(mode)}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            paymentMode === mode ? "bg-background shadow-sm text-primary" : "opacity-40"
          )}
        >
          {mode === 'FULL' ? "Naqd/Karta" : "Bo'lib to'lash"}
        </button>
      ))}
    </div>
  );

  const CartList = () => (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 opacity-20">
          <ShoppingCart className="size-10 mb-2" />
          <p className="text-[10px] font-bold uppercase">Savat bo‘sh</p>
        </div>
      ) : (
        items.map(item => (
          <div key={item.instanceId || item.productVariantId} className="flex justify-between items-center gap-3 bg-muted/20 p-3 rounded-2xl border border-transparent">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{item.title}</p>
              <p className="text-[10px] font-black text-primary mt-1">
                {item.price.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-background rounded-lg p-1 border">
              <Button size="icon" variant="ghost" className="size-6" onClick={() => updateQuantity(item.productVariantId, item.quantity - 1, item.instanceId)}>
                <Minus className="size-3" />
              </Button>
              <span className="text-xs font-black">{item.quantity}</span>
              <Button size="icon" variant="ghost" className="size-6" onClick={() => updateQuantity(item.productVariantId, item.quantity + 1, item.instanceId)}>
                <Plus className="size-3" />
              </Button>
              <Button size="icon" variant="ghost" className="size-6 text-destructive" onClick={() => removeItem(item.productVariantId, item.instanceId)}>
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
      {/* --- DESKTOP --- */}
      <div className="hidden lg:flex flex-col h-full bg-background border-l w-[400px]">
        <div className="p-6 border-b flex justify-between items-center bg-card/30">
          <h2 className="font-black uppercase text-[10px] opacity-50 tracking-widest">Savat</h2>
          <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded-lg uppercase">
            {totalItemsCount} dona
          </span>
        </div>

        {/* Прокручиваемый список товаров */}
        <ScrollArea className="flex-1 px-6">
          <div className='py-4'>
            <CartList />
          </div>
        </ScrollArea>

        {/* Фиксированная нижняя часть с формой */}
        <div className="p-6 bg-muted/20 border-t space-y-4 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
          <PaymentToggle />

          <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {paymentMode === 'FULL' ? (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-1">
                <label className="text-[9px] font-black uppercase opacity-40 ml-1">Izoh</label>
                <Textarea
                  placeholder="Izoh..."
                  className="resize-none rounded-2xl bg-background border-none min-h-[80px] text-sm"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            ) : (
              <InstallmentForm
                total={total}
                initialPayment={initialPayment}
                setInitialPayment={setInitialPayment}
                totalMonths={totalMonths}
                setTotalMonths={setTotalMonths}
              />
            )}
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-end mb-4">
              <span className="text-[10px] font-black opacity-40 uppercase">Jami</span>
              <span className="text-2xl font-black tracking-tighter text-primary">{total.toLocaleString()}</span>
            </div>
            <Button className="w-full h-14 rounded-2xl text-sm font-black uppercase tracking-[0.2em]" onClick={onCompleteSale} disabled={items.length === 0}>
              Yakunlash
            </Button>
          </div>
        </div>
      </div>

      {/* --- MOBILE --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t z-50">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <div className="flex items-center gap-3">
            <DrawerTrigger asChild>
              <Button variant="outline" className="flex-1 h-14 rounded-2xl flex justify-between px-5 items-center border-2 border-primary/10 bg-background">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="size-5" />
                  <span className="font-black text-lg">{total.toLocaleString()}</span>
                </div>
                <ChevronUp className={cn("size-5 transition-transform", isDrawerOpen && "rotate-180")} />
              </Button>
            </DrawerTrigger>
            <Button className="h-14 w-14 rounded-2xl" onClick={onCompleteSale} disabled={items.length === 0}>
              <CreditCard className="size-6" />
            </Button>
          </div>

          <DrawerContent className="max-h-[92vh] rounded-t-[3rem]">
            <div className="p-6 flex flex-col h-full overflow-hidden">
              <DrawerHeader className="p-0 mb-6 flex justify-between items-center">
                <DrawerTitle className="font-black uppercase tracking-widest text-xs opacity-50">Savat va To&apos;lov</DrawerTitle>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto space-y-6 pb-24 pr-1">
                <CartList />
                <div className="h-px bg-muted" />
                <PaymentToggle />
                {paymentMode === 'FULL' ? (
                  <Textarea
                    placeholder="Izoh..."
                    className="rounded-2xl bg-muted/40 border-none min-h-[100px]"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                ) : (
                  <InstallmentForm
                    total={total}
                    currencySymbol={currency?.symbol}
                    initialPayment={initialPayment}
                    setInitialPayment={setInitialPayment}
                    totalMonths={totalMonths}
                    setTotalMonths={setTotalMonths}
                  />
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
                <Button className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-widest" onClick={onCompleteSale}>
                  To&apos;lash {total.toLocaleString()}
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}