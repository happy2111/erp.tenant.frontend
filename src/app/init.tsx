'use client'

import { useEffect, useState } from 'react'
import { useTenantAuthStore } from "@/store/auth.store"

export function AppInitializer() {
  const [initialized, setInitialized] = useState(false)
  const initStore = useTenantAuthStore.getState().init

  useEffect(() => {
    const initialize = async () => {
      try {
        await initStore()
      } catch (error) {
        console.error("Initialization failed:", error)
      } finally {
        setInitialized(true)
      }
    }

    initialize()
  }, [initStore])

  if (!initialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
    </div>
    </div>
  )
  }

  return null
}