"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ProductInstancesService } from "@/services/product-instances.service";
import { ProductsService } from "@/services/products.service";
import { ProductVariantsService } from "@/services/product-variants.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Loader2,
  Cpu,
  QrCode,
  PackageSearch,
  CheckCircle2, Cuboid
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ProductSelectDrawer
} from "@/components/product-variants/drawers/SelectProductDrawer";

export default function CreateProductInstancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Состояния выбора
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [serialNumber, setSerialNumber] = useState("");
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);

  // 1. Загрузка вариантов для выбранного товара
  const { data: variants, isLoading: isVariantsLoading } = useQuery({
    queryKey: ["variants-by-product", selectedProduct?.id],
    queryFn: () => ProductVariantsService.getVariantsByProduct(selectedProduct?.id),
    enabled: !!selectedProduct?.id,
  });

  // 2. Мутация создания
  const mutation = useMutation({
    mutationFn: () => ProductInstancesService.create({
      productVariantId: selectedVariantId,
      serialNumber: serialNumber,
      currentStatus: 'IN_STOCK'
    }),
    onSuccess: (data) => {
      toast.success("Mahsulot nusxasi muvaffaqiyatli yaratildi");
      router.push(`/product-variants/${selectedVariantId}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariantId) return toast.error("Variantni tanlang");
    if (serialNumber.length < 3) return toast.error("Seriya raqami juda qisqa");
    mutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-2xl mx-auto space-y-8">
        <Button variant="ghost" onClick={() => router.back()} className="rounded-xl group">
          <ArrowLeft className="mr-2 size-4 group-hover:-translate-x-1 transition-transform" />
          Orqaga
        </Button>

        <Card className="bg-card/40 backdrop-blur-2xl border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden">
          <CardHeader className="bg-muted/5 border-b border-border/10 pb-8 pt-10 px-8 text-center">
            <div className="mx-auto size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20">
              <Cuboid className="size-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-black italic uppercase tracking-tighter">
              Yangi Namuna
            </CardTitle>
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-40 font-bold mt-2">
              Instance yaratish (IMEI / Serial Number)
            </p>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Выбор товара через Drawer */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Asosiy Mahsulot</label>
                <div
                  onClick={() => setIsProductDrawerOpen(true)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50 cursor-pointer hover:bg-muted/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <PackageSearch className="size-5 text-primary opacity-60" />
                    <span className="font-bold text-sm">
                      {selectedProduct ? selectedProduct.name : "Mahsulotni tanlang..."}
                    </span>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="rounded-lg h-8 text-[10px] uppercase font-bold">
                    Tanlash
                  </Button>
                </div>
              </div>

              {/* Выбор Варианта (появляется после выбора товара) */}
              <div className={`space-y-2 transition-all duration-500 ${selectedProduct ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Variant (Rang, Xotira va h.k.)</label>
                <Select
                  value={selectedVariantId}
                  onValueChange={setSelectedVariantId}
                  disabled={!selectedProduct || isVariantsLoading}
                >
                  <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-border/50">
                    <SelectValue placeholder={isVariantsLoading ? "Yuklanmoqda..." : "Variantni tanlang"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {variants?.map((variant) => (
                      <SelectItem key={variant.id} value={variant.id} className="rounded-xl">
                        {variant.title} {variant.sku ? `(${variant.sku})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Серийный номер */}
              <div className={`space-y-2 transition-all duration-500 ${selectedVariantId ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Seriya raqami / IMEI</label>
                <div className="relative">
                  <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input
                    placeholder="Masalan: SN123456789"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="pl-12 h-14 rounded-2xl bg-muted/30 border-border/50 focus:bg-background/80 transition-all font-mono tracking-wider"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={mutation.isPending || !selectedVariantId || !serialNumber}
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest italic text-md group"
              >
                {mutation.isPending ? (
                  <Loader2 className="animate-spin size-5" />
                ) : (
                  <>
                    Saqlash
                    <CheckCircle2 className="ml-2 size-5 group-hover:scale-110 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <ProductSelectDrawer
        open={isProductDrawerOpen}
        onOpenChange={setIsProductDrawerOpen}
        onSelect={(product) => {
          setSelectedProduct(product);
          setSelectedVariantId(""); // Сбрасываем вариант при смене товара
          setIsProductDrawerOpen(false);
        }}
      />
    </div>
  );
}