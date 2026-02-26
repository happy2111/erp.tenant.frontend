'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductVariantsService } from '@/services/product-variants.service';
import { usePurchaseStore } from '@/store/use-purchase-store';
import { Input } from '@/components/ui/input';
import { Search, Plus, Package } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {AddToPurchaseModal} from "@/components/purchases/sections/AddToPurchaseModal";
import Link from "next/link";

export function ProductSearchAndAdd() {
  const [search, setSearch] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<number | ''>('');
  const [discount, setDiscount] = useState<number | ''>(0);
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const { addItem } = usePurchaseStore();

  const { data: variants, isLoading } = useQuery({
    queryKey: ['purchase-variants', search],
    queryFn: () => ProductVariantsService.getAllAdmin({ search, limit: 30 }).then((r) => r.items),
  });

  const handleAdd = () => {
    if (!selectedVariant) return;
    if (!price || price <= 0) {
      toast.error('Narxni to‘g‘ri ko‘rsating');
      return;
    }

    addItem({
      productVariantId: selectedVariant.id,
      title: selectedVariant.title,
      sku: selectedVariant.sku,
      price: Number(price),
      discount: Number(discount) || 0,
      quantity: Number(quantity),
      total: Number(quantity) * Number(price),
      batchNumber: batchNumber || undefined,
      expiryDate: expiryDate || undefined,
    });

    toast.success('Mahsulot xaridga qo‘shildi');
    setSelectedVariant(null);
    setQuantity(1); setPrice(''); setDiscount(0); setBatchNumber(''); setExpiryDate('');
  };

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-5 opacity-40 group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Mahsulot nomi yoki SKU bo‘yicha qidirish..."
          className="pl-14 h-10 rounded-[2rem] bg-card/40 backdrop-blur-xl border-border/50 shadow-none text-lg font-medium focus-visible:ring-primary/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {isLoading ? (
          <div className="col-span-full flex flex-col items-center py-20 opacity-40">
            <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full mb-4" />
            <p className="font-black italic uppercase tracking-widest text-xs">Yuklanmoqda...</p>
          </div>
        ) : variants?.length ? (
          variants.map((v) => (
            <div
              key={v.id}
              onClick={() => setSelectedVariant(v)}
              className={cn(
                "group relative p-5 rounded-[2.5rem] bg-card/40 border border-border/50 transition-all duration-300",
                "hover:bg-card/80 hover:scale-[1.02] cursor-pointer overflow-hidden shadow-none active:scale-95"
              )}
            >
              <div className="space-y-3">
                <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <Package size={20} />
                </div>
                <div>
                <span className="text-[10px] font-black opacity-30 uppercase tracking-tighter line-clamp-1">
                  {v.sku || 'SKU yo‘q'}
                </span>
                  <h3 className="font-bold text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
                    {v.title}
                  </h3>
                </div>
                <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                <span className="text-primary font-black text-sm tracking-tight">
                  {v.defaultPrice ? `${Number(v.defaultPrice).toLocaleString()} ${String(v?.currency?.symbol)}` : '---'}
                </span>
                  <div className="size-7 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                    <Plus size={16} strokeWidth={3} />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 opacity-30 font-bold uppercase tracking-widest text-xs">
            Mahsulotlar topilmadi
          </div>
        )}

        <Link
          href='/product-variants/create'
          className="p-6 rounded-[2.5rem] border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 group min-h-[160px]"
        >
          <div className="size-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm">
            <Plus size={24} />
          </div>
          <span className="text-[10px] font-black uppercase opacity-40 group-hover:opacity-100 tracking-tighter">
            Yangi variant yaratish
          </span>
        </Link>
      </div>


      <AddToPurchaseModal
        variant={selectedVariant}
        isOpen={!!selectedVariant}
        onClose={() => setSelectedVariant(null)}
      />
    </div>
  );
}