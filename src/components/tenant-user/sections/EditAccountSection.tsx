"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Lock,
  ShieldCheck,
  Info,
  Loader2,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { TenantUserService } from "@/services/tenant-user.service";
import { CheckUserExistenceResponse } from "@/schemas/tenant-user.schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function EditAccountSection({
                                     onChange,
                                     initialData
                                   }: {
  onChange: (v: any) => void;
  initialData?: any;
}) {
  const router = useRouter();

  // Состояния полей
  const [email, setEmail] = useState(initialData?.email || "");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  // Состояния проверки Email
  const [debouncedEmail] = useDebounce(email, 600);
  const [isChecking, setIsChecking] = useState(false);
  const [existingUser, setExistingUser] = useState<CheckUserExistenceResponse | null>(null);

  // Синхронизация при загрузке данных
  useEffect(() => {
    if (initialData) {
      setEmail(initialData.email || "");
      setIsActive(initialData.isActive ?? true);
    }
  }, [initialData]);

  // Передача данных родителю
  useEffect(() => {
    const payload: any = { isActive };

    // Email передаем только если он валидный и не пустой
    if (email && email.includes("@")) {
      payload.email = email;
    }

    // Пароль только если введен
    if (password.trim().length > 0) {
      payload.password = password;
    }

    onChange(payload);
  }, [email, password, isActive, onChange]);

  // Эффект проверки существования Email
  useEffect(() => {
    const checkEmail = async () => {
      // 1. Не проверяем, если email пустой или это старый email текущего юзера
      if (!debouncedEmail || !debouncedEmail.includes("@") || debouncedEmail === initialData?.email) {
        setExistingUser(null);
        return;
      }

      try {
        setIsChecking(true);
        const data = await TenantUserService.checkExistence(debouncedEmail);

        alert("asdfkjl")

        if (data && data.userId !== initialData?.id) {
          setExistingUser(data);
          toast.warning("Ushbu yangi email band!");
        } else {
          setExistingUser(null);
        }
      } catch (error) {
        setExistingUser(null);
      } finally {
        setIsChecking(false);
      }
    };

    checkEmail();
  }, [debouncedEmail, initialData]);

  return (
    <Card className="border-sidebar-border/60 bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          Akkaunt sozlamalari
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Поле Email */}
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-bold ml-1 text-muted-foreground">E-mail manzil</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Mail className="size-4" />
            </div>
            <Input
              type="email"
              placeholder="user@example.uz"
              className="pl-10 bg-background/50 border-border/60 focus-visible:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {isChecking && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="size-4 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>

        {/* Поле Пароль */}
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-bold ml-1 text-muted-foreground">Yangi parol</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Lock className="size-4" />
            </div>
            <Input
              type="password"
              placeholder="O'zgartirmaslik uchun bo'sh qoldiring"
              className="pl-10 bg-background/50 border-border/60 focus-visible:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <p className="text-[9px] text-muted-foreground flex items-center gap-1 mt-1 ml-1">
            <Info className="size-3" /> Parol kamida 8 ta belgidan iborat bo'lishi kerak
          </p>
        </div>

        {/* Виджет если Email занят другим человеком */}
        {existingUser && (
          <div className="animate-in slide-in-from-top-1 duration-200">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[12px] font-bold text-amber-800 uppercase">E-mail band!</h4>
                  <p className="text-[11px] text-amber-700/80">
                    Ushbu pochta manzili boshqa foydalanuvchiga tegishli.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-[11px] border-amber-500/30 text-amber-700 hover:bg-amber-100 gap-2"
                onClick={() => router.push(`/tenant-users/${existingUser.userId}`)}
              >
                Egasini ko'rish <ExternalLink className="size-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Статус активности */}
        <div className="flex items-center justify-between border border-border/60 rounded-2xl p-4 bg-background/40">
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight">Status</span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              {isActive ? "Tizimga kirish ruxsat etilgan" : "Tizimga kirish bloklangan"}
            </span>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={setIsActive}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </CardContent>
    </Card>
  );
}