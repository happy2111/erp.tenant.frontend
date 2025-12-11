'use client'

import { useEffect } from 'react'
import { useTenantAuthStore } from "@/store/auth.store";
export function AppInitializer() {
  const initStore = useTenantAuthStore.getState().init;
  useEffect(() => {
    initStore().catch(error => {
      console.error("Initialization failed:", error);
    });
  }, [initStore]);

  return null;
}