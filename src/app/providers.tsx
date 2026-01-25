"use client";

import { useEffect, useRef } from "react";
import { useTenantAuthStore } from "@/store/tenant-auth.store";

export function Providers({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    useTenantAuthStore.getState().initializeAuth();
  }, []);

  return <>{children}</>;
}