"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronRight,
  Layers,
  Image as ImageIcon,
  Plus,
  Barcode,
  Hash
} from "lucide-react";

interface Props {
  variants: any[];
  productId: string;
  variantImages: any[]; // Bu tekis massiv: [{variantId: "...", url: "..."}, ...]
}

export function ProductVariants({ variants, productId, variantImages }: Props) {
  const router = useRouter();

  return (
    <Card className="bg-card/40 backdrop-blur-md border border-border/50 rounded-[2.5rem] overflow-hidden shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 pb-4 bg-muted/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
            <Layers className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] opacity-60">
              Variantlar
            </CardTitle>
            <p className="text-[10px] text-muted-foreground font-medium uppercase">
              Jami: {variants?.length || 0} ta model
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => router.push(`/product-variants/create?productId=${productId}`)}
          className="rounded-xl h-9 bg-primary font-bold text-[10px] uppercase tracking-wider gap-2"
        >
          <Plus className="size-3" /> Qo'shish
        </Button>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {variants && variants.length > 0 ? (
          variants.map((variant) => {
            // 1. Shu variantga tegishli hamma rasmlarni topamiz
            const currentVariantImages = variantImages?.filter(
              (img) => img.variantId === variant.id
            );

            // 2. Asosiy rasmni topamiz (isPrimary) yoki birinchisini olamiz
            const primaryImage =
              currentVariantImages?.find((img) => img.isPrimary) ||
              currentVariantImages?.[0];

            const imageUrl = primaryImage?.url;

            return (
              <div
                key={variant.id}
                onClick={() => router.push(`/product-variants/${variant.id}`)}
                className="group flex items-center gap-4 p-3 rounded-2xl bg-background/50 border border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer shadow-sm"
              >
                {/* Image Preview */}
                <div className="relative size-16 rounded-xl overflow-hidden bg-muted border border-border/50 shrink-0">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={variant.title}
                      className="size-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center opacity-20">
                      <ImageIcon className="size-6" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-sm tracking-tight truncate group-hover:text-primary transition-colors">
                    {variant.title}
                  </h4>

                  <div className="flex items-center gap-3 mt-1">
                    {variant.sku && (
                      <div className="flex items-center gap-1 text-[10px] font-mono opacity-50 uppercase">
                        <Hash className="size-2.5" /> {variant.sku}
                      </div>
                    )}
                    {variant.barcode && (
                      <div className="flex items-center gap-1 text-[10px] font-mono opacity-50 uppercase">
                        <Barcode className="size-2.5" /> {variant.barcode}
                      </div>
                    )}
                  </div>

                  <div className="mt-1 font-black text-xs text-primary/80">
                    {variant.defaultPrice ? (
                      <>{Number(variant.defaultPrice).toLocaleString()} <span className="text-[10px] font-medium opacity-70">{variant?.currency?.symbol || "y.e."}</span></>
                    ) : (
                      <span className="opacity-30 italic font-medium">Narx belgilanmagan</span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <ChevronRight className="size-4 text-primary" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-border/20 rounded-[2rem]">
            <p className="text-xs font-bold uppercase tracking-widest opacity-20 italic">
              Variantlar mavjud emas
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}