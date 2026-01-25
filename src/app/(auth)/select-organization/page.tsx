'use client'
import { OrganizationSelector } from '@/components/auth/OrganizationSelector';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SelectOrganizationPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
      {/* Фоновые декорации */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Контейнер для кнопки и карточки */}
      <div className="w-full max-w-lg space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Кнопка назад - теперь она "прижата" к левому краю карточки */}
        <Button
          variant="ghost"
          onClick={() => router.push('/login')}
          className="group hover:bg-transparent p-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border/50 shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium pr-2">Orqaga qaytish</span>
          </div>
        </Button>

        <Card className="border-none shadow-2xl bg-card">
          <CardContent className="p-8 md:p-12">
            <OrganizationSelector />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}