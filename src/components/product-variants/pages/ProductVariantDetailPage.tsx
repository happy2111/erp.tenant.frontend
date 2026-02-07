'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductVariantsService } from '@/services/product-variants.service';
import { ProductVariant } from '@/schemas/product-variants.schema';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ProductVariantGallery } from '../sections/product-variant-gallery';
import { ProductVariantInfo } from '../sections/product-variant-info';
import { ProductVariantPrice } from '../sections/product-variant-price';
import {
  ProductVariantAttributes
} from "@/components/product-variants/sections/product-variant-attributes";
import {
  ProductVariantInstances
} from "@/components/product-variants/sections/product-variant-intances";
import {
  ProductVariantBatches
} from "@/components/product-variants/sections/product-variant-batches";
import {
  ProductVariantStock
} from "@/components/product-variants/sections/product-variant-stock";
import ProductBreadcrumbHeader
  from "@/components/products/ProductBreadcrumbHeader";

export default function ProductVariantDetailPage({variantId}: {variantId: string}) {
  const router = useRouter();

  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!variantId) return;

    const loadVariant = async () => {
      try {
        setLoading(true);
        const data = await ProductVariantsService.getByIdAdmin(variantId);
        setVariant(data);
      } catch (err) {
        console.error(err);
        toast.error("Не удалось загрузить вариант товара");
        router.push('/product-variants');
      } finally {
        setLoading(false);
      }
    };

    loadVariant();
  }, [variantId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="size-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (!variant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative overflow-hidden">
      {/* Фоновые декорации — как в ProductDetail */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Шапка + кнопка назад */}
        <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
          <Button variant="ghost" onClick={() => router.back()} className="rounded-xl group">
            <ArrowLeft className="mr-2 size-4 group-hover:-translate-x-1 transition-transform" />
            Orqaga
          </Button>

          <div className="text-sm text-muted-foreground">
            Variant ID: <span className="font-mono">{variant.id.slice(0, 8)}...</span>
          </div>
        </div>
        <ProductBreadcrumbHeader product={variant?.product}/>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Левая колонка — галерея */}
          <div className="lg:col-span-5 space-y-6">
            <ProductVariantGallery
              variantId={variant.id}
              // можно передать начальные изображения, если бэкенд их уже возвращает
              // initialImages={variant.images || []}
            />
          </div>

          {/* Правая колонка — информация */}
          <div className="lg:col-span-7 space-y-6">
              <ProductVariantInfo variant={variant} />

              <ProductVariantPrice variant={variant} />

              <ProductVariantAttributes variantId={variant.id} />


               <ProductVariantInstances variantId={variant.id} />

              {variant.product_instance?.length === 0 && (
                <>
                  <ProductVariantStock variantId={variant.id} />

                  <ProductVariantBatches variantId={variant.id} />
                </>
              )}

          </div>
        </div>
      </div>
    </div>
  );
}