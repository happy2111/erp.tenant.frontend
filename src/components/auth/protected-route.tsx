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
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Проверка доступа...</p>
      </div>
    );
  }

  return <>{children}</>;
}