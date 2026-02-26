"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Trash2,
  Plus,
  AlertCircle,
  Building2,
  Loader2,
  Phone as PhoneIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { TenantUserService } from "@/services/tenant-user.service";
import { toast } from "sonner";
import {CheckUserExistenceResponse, Phone} from "@/schemas/tenant-user.schema";
import { useRouter } from "next/navigation";
import { PatternFormat } from "react-number-format";
import {cn} from "@/lib/utils";



export function CreatePhonesSection({ onChange }: { onChange: (v: Phone[]) => void }) {
  const router = useRouter();
  const [phones, setPhones] = useState<Phone[]>([]);
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const [isChecking, setIsChecking] = useState(false);
  const [existingUser, setExistingUser] = useState<CheckUserExistenceResponse | null>(null);

  useEffect(() => {
    onChange(phones);
  }, [phones, onChange]);

  const handleAddClick = async () => {
    // Убираем все лишние символы кроме + и цифр перед отправкой/проверкой
    const cleanPhone = phone.replace(/[^\d+]/g, "");

    if (cleanPhone.length < 9) {
      toast.error("Telefon raqami noto'g'ri");
      return;
    }

    if (phones.some(p => p.phone === cleanPhone)) {
      toast.error("Bu raqam ro'yxatga qo'shilgan");
      return;
    }

    try {
      setIsChecking(true);
      setExistingUser(null);
      const data = await TenantUserService.checkExistence(cleanPhone);
      if (data) {
        setExistingUser(data);
        toast.warning("Foydalanuvchi mavjud");
      }
    } catch (error: any) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number } };

        if (axiosError.response.status === 404) {
          confirmAddPhone(cleanPhone);
          return;
        }
      }

      toast.error("Tekshirishda xatolik");
    } finally {
      setIsChecking(false);
    }
  };

  const confirmAddPhone = (cleanPhone?: string) => {
    const finalPhone = cleanPhone || phone.replace(/[^\d+]/g, "");
    setPhones((prev) => [
      ...prev.map(p => ({ ...p, isPrimary: false })),
      { phone: finalPhone, note, isPrimary: prev.length === 0 },
    ]);
    setPhone("");
    setNote("");
    setExistingUser(null);
  };

  const setPrimary = (i: number) => {
    setPhones((prev) => prev.map((p, idx) => ({ ...p, isPrimary: idx === i })));
  };

  const remove = (i: number) => {
    setPhones((prev) => prev.filter((_, idx) => idx !== i));
  };

  return (
    <Card className="border-sidebar-border/60 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <PhoneIcon className="size-4 text-primary" />
          Telefon raqamlari
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Список добавленных */}
        <div className="space-y-2">
          {phones.map((p, i) => (
            <div
              key={i}
              className={cn(
                "group relative flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl transition-all border",
                p.isPrimary
                  ? "bg-primary/[0.04] border-primary/30 shadow-[inset_0_0_12px_rgba(var(--primary),0.02)]"
                  : "bg-sidebar-accent/10 border-border/40 hover:border-border/80"
              )}
            >
              {/* Левая часть: Номер и Заметка */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-[140px] flex-1">
                <div className="text-sm font-mono font-bold tracking-tight text-foreground/90">
                  {p.phone}
                </div>

                {/* Заметка с ограничением ширины, чтобы не выталкивала кнопки */}
                {p?.note && (
                  <div className={cn(
                    "text-[10px] px-2 py-0.5 rounded-md w-fit max-w-[150px] truncate transition-colors",
                    p.isPrimary ? "bg-primary/10 text-primary/80" : "bg-muted text-muted-foreground/70"
                  )}>
                    {p?.note}
                  </div>
                )}

              </div>

              {/* Правая часть: Управление */}
              <div className="flex items-center gap-1.5 ml-auto">
                {p.isPrimary ? (
                  <Badge
                    variant="outline"
                    className="h-7 bg-primary text-primary-foreground border-none text-[9px] uppercase tracking-wider font-bold px-2.5 shadow-sm shadow-primary/20"
                  >
                    Asosiy
                  </Badge>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
                    onClick={() => setPrimary(i)}
                    title="Asosiy qilish"
                  >
                    <Star className="size-3.5" />
                  </Button>
                )}

                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all active:scale-90"
                  onClick={() => remove(i)}
                  title="O'chirish"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Секция ввода с маской */}
        <div className="relative space-y-3 pt-2 border-t border-border/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <PatternFormat
              format="+998 ## ### ## ##"
              allowEmptyFormatting
              mask="_"
              customInput={Input}
              value={phone}
              onValueChange={(values) => setPhone(values.formattedValue)}
              className="bg-background/50 font-mono"
            />
            <Input
              placeholder="Izoh (Masalan: Shaxsiy)"
              value={note}
              className="bg-background/50"
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Button
            onClick={handleAddClick}
            disabled={isChecking || !phone || phone.includes("_")}
            className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-white gap-2 h-10"
          >
            {isChecking ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Qo&apos;shish
          </Button>
        </div>

        {/* Карточка существующего пользователя */}
        {existingUser && (
          <div className="mt-4 animate-in zoom-in-95 duration-200">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-amber-800 uppercase">Foydalanuvchi topildi</h4>
                  <p className="text-[11px] text-amber-700/80">Ushbu raqam bazada mavjud. Uni ko&apos;rishni xohlaysizmi?</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {existingUser.organizations.map((org, idx) => (
                  <Badge key={idx} variant="outline" className="bg-background/50 text-[10px] py-0">
                    <Building2 className="size-2.5 mr-1" />
                    {org.organizationName}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-8 text-xs text-amber-700 hover:bg-amber-100"
                  onClick={() => { setExistingUser(null); setPhone(""); }}
                >
                  Bekor qilish
                </Button>
                <Button
                  size="sm"
                  className="flex-1 h-8 text-xs bg-amber-600 hover:bg-amber-700"
                  onClick={() => router.push(`/tenant-users/${existingUser.userId}`)}
                >
                  Ko&apos;rish
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}