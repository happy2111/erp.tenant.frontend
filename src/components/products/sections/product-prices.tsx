'use client';

import { useState } from 'react';
import { ProductPrice } from '@/schemas/product-prices.schema';
import { ProductPricesService } from '@/services/product-prices.service';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, Loader2, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import PriceFormDrawer from '../drawers/price-form-drawer';
import { cn } from '@/lib/utils';

export function ProductPrices({
                                productId,
                                initialPrices
                              }: {
  productId: string;
  initialPrices: ProductPrice[]
}) {
  const [prices, setPrices] = useState<ProductPrice[]>(initialPrices);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<ProductPrice | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (price: ProductPrice) => {
    setEditingPrice(price);
    setIsDrawerOpen(true);
  };

  const handleCreate = () => {
    setEditingPrice(undefined);
    setIsDrawerOpen(true);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Narxni o'chirishni xohlaysizmi?")) return;
    setDeletingId(id);
    try {
      await ProductPricesService.hardDelete(id);
      setPrices(prev => prev.filter(p => p.id !== id));
      toast.success("Narx muvaffaqiyatli o'chirildi");
    } catch (error) {
      toast.error("O'chirishda xatolik yuz berdi");
    } finally {
      setDeletingId(null);
    }
  };

  const onSuccess = (newPrice: ProductPrice) => {
    if (editingPrice) {
      setPrices(prev => prev.map(p => p.id === newPrice.id ? newPrice : p));
    } else {
      setPrices(prev => [...prev, newPrice]);
    }
    setIsDrawerOpen(false);
  };

  return (
    <div className="bg-card/40 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] p-6 shadow-xl space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-40 italic">Narxlar</h3>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Narx turlarini boshqarish</p>
        </div>
        <Button
          onClick={handleCreate}
          size="sm"
          className="rounded-xl h-9 bg-primary/10 hover:bg-primary/20 text-primary border-none shadow-none"
        >
          <Plus className="size-4 mr-2" />
          Qo'shish
        </Button>
      </div>

      <div className="space-y-3">
        {prices.length > 0 ? prices.map((price) => (
          <div
            key={price.id}
            className="group flex justify-between items-center p-4 rounded-[1.5rem] bg-background/40 border border-border/40 hover:border-primary/30 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Banknote className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-primary uppercase tracking-tighter italic">
                  {price.priceType}
                </span>
                <span className="text-lg font-black tracking-tighter italic">
                  {price.amount} <span className="text-sm opacity-60 font-medium not-italic">{price.currency?.symbol}</span>
                </span>
              </div>
            </div>

            <div className="flex gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="ghost" onClick={() => handleEdit(price)} className="size-8 rounded-lg">
                <Edit2 className="size-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete(price.id)}
                className="size-8 rounded-lg text-destructive hover:bg-destructive/10"
                disabled={deletingId === price.id}
              >
                {deletingId === price.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              </Button>
            </div>
          </div>
        )) : (
          <div className="py-10 text-center border-2 border-dashed border-border/20 rounded-[2rem]">
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-30 italic">Narxlar mavjud emas</span>
          </div>
        )}
      </div>

      <PriceFormDrawer
        productId={productId}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        editingPrice={editingPrice}
        onSuccess={onSuccess}
      />
    </div>
  );
}