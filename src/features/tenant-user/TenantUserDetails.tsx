"use client";

import { useQuery } from "@tanstack/react-query";
import { TenantUserService } from "@/services/tenant-user.service";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit3,
  User,
  ShieldCheck,
  Smartphone,
  IdCard,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

export function TenantUserDetails({ userId }: { userId: string }) {
  const router = useRouter();

  const { data: response, isLoading, error } = useQuery({
    queryKey: ["tenant-users", userId],
    queryFn: () => TenantUserService.getByIdAdmin(userId),
  });

  const user = response?.data;

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="size-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="text-muted-foreground animate-pulse font-medium">Ma'lumotlar yuklanmoqda...</p>
    </div>
  );

  if (error || !user) return (
    <div className="p-12 text-center bg-destructive/10 rounded-[2rem] border border-destructive/20 text-destructive">
      Ma'lumotlarni yuklashda xatolik yuz berdi
    </div>
  );

  const profile = user.profile;

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 lg:p-8 animate-in fade-in duration-500">

      {/* --- TOP BAR --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/tenant-users")}
            className="group -ml-2 text-muted-foreground hover:text-primary rounded-full"
          >
            <ArrowLeft className="mr-2 size-4 transition-transform group-hover:-translate-x-1" />
            Orqaga qaytish
          </Button>
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
              <User className="size-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                {profile ? `${profile.lastName} ${profile.firstName}` : "Ism ko'rsatilmagan"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={cn(
                  "rounded-lg px-2 py-0 text-[10px] uppercase font-bold tracking-tighter border-none shadow-sm",
                  user.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                )}>
                  {user.isActive ? "Active" : "Blocked"}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono opacity-60">ID: {user.id}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => router.push(`/tenant-users/${user.id}/edit`)}
            className="rounded-2xl h-11 px-6 shadow-lg shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform"
          >
            <Edit3 className="mr-2 size-4" />
            Tahrirlash
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* --- LEFT COLUMN: Account Info --- */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard title="Akkaunt" icon={<ShieldCheck className="size-4 text-primary" />}>
            <div className="space-y-1">
              <Info label="Email manzili" value={user.email} />
              <Info label="Yaratilgan" value={new Date(user.createdAt).toLocaleDateString()} />
              <Info label="So'nggi yangilanish" value={new Date(user.updatedAt).toLocaleDateString()} />
            </div>
          </GlassCard>

          <GlassCard title="Telefonlar" icon={<Smartphone className="size-4 text-primary" />}>
            <div className="grid gap-3">
              {user.phone_numbers?.map((p: any) => (
                <div key={p.id} className="p-4 rounded-2xl bg-sidebar-accent/30 border border-border/40 relative group overflow-hidden">
                  <div className="font-bold text-lg tracking-tight">{p.phone}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] uppercase font-bold opacity-40">{p.note || "Izohsiz"}</span>
                    {p.isPrimary && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] h-5">Asosiy</Badge>
                    )}
                  </div>
                  <div className="absolute top-0 right-0 h-full w-1 bg-primary/20 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* --- RIGHT COLUMN: Main Data --- */}
        <div className="lg:col-span-8 space-y-6">

          {/* Личные и паспортные данные */}
          <GlassCard title="Shaxsiy ma'lumotlar" icon={<IdCard className="size-4 text-primary" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
              <Info label="Jinsi" value={profile?.gender} />
              <Info label="Tug'ilgan sana" value={profile?.dateOfBirth && new Date(profile.dateOfBirth).toLocaleDateString()} />

              <div className="sm:col-span-2 my-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-border/40" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Pasport & Manzil</span>
                  <div className="h-px flex-1 bg-border/40" />
                </div>
              </div>

              <Info label="Seriya va raqam" value={profile?.passportSeries ? `${profile.passportSeries} ${profile.passportNumber}` : null} />
              <Info label="Kim tomonidan berilgan" value={profile?.issuedBy} />
              <Info label="Mamlakat / Hudud" value={profile?.country ? `${profile.country}, ${profile.region ?? ""}` : null} />
              <Info label="Shahar / Tuman" value={profile?.city ? `${profile.city} ${profile.district ? `(${profile.district})` : ""}` : null} />
              <div className="sm:col-span-2">
                <Info label="Yashash manzili" value={profile?.address} />
              </div>
              <div className="sm:col-span-2">
                <Info label="Ro'yxatdan o'tgan manzili (Propiska)" value={profile?.registration} />
              </div>
            </div>
          </GlassCard>

          {/* Организации */}
          <GlassCard title="Tashkilotlar" icon={<Building2 className="size-4 text-primary" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.org_links?.length > 0 ? (
                user.org_links.map((link: any) => (
                  <div key={link.organization.id} className="p-4 rounded-3xl bg-card/40 border border-border/60 hover:border-primary/40 transition-all group shadow-sm">
                    <div className="text-xs text-muted-foreground mb-1 font-mono">#{link.organization.id.split('-')[0]}</div>
                    <div className="font-bold text-base group-hover:text-primary transition-colors">{link.organization.name}</div>
                    <Badge className="mt-3 bg-primary/5 text-primary border-primary/20 rounded-lg text-[9px] uppercase font-black">
                      {link.role}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="sm:col-span-2 py-8 text-center border-2 border-dashed border-border/40 rounded-[2rem] text-muted-foreground/50 italic text-sm">
                  Bog'langan tashkilotlar mavjud emas
                </div>
              )}
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

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