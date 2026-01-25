'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function ForbiddenPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(100);
  const REDIRECT_TIME = 10; // время в секундах

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - (100 / (REDIRECT_TIME * 10)); // уменьшаем плавно каждые 100мс
      });
    }, 100);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
      {/* Фоновые декоративные сферы */}
      <div className="absolute top-1/3 -left-20 w-96 h-96 bg-destructive/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

        {/* Стеклянная карточка */}
        <div className="bg-card/40 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] p-12 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-3xl bg-destructive/10 ring-1 ring-destructive/20 animate-pulse">
              <ShieldAlert className="size-16 text-destructive" />
            </div>
          </div>

          <h1 className="text-5xl font-black tracking-tighter mb-4 italic">403</h1>
          <h2 className="text-2xl font-bold mb-2">Kirish taqiqlangan</h2>
          <p className="text-muted-foreground mb-8">
            Sizda ushbu sahifaga kirish huquqi yo'q. <br />
            Xavfsizlik tizimi sizni chekladi.
          </p>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium uppercase tracking-widest opacity-60">
                <span>Avtomatik qaytish</span>
                <span>{Math.ceil((progress / 100) * REDIRECT_TIME)}s</span>
              </div>
              <Progress value={progress} className="h-1.5 bg-destructive/10" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 h-12 rounded-xl border-border/50 bg-background/20 backdrop-blur-md hover:bg-background/40 transition-all"
              >
                <ArrowLeft className="mr-2 size-4" />
                Orqaga
              </Button>
              <Button
                onClick={() => router.push('/')}
                className="flex-1 h-12 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
              >
                <Home className="mr-2 size-4" />
                Bosh sahifa
              </Button>
            </div>
          </div>
        </div>

        <p className="text-[10px] uppercase tracking-[0.3em] opacity-30 pointer-events-none">
          Access Denied • Security Protocol Active
        </p>
      </div>
    </div>
  );
}