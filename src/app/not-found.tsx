'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPinOff, ArrowLeft, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function NotFoundPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(100);
  const REDIRECT_TIME = 15; // Дадим пользователю чуть больше времени (15 сек)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - (100 / (REDIRECT_TIME * 10));
      });
    }, 100);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
      {/* Декоративные стеклянные элементы на фоне */}
      <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

        {/* Glass Card */}
        <div className="bg-card/40 backdrop-blur-2xl border border-border/40 rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Эффект свечения за иконкой */}
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              <div className="relative p-5 rounded-3xl bg-background/50 border border-border/50 shadow-inner">
                <MapPinOff className="size-12 text-primary/80" />
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <h1 className="text-6xl font-black tracking-tighter italic opacity-20">404</h1>
            <h2 className="text-2xl font-bold tracking-tight">Sahifa topilmadi</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Siz qidirayotgan sahifa mavjud emas yoki <br />
              boshqa manzilga ko'chirilgan bo'lishi mumkin.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                <span>Avtomatik yo'naltirish</span>
                <span className="text-primary">{Math.ceil((progress / 100) * REDIRECT_TIME)} soniya</span>
              </div>
              <Progress value={progress} className="h-1 bg-primary/10 transition-all" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 h-12 rounded-xl border-border/40 bg-background/20 backdrop-blur-sm hover:bg-background/60"
              >
                <ArrowLeft className="mr-2 size-4" />
                Orqaga
              </Button>
              <Button
                onClick={() => router.push('/')}
                className="flex-1 h-12 rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/25 bg-primary transition-all active:scale-95"
              >
                <Home className="mr-2 size-4" />
                Asosiyga
              </Button>
            </div>
          </div>
        </div>

        {/* Дополнительная ссылка или текст */}
        <div className="flex items-center justify-center gap-2 opacity-40 hover:opacity-100 transition-opacity cursor-default">
          <Search className="size-3" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Qidiruv tizimi faol</span>
        </div>
      </div>
    </div>
  );
}