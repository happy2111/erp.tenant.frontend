"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductsService } from "@/services/products.service"; // Исправленный сервис
import { useDebounce } from "use-debounce";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {Search, Loader2, Package, Check, X, Plus} from "lucide-react";
import { Product } from "@/schemas/products.schema";
import {useRouter} from "next/navigation"; // Исправленный путь к схеме

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (product: Product) => void;
}

export function ProductSelectDrawer({ open, onOpenChange, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);

  // Используем ProductsService.getAllAdmin
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["products-admin-search", debouncedSearch],
    queryFn: () => ProductsService.getAllAdmin({
      search: debouncedSearch,
      limit: 10,
      page: 1
    }),
    enabled: open,
  });

  // Хелпер для очистки поиска
  const clearSearch = () => setSearch("");

  const router = useRouter()
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] bg-background/80 backdrop-blur-2xl border-t border-border/50">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="space-y-4 text-center sm:text-left">
            <div className="space-y-1">
              <DrawerTitle className="text-2xl font-black tracking-tighter italic uppercase">
                Mahsulot tanlash
              </DrawerTitle>
              <DrawerDescription className="text-[10px] uppercase tracking-widest opacity-60 font-medium">
                Variant biriktiriladigan asosiy mahsulotni toping
              </DrawerDescription>
            </div>

           <div className='flex gap-2 items-center w-full'>
             <div className="relative w-full group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input
                 placeholder="Nomi yoki kodi bo'yicha..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="pl-11 pr-10 h-12 rounded-xl bg-muted/30 border-border/40 focus:bg-background/50 transition-all"
               />
               {search && (
                 <button
                   onClick={clearSearch}
                   className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                 >
                   <X className="size-4" />
                 </button>
               )}
             </div>
             <Button onClick={() => router.push('/products/create')} className='h-10 w-10 rounded-full' ><Plus className='size-4 '/></Button>

           </div>
          </DrawerHeader>

          <ScrollArea className="px-4 h-[400px]">
            <div className="space-y-2 pb-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                  <Loader2 className="animate-spin size-8 text-primary mb-3" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Yuklanmoqda...</span>
                </div>
              ) : data?.items && data.items.length > 0 ? (
                data.items.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => onSelect(product)}
                    className="w-full group flex items-center justify-between p-4 rounded-2xl bg-card/40 border border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/10 group-hover:scale-105 transition-transform">
                        <Package className="size-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-[15px] tracking-tight group-hover:text-primary transition-colors">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono opacity-50 uppercase tracking-tighter">
                            Code: {product.code}
                          </span>
                          {product.brand && (
                            <span className="text-[10px] font-bold text-primary/60 uppercase">
                              • {product.brand.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <Check className="size-4 text-primary" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
                  <div className="size-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                    <Search className="size-8 text-muted-foreground/20" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-30 italic">
                    {debouncedSearch ? "Mahsulot topilmadi" : "Qidiruvni boshlang..."}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          <DrawerFooter className="border-t border-border/40 pt-4 pb-8">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 rounded-xl border-border/50 bg-background/20 backdrop-blur-md hover:bg-background/40 font-bold uppercase text-[10px] tracking-widest transition-all"
            >
              Yopish
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}