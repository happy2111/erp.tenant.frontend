'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function Home() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const REDIRECT_TIME = 2; // секунды

  // Эффект 1: Только для анимации прогресс-бара
  useEffect(() => {
    const intervalTime = 100; // мс
    const step = 100 / (REDIRECT_TIME * (1000 / intervalTime));

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  // Эффект 2: Выполняем редирект только когда прогресс реально достиг 100
  useEffect(() => {
    if (progress >= 100) {
      router.replace('/dashboard');
    }
  }, [progress, router]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
      {/* Декоративные сферы */}
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="bg-card/40 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] p-10 shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-primary/20 animate-ping opacity-20" />
              <div className="relative p-5 rounded-3xl bg-primary/10 ring-1 ring-primary/20">
                <LayoutDashboard className="size-12 text-primary" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-black tracking-tighter mb-2 italic uppercase">
            Xush kelibsiz
          </h1>
          <p className="text-muted-foreground mb-10 text-sm">
            Tizimga kirish amalga oshirilmoqda. <br />
            Iltimos, biroz kutib turing...
          </p>

          <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">
              <span className="flex items-center gap-2">
                <Loader2 className="size-3 animate-spin" />
                Yuklanmoqda
              </span>
              <span>{Math.round(progress)}%</span>
            </div>

            <Progress value={progress} className="h-1.5 bg-primary/10" />
          </div>
        </div>

        <div className="flex flex-col gap-1 items-center opacity-30 pointer-events-none">
          <p className="text-[10px] uppercase tracking-[0.4em]">
            System Initialization • Secure Link
          </p>
        </div>
      </div>
    </div>
  );
}