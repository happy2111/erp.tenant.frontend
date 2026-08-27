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
  ShoppingCart, ChevronUp, Package, AlertCircle, Info
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
    confirmNow,
    setConfirmNow,
    payFromKassa,
    setPayFromKassa,
    getGrandTotal,
    reset,
    currency
  } = usePurchaseStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // Ручной курс: нужен, когда курса на дату накладной нет в справочнике
  const [manualRate, setManualRate] = useState('');

  const grandTotal = getGrandTotal();
  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const needsKassa = confirmNow && payFromKassa;

  const handleCreatePurchase = async () => {
    if (!supplierId) return toast.error('Ta\'minotchini tanlang');
    if (!currencyId) return toast.error('Valyutani tanlang');
    if (items.length === 0) return toast.error('Savat bo‘sh');
    if (needsKassa && !kassaId) {
      return toast.error('To‘lov uchun kassani tanlang');
    }

    setIsSubmitting(true);
    try {
      // Шаг 1 — документ всегда создаётся черновиком
      const purchase = await PurchasesService.create({
        supplierId,
        currencyId,
        kassaId: kassaId || undefined,
        notes: notes || undefined,
        items: items.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate
            ? new Date(item.expiryDate).toISOString()
            : undefined,
          instances: item.instances?.map((inst) => ({
            serialNumber: inst.serialNumber,
            price: inst.price,
            discount: inst.discount,
            attributeValueIds: inst.attributeValueIds,
          })),
        })),
      });

      // Шаг 2 — проведение: тут появляются партии и растёт остаток
      if (confirmNow) {
        await PurchasesService.confirmPurchase(purchase.id, {
          kassaId: payFromKassa ? kassaId : undefined,
          exchangeRate: manualRate ? Number(manualRate) : undefined,
        });
        toast.success(
          payFromKassa
            ? 'Xarid o‘tkazildi va to‘landi'
            : 'Tovar omborga qabul qilindi (to‘lov kutilmoqda)'
        );
      } else {
        toast.success('Qoralama saqlandi');
      }

      reset();
      setManualRate('');
      setIsDrawerOpen(false);
      onSuccess?.();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string | { message?: string } } } })
          ?.response?.data?.message;
      toast.error(
        (typeof message === 'string' ? message : message?.message) ||
        'Xatolik yuz berdi'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Черновик / приход без оплаты / приход с оплатой
  const ModeToggle = () => (
    <div className="flex p-1 bg-muted/40 rounded-2xl border border-white/5 mb-4">
      {([
        { key: 'draft', label: 'Qoralama' },
        { key: 'receive', label: 'Qabul' },
        { key: 'pay', label: 'Qabul + to‘lov' },
      ] as const).map((mode) => {
        const active =
          (mode.key === 'draft' && !confirmNow) ||
          (mode.key === 'receive' && confirmNow && !payFromKassa) ||
          (mode.key === 'pay' && confirmNow && payFromKassa);

        return (
          <button
            key={mode.key}
            onClick={() => {
              setConfirmNow(mode.key !== 'draft');
              setPayFromKassa(mode.key === 'pay');
            }}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all",
              active ? "bg-background shadow-sm text-primary" : "opacity-40"
            )}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );

  // Что именно произойдёт при нажатии кнопки — иначе разница между
  // тремя режимами не читается
  const ModeHint = () => (
    <div className="flex items-start gap-2 p-3 rounded-2xl bg-muted/30 text-[10px] font-bold leading-relaxed opacity-70">
      <Info className="size-3.5 shrink-0 mt-0.5" />
      <span>
        {!confirmNow
          ? 'Hujjat saqlanadi, ombor va kassa o‘zgarmaydi. Keyinroq o‘tkazasiz.'
          : payFromKassa
            ? 'Tovar partiyalar bilan omborga kiradi, summa kassadan yechiladi.'
            : 'Tovar partiyalar bilan omborga kiradi, to‘lov keyinroq.'}
      </span>
    </div>
  );

  // Курс фиксируется в момент проведения — потом его уже не пересчитать.
  // Это элемент, а не компонент: вложенный компонент пересоздавался бы на
  // каждый рендер и поле теряло бы фокус после первого символа.
  const rateInput = (
    <div className="space-y-2">
      <label className="text-[9px] font-black uppercase opacity-40 ml-1 italic">
        Kurs (ixtiyoriy)
      </label>
      <Input
        type="number"
        inputMode="decimal"
        placeholder="Kurslar spravochnigidan olinadi"
        className="rounded-xl bg-background border-2 border-primary/20 h-12 font-bold"
        value={manualRate}
        onChange={(e) => setManualRate(e.target.value)}
      />
      <p className="text-[9px] opacity-40 font-bold ml-1">
        Bo‘sh qoldirsangiz — hujjat sanasidagi kurs olinadi
      </p>
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
        items.map((item) => {
          const isNamuna = !!item.instances?.length;
          return (
            <div
              key={item.productVariantId}
              className="bg-muted/20 p-3 rounded-2xl border border-transparent space-y-2"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-bold truncate">{item.title}</p>
                    {isNamuna && (
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md bg-violet-500/15 text-violet-600">
                        Namuna
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col mt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-primary">
                        {isNamuna
                          ? item.total.toLocaleString()
                          : (item.price - item.discount).toLocaleString()}
                      </span>
                      {!isNamuna && item.discount > 0 && (
                        <span className="text-[9px] text-muted-foreground line-through opacity-60">
                          {item.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {!isNamuna && item.discount > 0 && (
                      <span className="text-[8px] font-bold text-emerald-600 uppercase">
                        Chegirma: -{item.discount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-background rounded-lg p-1 border">
                  {!isNamuna && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6"
                        onClick={() =>
                          updateQuantity(item.productVariantId, item.quantity - 1)
                        }
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="text-xs font-black">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6"
                        onClick={() =>
                          updateQuantity(item.productVariantId, item.quantity + 1)
                        }
                      >
                        <Plus className="size-3" />
                      </Button>
                    </>
                  )}
                  {isNamuna && (
                    <span className="text-xs font-black px-2">
                      {item.quantity} dona
                    </span>
                  )}
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

              {isNamuna && (
                <div className="pl-1 space-y-1 border-t border-border/30 pt-2">
                  {item.instances!.map((inst) => (
                    <div
                      key={inst.serialNumber}
                      className="flex justify-between text-[10px] font-mono opacity-70"
                    >
                      <span className="truncate">{inst.serialNumber}</span>
                      <span className="font-bold shrink-0 ml-2">
                        {(
                          (inst.price ?? item.price) -
                          (inst.discount ?? item.discount)
                        ).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  const submitLabel = !confirmNow
    ? 'Qoralama saqlash'
    : payFromKassa
      ? 'O‘tkazish va to‘lash'
      : 'Omborga qabul qilish';

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
          <ModeToggle />

          <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
            <ModeHint />

            {confirmNow && rateInput}

            {needsKassa && !kassaId && (
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
                confirmNow && payFromKassa ? "bg-emerald-600 hover:bg-emerald-700" :
                  confirmNow ? "bg-violet-600 hover:bg-violet-700" : ""
              )}
              onClick={handleCreatePurchase}
              disabled={isSubmitting || items.length === 0}
            >
              {isSubmitting ? "Yuklanmoqda..." : submitLabel}
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
                <ModeToggle />
                <ModeHint />

                {confirmNow && rateInput}

                {needsKassa && !kassaId && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-destructive/10 text-destructive text-[10px] font-bold">
                    <AlertCircle className="size-4" />
                    Kassani tanlash majburiy
                  </div>
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
                  {isSubmitting ? "..." : `${submitLabel}: ${grandTotal.toLocaleString()}`}
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}
