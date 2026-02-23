'use client';

import { useState } from 'react';
import { usePurchaseStore } from '@/store/use-purchase-store';
import { PurchasesService } from '@/services/purchases.service';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Trash2, Plus, Minus, CreditCard,
  ShoppingCart, ChevronUp, X, Hourglass, Wallet, Package, AlertCircle
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

interface Props {
  onSuccess?: () => void;
}

export function PurchaseCheckoutPanel({ onSuccess }: Props) {
  const {
    items,
    updateQuantity,
    removeItem,
    supplierId,
    currencyId,
    kassaId,
    notes,
    setNotes,
    status,
    setStatus,
    initialPayment,
    setInitialPayment,
    getGrandTotal,
    reset,
    currency
  } = usePurchaseStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const grandTotal = getGrandTotal();
  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleCreatePurchase = async () => {
    if (!supplierId) return toast.error('Ta\'minotchini tanlang');
    if (!currencyId) return toast.error('Valyutani tanlang');
    if (items.length === 0) return toast.error('Savat bo‘sh');
    if ((status === 'PAID' || status === 'PARTIAL') && !kassaId) {
      return toast.error('To‘lov uchun kassani tanlang');
    }

    setIsSubmitting(true);
    try {
      const dto = {
        supplierId,
        currencyId,
        kassaId: (status === 'PAID' || status === 'PARTIAL') ? kassaId : undefined,
        status: status,
        notes: notes || undefined,
        initialPayment: status === 'PARTIAL' ? initialPayment : undefined,
        items: items.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString() : undefined,
        })),
      };

      await PurchasesService.create(dto);
      toast.success('Xarid muvaffaqiyatli yakunlandi');
      reset();
      setIsDrawerOpen(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message?.message || 'Xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StatusToggle = () => (
    <div className="flex p-1 bg-muted/40 rounded-2xl border border-white/5 mb-4">
      {(['DRAFT', 'PARTIAL', 'PAID'] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => setStatus(mode)}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all",
            status === mode ? "bg-background shadow-sm text-primary" : "opacity-40"
          )}
        >
          {mode === 'DRAFT' ? "Qarzga" : mode === 'PARTIAL' ? "Qisman" : "To'liq"}
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
          <div
            key={item.productVariantId}
            className="flex justify-between items-center gap-3 bg-muted/20 p-3 rounded-2xl border border-transparent"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{item.title}</p>
              <div className="flex flex-col mt-1">
                <div className="flex items-center gap-2">
                  {/* Чистая цена за единицу */}
                  <span className="text-[11px] font-black text-primary">
                  {((item.price - item.discount)).toLocaleString()}
                </span>

                  {/* Если есть скидка, показываем старую цену */}
                  {item.discount > 0 && (
                    <span className="text-[9px] text-muted-foreground line-through opacity-60">
                    {item.price.toLocaleString()}
                  </span>
                  )}
                </div>

                {/* Сумма скидки (не процент!) */}
                {item.discount > 0 && (
                  <span className="text-[8px] font-bold text-emerald-600 uppercase">
                  Chegirma: -{item.discount.toLocaleString()}
                </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-background rounded-lg p-1 border">
              <Button
                size="icon"
                variant="ghost"
                className="size-6"
                onClick={() => updateQuantity(item.productVariantId, item.quantity - 1)}
              >
                <Minus className="size-3" />
              </Button>
              <span className="text-xs font-black">{item.quantity}</span>
              <Button
                size="icon"
                variant="ghost"
                className="size-6"
                onClick={() => updateQuantity(item.productVariantId, item.quantity + 1)}
              >
                <Plus className="size-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-6 text-destructive"
                onClick={() => removeItem(item.productVariantId)}
              >
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
      <div className="hidden lg:flex flex-col h-full bg-background w-[400px]">
        <div className="p-6 border-b flex justify-between items-center bg-card/30">
          <h2 className="font-black uppercase text-[10px] opacity-50 tracking-widest italic">Xarid Savati</h2>
          <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded-lg uppercase">
            {totalItemsCount} dona
          </span>
        </div>

        <ScrollArea className="flex-1 px-6 ">
          <div className='py-4'>
            <CartList />
          </div>
        </ScrollArea>

        <div className="p-6 bg-muted/20 border-t space-y-4 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
          <StatusToggle />

          <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {status === 'PARTIAL' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-1">
                <label className="text-[9px] font-black uppercase opacity-40 ml-1 italic">Hozirgi to&apos;lov</label>
               <div className={'relative'}>
                 <Input
                   type="number"
                   placeholder="Summani kiriting..."
                   className="rounded-xl bg-background border-2 border-primary/20 h-12 font-black text-lg"
                   value={initialPayment}
                   onChange={(e) => setInitialPayment(Number(e.target.value))}
                 />
                 <span className={'absolute top-1/2 -translate-y-1/2 right-10'}>{currency?.symbol}</span>
               </div>
              </div>
            )}

            {(status === 'PAID' || status === 'PARTIAL') && !kassaId && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-destructive/10 text-destructive text-[10px] font-bold">
                <AlertCircle className="size-4" />
                Kassani tanlash majburiy
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase opacity-40 ml-1 italic">Izoh</label>
              <Textarea
                placeholder="Xarid haqida ma'lumot..."
                className="resize-none rounded-2xl bg-background border-none min-h-[80px] text-sm"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-end mb-4">
              <span className="text-[10px] font-black opacity-40 uppercase italic">Jami to&apos;lov</span>
              <span className="text-2xl font-black tracking-tighter text-primary">
                {grandTotal.toLocaleString()} {currency?.symbol}
              </span>
            </div>
            <Button
              className={cn(
                "w-full h-14 rounded-2xl text-sm font-black uppercase transition-all",
                status === 'PAID' ? "bg-emerald-600 hover:bg-emerald-700" :
                  status === 'PARTIAL' ? "bg-orange-600 hover:bg-orange-700" : ""
              )}
              onClick={handleCreatePurchase}
              disabled={isSubmitting || items.length === 0}
            >
              {isSubmitting ? "Yuklanmoqda..." : "Yakunlash"}
            </Button>
          </div>
        </div>
      </div>

      {/* --- MOBILE --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t z-50">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <div className="flex items-center gap-3">
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 h-14 rounded-2xl flex justify-between px-5 items-center border-2 border-primary/10 bg-background"
              >
                <div className="flex items-center gap-3">
                  <Package className="size-5" />
                  <span className="font-black text-lg">{grandTotal.toLocaleString()}</span>
                </div>
                <ChevronUp className={cn("size-5 transition-transform", isDrawerOpen && "rotate-180")} />
              </Button>
            </DrawerTrigger>
            <Button
              className="h-14 w-14 rounded-2xl"
              onClick={handleCreatePurchase}
              disabled={items.length === 0 || isSubmitting}
            >
              <CreditCard className="size-6" />
            </Button>
          </div>

          <DrawerContent className="max-h-[92vh] rounded-t-[3rem]">
            <div className="p-6 flex flex-col h-full overflow-hidden">
              <DrawerHeader className="p-0 mb-6 flex justify-between items-center">
                <DrawerTitle className="font-black uppercase tracking-widest text-xs opacity-50">
                  Xaridni rasmiylashtirish
                </DrawerTitle>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto space-y-6 pb-24 pr-1">
                <CartList />
                <div className="h-px bg-muted" />
                <StatusToggle />

                {status === 'PARTIAL' && (
                  <Input
                    type="number"
                    placeholder="Hozirgi to'lov summasi"
                    className="h-14 rounded-2xl bg-muted/40 border-none font-bold"
                    value={initialPayment}
                    onChange={(e) => setInitialPayment(Number(e.target.value))}
                  />
                )}

                <Textarea
                  placeholder="Izoh..."
                  className="rounded-2xl bg-muted/40 border-none min-h-[100px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
                <Button
                  className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/20"
                  onClick={handleCreatePurchase}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "..." : `Saqlash: ${grandTotal.toLocaleString()}`}
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}