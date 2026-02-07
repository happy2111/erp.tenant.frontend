'use client'

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { ProductsService } from '@/services/products.service';
import { ProductVariantsService } from '@/services/product-variants.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from "@/components/ui/card";
import {
  Search, Plus, Image as ImageIcon, Layers, Package, ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { usePosStore } from '@/store/use-pos-store';
import { ProductVariant } from "@/schemas/product-variants.schema";
import { AddToCartModal } from "@/components/pos/modals/AddToCartModal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function PosCatalog() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('variants');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const currencyId = usePosStore(s => s.currencyId);

  const { data: variants } = useQuery({
    queryKey: ['pos-variants', search, selectedProductId],
    queryFn: async () => {
      if (selectedProductId) {
        // Ensure this returns the ARRAY (items)
        return await ProductVariantsService.getVariantsByProduct(selectedProductId);
      }
      // This already returns .items, which is good
      return ProductVariantsService.getAllAdmin({ search, limit: 50 }).then(r => r.items);
    }
  });
  const { data: products } = useQuery({
    queryKey: ['pos-products', search],
    queryFn: () => ProductsService.getAllAdmin({ search, limit: 50 }).then(r => r.items),
    enabled: activeTab === 'products' && !selectedProductId
  });

  const renderCard = ({
                        title,
                        subtitle,
                        image,
                        stockCount,
                        onClick,
                        price,
                        isProduct = false,
                        key,
                      }: any) => (
    <Card
      key={key}
      onClick={onClick}
      className={cn(
        "group p-0 relative overflow-hidden cursor-pointer transition-all duration-300",
        "rounded-4xl bg-card/40 backdrop-blur-xl border-border/50 shadow-none hover:bg-card/60",
        "active:scale-[0.97] border",
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative h-32 w-full overflow-hidden bg-muted/30">
        {image ? (
          <img src={image} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
        ) : (
          <div className="h-full w-full flex items-center justify-center opacity-20">
            <ImageIcon className="size-8" />
          </div>
        )}

        {/* STOCK BADGE - Вернули сюда */}
        {!isProduct && stockCount !== undefined && (
          <div className="absolute top-3 right-3">
            <Badge className={cn(
              "backdrop-blur-md border-none text-[10px] font-black h-6 px-2 rounded-lg",
              stockCount > 0
                ? "bg-emerald-500/80 text-white"
                : "bg-destructive/80 text-white"
            )}>
              {stockCount}
            </Badge>
          </div>
        )}

        {isProduct && (
          <div className="absolute bottom-3 left-3 bg-primary/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] text-primary-foreground font-bold uppercase tracking-widest">
            Продукт
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black opacity-30 uppercase truncate">{subtitle}</span>
          <h3 className="font-bold text-sm leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          {price !== undefined ? (
            <div className="flex flex-col">
              <span className="text-[9px] font-bold opacity-40 uppercase">Цена</span>
              <span className="text-primary font-black text-sm">{price}</span>
            </div>
          ) : (
            <span className="text-[10px] font-black opacity-40 uppercase italic">Открыть</span>
          )}


          <div className="size-8 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
            {!isProduct ? (
              <Plus className="size-4 stroke-[3px]" />

            ):
              (
                <ArrowRight className="size-4 stroke-[3px]"/>
              )
            }

          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-full space-y-4 py-5 lg:p-6 bg-transparent">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 opacity-40" />
        <Input
          className="h-14 pl-12 rounded-3xl bg-card/30 backdrop-blur-lg border-border/50 focus-visible:ring-primary/20 shadow-none text-base"
          placeholder="Поиск товара..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSelectedProductId(null); }} className="space-y-6">
        <TabsList className="bg-card/30 backdrop-blur-md p-1 rounded-2xl border border-border/50">
          <TabsTrigger value="variants" className="rounded-xl px-6 font-bold text-xs uppercase tracking-tighter">Варианты</TabsTrigger>
          <TabsTrigger value="products" className="rounded-xl px-6 font-bold text-xs uppercase tracking-tighter">Продукты</TabsTrigger>
        </TabsList>

        <TabsContent value="variants" className="m-0 mb-[20vh]">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {variants?.map(v => {
              // РАСЧЕТ STOCK ИЗ ТВОЕГО JSON
              const stockAmount = v.stocks?.reduce((acc, s) => acc + (s.quantity || 0), 0) || 0;

              return renderCard({
                title: v.title,
                subtitle: v.sku || 'No SKU',
                image: v.images?.[0]?.url,
                stockCount: stockAmount, // Передаем сюда
                price: v.defaultPrice ? `${Number(v.defaultPrice).toLocaleString()} ${v.currency?.symbol || ''}` : '---',
                onClick: () => setSelectedVariant(v),
                key: v.id
              });
            })}
          </div>
        </TabsContent>

        <TabsContent value="products" className="m-0 mb-[20vh]">
          {!selectedProductId ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {products?.map(p => renderCard({
                title: p.name,
                subtitle: p.code || 'PRD',
                isProduct: true,
                onClick: () => setSelectedProductId(p.id),
                key: p.id,
              }))}
            </div>
          ) : (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={() => setSelectedProductId(null)} className="rounded-xl">
                <ArrowLeft className="mr-2 size-4" /> Назад
              </Button>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {variants?.map(v => {
                  const stockAmount = v.stocks?.reduce((acc, s) => acc + (s.quantity || 0), 0) || 0;
                  return renderCard({
                    title: v.title,
                    subtitle: v.sku,
                    image: v.images?.[0]?.url,
                    stockCount: stockAmount,
                    price: v.defaultPrice ? `${Number(v.defaultPrice).toLocaleString()} ${v.currency?.symbol || ''}` : '---',
                    onClick: () => setSelectedVariant(v),
                    key: v.key,
                  });
                })}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddToCartModal
        variant={selectedVariant}
        isOpen={!!selectedVariant}
        onClose={() => setSelectedVariant(null)}
      />
    </div>
  );
}