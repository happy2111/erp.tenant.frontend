"use client"

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Типы для синхронизации с бэкендом (обычно бэкенд ждет капсом)
type ThemeValue = 'LIGHT' | 'DARK' | 'SYSTEM';

export function ThemeSettingsBlock({
                                     currentTheme,
                                     onUpdate
                                   }: {
  currentTheme: string,
  onUpdate: (val: any) => void
}) {
  const { setTheme } = useTheme();

  const themes: { value: ThemeValue; label: string; icon: any }[] = [
    { value: 'LIGHT', label: 'Yorug‘', icon: Sun },
    { value: 'DARK', label: 'Qorong‘i', icon: Moon },
    { value: 'SYSTEM', label: 'Tizim', icon: Monitor },
  ];

  const handleThemeChange = (value: ThemeValue) => {
    // 1. Обновляем локальную тему в next-themes (ожидает маленькие буквы)
    setTheme(value.toLowerCase());

    // 2. Отправляем мутацию на бэкенд
    onUpdate({ theme: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="font-black text-lg uppercase italic tracking-tighter">Mavzu sozlamalari</Label>
        <p className="text-xs text-muted-foreground">Ilova ko‘rinishini o‘zingizga moslang</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {themes.map((theme) => {
          const isActive = currentTheme === theme.value;
          return (
            <button
              key={theme.value}
              onClick={() => handleThemeChange(theme.value)}
              className={cn(
                "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200",
                isActive
                  ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10 scale-[1.02]"
                  : "border-muted bg-card hover:border-muted-foreground/30 opacity-60 hover:opacity-100"
              )}
            >
              <theme.icon className={cn("size-5", isActive ? "animate-in zoom-in-50" : "")} />
              <span className="text-[10px] font-black uppercase tracking-widest">{theme.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}