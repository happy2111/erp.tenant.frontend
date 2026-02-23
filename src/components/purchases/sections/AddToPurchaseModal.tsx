'use client';

import { useState, useEffect } from 'react';
import { ProductVariant } from '@/schemas/product-variants.schema';
import { usePurchaseStore } from '@/store/use-purchase-store';
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
  Package,
  ExternalLink, X,
  Truck,
  Calendar,
  Barcode,
  Tag, // Используем иконку ценника вместо процента
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from "next/link";
import { toast } from 'sonner';

const PurchaseTotalPanel = ({ total }: { total: number }) => (
  <div className="p-8 bg-primary/10 rounded-[2.5rem] border border-primary/20 flex justify-between items-center relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
    <div className="flex flex-col relative z-10">
      <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] leading-none mb-2 italic">JAMI TO‘LOV</span>
      <span className="text-5xl font-black text-primary tracking-tighter italic">
        {total.toLocaleString()}
      </span>
    </div>
    <div className="flex flex-col items-end gap-2 relative z-10">
      <Badge className="bg-primary text-white rounded-xl border-none font-black text-[9px] px-3 h-6 italic tracking-tighter shadow-[0_0_15px_rgba(var(--primary),0.4)]">
        XARID
      </Badge>
    </div>
  </div>
);

interface Props {
  variant: ProductVariant | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AddToPurchaseModal({ variant, isOpen, onClose }: Props) {
  const { addItem } = usePurchaseStore();

  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => {
    if (variant && isOpen) {
      setPrice(Number(variant.defaultPrice) || 0);
      setDiscount(0);
      setQuantity(1);
      setBatchNumber('');
      setExpiryDate('');
    }
  }, [variant, isOpen]);

  const handleConfirm = () => {
    if (!variant || price < 0 || quantity <= 0) {
      toast.error('Narx va miqdorni to‘g‘ri kiriting');
      return;
    }

    if (discount > price) {
      toast.error('Chegirma narxdan katta bo‘lishi mumkin emas');
      return;
    }

    addItem({
      productVariantId: variant.id,
      title: variant.title,
      sku: variant.sku || '',
      price: price,
      discount: discount,
      quantity: quantity,
      total: (price - discount) * quantity,
      batchNumber: batchNumber || undefined,
      expiryDate: expiryDate || undefined,
    });

    toast.success('Mahsulot xarid ro‘yxatiga qo‘shildi');
    onClose();
  };

  if (!variant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-[550px] p-0 w-full overflow-hidden rounded-[3rem] border-none bg-card/95 backdrop-blur-3xl shadow-2xl">
        <DialogClose asChild>
          <Button variant="ghost" className="absolute top-6 right-6 h-12 w-12 rounded-2xl bg-muted/50 hover:bg-destructive/10 hover:text-destructive transition-all z-50">
            <X className="size-6 stroke-[3px]" />
          </Button>
        </DialogClose>

        <div className="p-8 sm:p-10 space-y-8 overflow-y-auto max-h-[90vh] custom-scrollbar">
          <DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <Truck size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase opacity-40 italic tracking-widest">Omborga qabul qilish</span>
                  <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter leading-none flex items-center gap-2">
                    {variant.title}
                    <Link href={`/product-variants/${variant.id}`} target='_blank' className="opacity-20 hover:opacity-100 hover:text-primary transition-all">
                      <ExternalLink size={18} />
                    </Link>
                  </DialogTitle>
                </div>
              </div>
              <Badge variant="outline" className="rounded-xl border-border/60 bg-muted/30 text-muted-foreground text-[10px] font-black uppercase px-3 h-7">
                SKU: {variant.sku || 'YO‘Q'}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* MIQDOR */}
              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase opacity-40 italic ml-1">Miqdori (Soni)</Label>
                <div className="flex items-center justify-between bg-muted/30 rounded-[2rem] p-2 border-2 border-transparent transition-all">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl size-12 hover:bg-background"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="size-5 stroke-[3px]" />
                  </Button>
                  <span className="font-black text-3xl italic tracking-tighter">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl size-12 hover:bg-background"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="size-5 stroke-[3px]" />
                  </Button>
                </div>
              </div>

              {/* NARX */}
              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase opacity-40 italic ml-1">Xarid narxi (Dona)</Label>
                <div className="relative group">
                  <Input
                    type="number"
                    className="h-16 rounded-[2rem] bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-background transition-all font-black text-2xl px-6"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-all">
                    <Package size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* СКИДКА НА ЕДИНИЦУ */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <Label className="text-[11px] font-black uppercase opacity-40 italic flex items-center gap-2">
                  <Tag size={13} /> Chegirma (Dona uchun summa)
                </Label>
                {discount > 0 && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                    Netto: {(price - discount).toLocaleString()}
                  </span>
                )}
              </div>
              <div className="relative group">
                <Input
                  type="number"
                  placeholder="0.00"
                  className="h-16 rounded-[2rem] bg-muted/30 border-2 border-transparent focus:border-emerald-500/30 focus:bg-background transition-all font-black text-2xl px-6 text-emerald-600"
                  value={discount === 0 ? '' : discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500/30 group-focus-within:text-emerald-500 transition-all">
                  <TrendingDown size={22} />
                </div>
              </div>
            </div>

            {/* ПАРТИЯ И СРОК */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase opacity-40 italic ml-1 flex items-center gap-2">
                  <Barcode size={14} /> Partiya №
                </Label>
                <Input
                  placeholder="B-2024-001"
                  className="h-14 rounded-2xl bg-muted/30 border-none font-bold px-6"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase opacity-40 italic ml-1 flex items-center gap-2">
                  <Calendar size={14} /> Yaroqlilik muddati
                </Label>
                <Input
                  type="date"
                  className="h-14 rounded-2xl bg-muted/30 border-none font-bold px-6"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>

            <PurchaseTotalPanel total={(price - discount) * quantity} />

            <Button
              className="w-full h-24 rounded-[2.5rem] text-2xl font-black italic uppercase transition-all active:scale-[0.98]"
              disabled={price < 0 || quantity <= 0}
              onClick={handleConfirm}
            >
              <Plus className="mr-3 size-6 stroke-[4px]" />
              Xaridga qo‘shish
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}