'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductsService } from '@/services/products.service';
import {Product, ProductPriceSchema} from '@/schemas/products.schema';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit2, Loader2 } from 'lucide-react';
import {ProductGallery} from "@/components/products/sections/product-gallery";
import {ProductInfo} from "@/components/products/sections/product-info";
import {ProductPrices } from "@/components/products/sections/product-prices";
import {ProductCategories} from "@/components/products/sections/product-categories";
import {ProductVariants} from "@/components/products/sections/product-variants";
import {ProductPrice} from "@/schemas/product-prices.schema";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      ProductsService.getByIdAdmin(id as string)
        .then(setProduct)
        .catch(() => router.push('/products'))
        .finally(() => setLoading(false));
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="size-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (!product) return null;

  const safePrices = ProductPriceSchema.array().parse(product.prices || []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Actions */}
        <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
          <Button variant="ghost" onClick={() => router.back()} className="rounded-xl group">
            <ArrowLeft className="mr-2 size-4 group-hover:-translate-x-1 transition-transform" />
            Orqaga
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Gallery */}
          <div className="lg:col-span-5 space-y-6">
            <ProductGallery productId={product.id} initialImages={product.images} />
          </div>

          {/* Right Column: Main Info & Stats */}
          <div className="lg:col-span-7 space-y-6">
            <ProductInfo product={product} />
            <ProductCategories productId={id as string} initialCategories={product.categories}/>
            <ProductPrices productId={id as string} initialPrices={(product.prices as unknown as ProductPrice[]) || []} />
            <ProductVariants variants={product.variants} productId={product.id} variantImages={product?.variantImages} />
          </div>
        </div>
      </div>
    </div>
  );
}