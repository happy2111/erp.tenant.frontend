'use client';

import { useState, useEffect } from 'react';
import { CategoriesService } from '@/services/categories.service';
import { ProductCategoriesService } from '@/services/product-categories.service';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Hash, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function CategoryAddDrawer({ productId, open, onOpenChange, onSuccess, existingIds }: any) {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open, search]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await CategoriesService.getAllAdmin({ search, limit: 10 });
      setCategories(res.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (category: any) => {
    if (existingIds.includes(category.id)) return;

    setSubmittingId(category.id);
    try {
      const result = await ProductCategoriesService.create({
        productId,
        categoryId: category.id
      });
      toast.success(`${category.name} biriktirildi`);
      onSuccess(result);
    } catch (e) {
      toast.error("Biriktirishda xatolik");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-background/80 backdrop-blur-2xl border-t border-border/50 max-h-[85vh]">
        <div className="mx-auto w-full max-w-md flex flex-col h-full">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-black tracking-tighter italic uppercase">
              Kategoriyaga qo'shish
            </DrawerTitle>
          </DrawerHeader>

          <div className="p-4 space-y-4 flex flex-col h-full overflow-hidden">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 opacity-30" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Qidiruv..."
                className="h-12 pl-12 rounded-2xl bg-card/40 border-border/40 font-bold"
              />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2 min-h-[300px]">
              {loading && categories.length === 0 ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin opacity-20" /></div>
              ) : categories.map((cat) => {
                const isAdded = existingIds.includes(cat.id);
                return (
                  <div
                    key={cat.id}
                    onClick={() => !isAdded && handleSelect(cat)}
                    className={cn(
                      "group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                      isAdded
                        ? "bg-primary/5 border-primary/20 opacity-50 cursor-not-allowed"
                        : "bg-card/20 border-border/20 hover:border-primary/40 hover:bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Hash className={cn("size-4 transition-colors", isAdded ? "text-primary" : "opacity-30")} />
                      <span className="text-sm font-black uppercase italic tracking-tight">{cat.name}</span>
                    </div>
                    {submittingId === cat.id ? (
                      <Loader2 className="size-4 animate-spin text-primary" />
                    ) : isAdded ? (
                      <Check className="size-4 text-primary" />
                    ) : null}
                  </div>
                );
              })}
              {!loading && categories.length === 0 && (
                <div className="text-center py-10 opacity-30 text-xs font-bold uppercase tracking-widest italic">
                  Kategoriyalar topilmadi
                </div>
              )}
            </div>
          </div>
          <div className="p-4 pb-8">
            <Button variant="ghost" className="w-full rounded-xl" onClick={() => onOpenChange(false)}>
              Yopish
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}