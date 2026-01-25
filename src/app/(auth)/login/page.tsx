import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModeToggle } from "@/components/mode-toggle";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
      {/* Декоративные стеклянные сферы на фоне (согласованные по размеру) */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Контейнер с анимацией slide-in как в select-org */}
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="border-none shadow-2xl bg-card">
          <CardHeader className="text-center space-y-2 pt-8">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Tizimga kirish
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Ma'lumotlaringizni kiriting
            </p>
          </CardHeader>
          <CardContent className="pb-8">
            <LoginForm />
          </CardContent>
        </Card>
      </div>

      {/* Переключатель темы */}
      <div className="absolute bottom-6 right-6">
        <ModeToggle />
      </div>
    </div>
  );
}