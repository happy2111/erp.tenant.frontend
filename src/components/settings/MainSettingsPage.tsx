"use client"

import { useQuery, useMutation } from '@tanstack/react-query';
import { SettingsService } from '@/services/settings.service';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { Globe, Calendar, Percent, Moon, RefreshCw } from "lucide-react";
import {ThemeSettingsBlock} from "@/components/settings/ThemeSettingsBlock";

type ThemeValue = 'LIGHT' | 'DARK' | 'SYSTEM';

export function MainSettingsPage() {
  const { data: settings, refetch, isLoading, isError, error } = useQuery({
    queryKey: ['my-settings'],
    queryFn: () => SettingsService.getMySettings(),
    retry: false
  });

  const updateMutation = useMutation({
    mutationFn: SettingsService.updateMySettings,
    onSuccess: () => {
      toast.success('Sozlamalar muvaffaqiyatli yangilandi');
      refetch();
    },
    onError: () => {
      toast.error('Saqlashda xatolik yuz berdi');
    }
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="font-black  uppercase tracking-widest animate-pulse">Ma’lumotlar yuklanmoqda...</p>
    </div>
  );

  if (isError) return (
    <div className="p-8 bg-destructive/10 rounded-[2rem] text-destructive">
      <p className="font-bold">Ma’lumotlarni tekshirishda xatolik:</p>
      <pre className="text-xs mt-2 overflow-auto">{(error as any)?.message}</pre>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-black  uppercase tracking-tighter">Asosiy</h2>
        <p className="text-muted-foreground text-sm">Interfeys sozlamalari va tashkilot tizim parametrlar</p>
      </div>

      <div className="grid gap-6">
        <Card className="rounded-[2.5rem] border-none bg-card shadow-sm overflow-hidden">
          <CardContent className="p-8 space-y-8">

            {/* Группа: Внешний вид */}
            <div className="space-y-6">
              <ThemeSettingsBlock
                currentTheme={settings?.theme || 'SYSTEM'}
                onUpdate={(dto) => updateMutation.mutate(dto)}
              />

              <hr className="border-muted/50" />

              <div className="flex items-center justify-between group">
                <div>
                  <Label className="font-black text-lg  uppercase">Bildirishnomalar</Label>
                  <p className="text-xs text-muted-foreground">Tizim xabarnomalarini olish</p>
                </div>
                <Switch
                  checked={settings?.enableNotifications}
                  onCheckedChange={(val) => updateMutation.mutate({ enableNotifications: val })}
                />
              </div>
            </div>

            <hr className="border-muted/50" />

            {/* Группа: Региональные стандарты */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 opacity-30">
                <Globe size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Mintaqaviy sozlamalar</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase ml-1 flex items-center gap-2">
                    <Percent size={14} /> Soliq (QQS %)
                  </Label>
                  <Input
                    type="number"
                    defaultValue={settings?.taxPercent}
                    onBlur={(e) => updateMutation.mutate({ taxPercent: Number(e.target.value) })}
                    className="h-14 rounded-2xl bg-muted/50 border-none font-black text-lg focus-visible:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase ml-1 flex items-center gap-2">
                    <Calendar size={14} /> Sana formati
                  </Label>
                  <select
                    className="w-full h-14 rounded-2xl bg-muted/50 border-none px-4 font-black text-lg appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 transition-all"
                    defaultValue={settings?.dateFormat || "DD.MM.YYYY"}
                    onChange={(e) => updateMutation.mutate({ dateFormat: e.target.value })}
                  >
                    <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-muted/50" />

            {/* Группа: Автоматизация */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 opacity-30">
                <RefreshCw size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Avtomatlashtirish</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl">
                <div>
                  <Label className="font-black text-base  uppercase">Valyuta kursi</Label>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Kurslarni avtomatik yangilash</p>
                </div>
                <Switch
                  checked={settings?.enableAutoRateUpdate}
                  onCheckedChange={(val) => updateMutation.mutate({ enableAutoRateUpdate: val })}
                />
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Инфо-блок */}
        <div className="p-6 bg-muted/30 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-4 border border-dashed border-muted">
          <div className="text-center md:text-left">
            <p className="text-[9px] font-black uppercase opacity-40">Tashkilot ID</p>
            <code className="text-[11px] font-mono break-all">{settings?.organizationId}</code>
          </div>
          <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest">
            Oxirgi yangilanish: {settings && new Date((settings as any).updatedAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}