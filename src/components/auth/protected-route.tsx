"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useTenantAuthStore } from "@/store/tenant-auth.store";

export type OrgUserRole = "OWNER" | "ADMIN" | "SELLER" | "ACCOUNTANT" | "MANAGER";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: OrgUserRole[];
  redirectTo?: string;
}

export default function ProtectedRoute({
                                         children,
                                         allowedRoles,
                                         redirectTo = "/login",
                                       }: ProtectedRouteProps) {
  const router = useRouter();

  // Берем всё необходимое из стора
  const { user, isAuthenticated, isLoading, isInitialized } = useTenantAuthStore();

  useEffect(() => {
    // Ждем, пока приложение полностью инициализируется (пройдет запрос /me)
    if (isInitialized && !isLoading) {
      if (!isAuthenticated) {
        router.replace(redirectTo);
      } else if (user && allowedRoles && !allowedRoles.includes(user.role as OrgUserRole)) {
        // Если роль не подходит — на 403 (или главную)
        router.replace("/403");
      }
    }
  }, [isInitialized, isLoading, isAuthenticated, user, router, allowedRoles, redirectTo]);

  const hasAccess = isAuthenticated && (!allowedRoles || (user && allowedRoles.includes(user.role as OrgUserRole)));

  if (!isInitialized || isLoading || !hasAccess) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden">
        {/* Фоновые декоративные пятна для эффекта глубины */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-700" />

        <div className="relative flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
          {/* Кастомный лоадер с двойным кольцом */}
          <div className="relative flex items-center justify-center">
            <div className="size-16 rounded-full border-t-2 border-l-2 border-primary animate-spin shadow-[0_0_20px_rgba(var(--primary),0.3)]" />
          </div>

          {/* Текстовый блок */}
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none transition-all">
              Kirish tekshirilmoqda
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="size-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="size-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="size-1 bg-primary rounded-full animate-bounce" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 ml-1">
                Xavfsiz ulanish
              </p>
            </div>
          </div>
        </div>

        {/* Нижний копирайт или статусная строка */}
        <div className="absolute bottom-10 left-0 w-full text-center">
          <p className="text-[9px] font-medium uppercase tracking-[0.5em] opacity-20">
            System Authentication v3.0
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}