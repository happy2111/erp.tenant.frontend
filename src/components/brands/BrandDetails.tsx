"use client";

import { useQuery } from "@tanstack/react-query";
import { BrandsService } from "@/services/brands.service"; // Путь к вашему сервису
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit3,
  Tag,
  Package,
  Hash,
  Building2,
  Layers
} from "lucide-react";

export function BrandDetails({ brandId }: { brandId: string }) {
  const router = useRouter();

  const { data: brand, isLoading, error } = useQuery({
    queryKey: ["brands", brandId],
    queryFn: () => BrandsService.getByIdAdmin(brandId),
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="size-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="text-muted-foreground animate-pulse font-medium">Brend ma'lumotlari yuklanmoqda...</p>
    </div>
  );

  if (error || !brand) return (
    <div className="p-12 text-center bg-destructive/10 rounded-[2rem] border border-destructive/20 text-destructive">
      Brend ma'lumotlarini yuklashda xatolik yuz berdi
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 lg:p-8 animate-in fade-in duration-500">

      {/* --- TOP BAR --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="group -ml-2 text-muted-foreground hover:text-primary rounded-full"
          >
            <ArrowLeft className="mr-2 size-4 transition-transform group-hover:-translate-x-1" />
            Orqaga qaytish
          </Button>
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
              <Tag className="size-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                {brand.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-emerald-500/10 text-emerald-500 rounded-lg px-2 py-0 text-[10px] uppercase font-bold tracking-tighter border-none">
                  Brend
                </Badge>
                <span className="text-xs text-muted-foreground font-mono opacity-60">ID: {brand.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* --- LEFT COLUMN: System Info --- */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard title="Tizim ma'lumotlari" icon={<Layers className="size-4 text-primary" />}>
            <div className="space-y-1">
              <Info
                label="Yaratilgan sana"
                value={new Date(brand.createdAt).toLocaleString('uz-UZ')}
              />
              <Info
                label="Oxirgi tahrir"
                value={new Date(brand.updatedAt).toLocaleString('uz-UZ')}
              />
              <div className="pt-4 mt-4 border-t border-border/20">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Mahsulotlar soni</span>
                  <Badge variant="outline" className="rounded-lg font-mono">
                    {brand._count?.products || brand.products?.length || 0}
                  </Badge>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* --- RIGHT COLUMN: Products List --- */}
        <div className="lg:col-span-8 space-y-6">
          <GlassCard title="Brend mahsulotlari" icon={<Package className="size-4 text-primary" />}>
            <div className="grid grid-cols-1 gap-4">
              {brand.products && brand.products.length > 0 ? (
                brand.products.map((product) => (
                  <div
                    key={product.id}
                    className="p-5 rounded-3xl bg-card/40 border border-border/60 hover:border-primary/40 transition-all group shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-lg group-hover:text-primary transition-colors">
                        {product.name}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center text-xs text-muted-foreground font-mono">
                          <Hash className="size-3 mr-1 opacity-50" />
                          {product.code || "Kodsiz"}
                        </div>
                        {product.organization && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Building2 className="size-3 mr-1 opacity-50" />
                            {product.organization.name}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-xl bg-background border-border/40 hover:bg-primary hover:text-white transition-colors"
                      onClick={() => router.push(`/products/${product.id}`)}
                    >
                      Batafsil
                    </Button>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-border/40 rounded-[2rem] text-muted-foreground/50 italic text-sm">
                  Ushbu brendga biriktirilgan mahsulotlar topilmadi
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS (Copy-pasted from your style) ---

function GlassCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="bg-card/30 backdrop-blur-xl border-border/60 shadow-2xl shadow-black/[0.02] rounded-[2.5rem] overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 pb-2 border-b border-border/20 bg-muted/5">
        <div className="p-2 rounded-xl bg-background shadow-sm border border-border/40">
          {icon}
        </div>
        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] opacity-60">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {children}
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="py-3 px-1 group">
      <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em] mb-1 group-hover:text-primary transition-colors">
        {label}
      </div>
      <div className="text-sm font-semibold tracking-tight">
        {value || <span className="text-muted-foreground/30 font-normal italic">ko'rsatilmagan</span>}
      </div>
    </div>
  );
}