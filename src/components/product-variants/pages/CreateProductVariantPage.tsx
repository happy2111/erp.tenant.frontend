"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  Package,
  Coins,
  ChevronRight,
  Loader2,
  Barcode,
  Hash,
  Type,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateProductVariantSchema, CreateProductVariantDto } from "@/schemas/product-variants.schema";
import { ProductVariantsService } from "@/services/product-variants.service";
import { Product } from "@/schemas/products.schema";
import { Currency } from "@/schemas/currency.schema";
import {
  ProductSelectDrawer
} from "@/components/product-variants/drawers/SelectProductDrawer";
import {
  CurrencySelectDrawer
} from "@/components/product-variants/drawers/СurrencySelectDrawer";

export default function CreateProductVariantPage() {
  const router = useRouter();

  // Состояния для Drawer
  const [productDrawerOpen, setProductDrawerOpen] = useState(false);
  const [currencyDrawerOpen, setCurrencyDrawerOpen] = useState(false);

  // Выбранные объекты для отображения в UI
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProductVariantDto>({
    resolver: zodResolver(CreateProductVariantSchema),
    defaultValues: {
      title: "",
      sku: "",
      barcode: "",
      defaultPrice: undefined,
      productId: "",
      currencyId: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProductVariantDto) => ProductVariantsService.create(data),
    onSuccess: () => {
      toast.success("Variant muvaffaqiyatli yaratildi");
      router.back();
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const onSubmit = (data: CreateProductVariantDto) => {
    createMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 size-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tighter italic uppercase">Yangi Variant</h1>
            <p className="text-xs uppercase tracking-widest opacity-60 font-medium">Mahsulot uchun yangi model qo'shish</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-[2.5rem] p-6 md:p-8 shadow-xl space-y-6">

            {/* 1. Выбор продукта (Обязательно) */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 ml-1">Asosiy Mahsulot *</label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setProductDrawerOpen(true)}
                className={`w-full h-14 justify-between rounded-2xl border-border/50 bg-background/30 px-6 ${errors.productId ? 'border-destructive/50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Package className="size-5 text-primary" />
                  {selectedProduct ? (
                    <div className="text-left">
                      <p className="font-bold text-sm leading-none">{selectedProduct.name}</p>
                      <p className="text-[10px] opacity-50 font-mono mt-1">{selectedProduct.code}</p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground font-medium">Mahsulotni tanlang</span>
                  )}
                </div>
                <ChevronRight className="size-4 opacity-30" />
              </Button>
              {errors.productId && <p className="text-destructive text-[10px] font-bold uppercase ml-1">{errors.productId.message}</p>}
            </div>

            {/* 2. Заголовок варианта */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 ml-1">Variant nomi *</label>
              <div className="relative group">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  {...register("title")}
                  placeholder="Masalan: Black, 128GB"
                  className="pl-11 h-12 rounded-xl bg-background/50 border-border/50"
                />
              </div>
              {errors.title && <p className="text-destructive text-[10px] font-bold uppercase ml-1">{errors.title.message}</p>}
            </div>

            {/* 3. SKU и Barcode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 ml-1">SKU</label>
                <div className="relative group">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input {...register("sku")} placeholder="SKU-123" className="pl-11 h-12 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 ml-1">Barcode</label>
                <div className="relative group">
                  <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input {...register("barcode")} placeholder="47800..." className="pl-11 h-12 rounded-xl" />
                </div>
              </div>
            </div>

            {/* 4. Цена и Валюта */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 ml-1">Narxi</label>
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    {...register("defaultPrice", { valueAsNumber: true })}
                    placeholder="0.00"
                    className="pl-11 h-12 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 ml-1">Valyuta</label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrencyDrawerOpen(true)}
                  className="w-full h-12 justify-between rounded-xl border-border/50 bg-background/30 px-4"
                >
                  <div className="flex items-center gap-2">
                    <Coins className="size-4 text-primary" />
                    <span className="font-bold text-sm">
                      {selectedCurrency ? selectedCurrency.code : "Tanlanmagan"}
                    </span>
                  </div>
                  <ChevronRight className="size-3 opacity-30" />
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 h-14 rounded-2xl font-bold uppercase text-[10px] tracking-widest"
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 h-14 rounded-2xl shadow-xl shadow-primary/20 bg-primary font-black uppercase text-[11px] tracking-[0.2em]"
            >
              {createMutation.isPending ? <Loader2 className="animate-spin size-5" /> : "Saqlash"}
            </Button>
          </div>
        </form>
      </div>

      {/* Drawers */}
      <ProductSelectDrawer
        open={productDrawerOpen}
        onOpenChange={setProductDrawerOpen}
        onSelect={(product) => {
          setSelectedProduct(product);
          setValue("productId", product.id);
          setProductDrawerOpen(false);
        }}
      />

      <CurrencySelectDrawer
        open={currencyDrawerOpen}
        onOpenChange={setCurrencyDrawerOpen}
        onSelect={(currency) => {
          setSelectedCurrency(currency);
          setValue("currencyId", currency.id);
          setCurrencyDrawerOpen(false);
        }}
      />
    </div>
  );
}