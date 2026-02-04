'use client';

import { useState } from 'react';
import { ProductCategory } from '@/schemas/product-categories.schema';
import { ProductCategoriesService } from '@/services/product-categories.service';
import { Button } from '@/components/ui/button';
import { Plus, X, Hash, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CategoryAddDrawer } from '../drawers/category-add-drawer';

interface Props {
  productId: string;
  initialCategories: any[]; // массив связей с категориями
}

export function ProductCategories({ productId, initialCategories }: Props) {
  const [links, setLinks] = useState<any[]>(initialCategories || []);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleRemove = async (categoryId: string) => {
    setDeletingId(categoryId);
    try {
      await ProductCategoriesService.remove({ productId, categoryId });
      setLinks((prev) => prev.filter((item) => (item.category?.id || item.categoryId) !== categoryId));
      toast.success("Kategoriya olib tashlandi");
    } catch (error) {
      toast.error("O'chirishda xatolik");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSuccess = (newLink: any) => {
    setLinks((prev) => [...prev, newLink]);
    setIsDrawerOpen(false);
  };

  return (
    <div className="bg-card/40 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] p-6 shadow-xl space-y-4 animate-in fade-in duration-700 delay-100">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-40 italic">Kategoriyalar</h3>
        </div>
        <Button
          onClick={() => setIsDrawerOpen(true)}
          size="sm"
          className="rounded-xl h-9 bg-primary/10 hover:bg-primary/20 text-primary border-none shadow-none"
        >
          <Plus className="size-4 mr-2" />
          Biriktirish
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[40px]">
        {links.length > 0 ? links.map((link) => {
          const cat = link.category || link; // подстраховка для разных структур ответа
          return (
            <div
              key={cat.id}
              className="group flex items-center gap-2 px-4 py-2 rounded-2xl bg-background/40 border border-border/40 hover:border-primary/30 transition-all duration-300"
            >
              <Hash className="size-3 text-primary opacity-50" />
              <span className="text-[11px] font-black italic uppercase tracking-tighter">
                {cat.name}
              </span>
              <button
                onClick={() => handleRemove(cat.id)}
                disabled={deletingId === cat.id}
                className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
              >
                {deletingId === cat.id ? <Loader2 className="size-3 animate-spin" /> : <X className="size-3" />}
              </button>
            </div>
          );
        }) : (
          <div className="w-full py-4 text-center border-2 border-dashed border-border/10 rounded-[1.5rem]">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-30 italic">
              Kategoriya tanlanmagan
            </span>
          </div>
        )}
      </div>

      <CategoryAddDrawer
        productId={productId}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSuccess={handleSuccess}
        existingIds={links.map(l => l.category?.id || l.categoryId)}
      />
    </div>
  );
}