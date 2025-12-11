"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useTenantAuthStore } from "@/store/auth.store";

export default function ProtectedRoute({
                                         children,
                                       }: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { loading, accessToken } = useTenantAuthStore();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!accessToken) {
      router.replace("/login");
    }

  }, [loading, accessToken, router]);

  if (loading || !accessToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return <>{children}</>;
}