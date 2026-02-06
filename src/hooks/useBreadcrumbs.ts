"use client"

import { usePathname } from "next/navigation"
import { BREADCRUMB_LABELS } from "@/lib/breadcrumbs"

export function useBreadcrumbs() {
  const pathname = usePathname()

  const parts = pathname.split("/").filter(Boolean)

  const breadcrumbs = parts
    .filter(part => {
      // ❌ убираем UUID / id
      if (/^\d+$/.test(part)) return false
      if (/^[0-9a-fA-F-]{36}$/.test(part)) return false // uuid
      return true
    })
    .map((part, i, filteredParts) => {
      const href =
        "/" +
        parts
          .slice(0, parts.indexOf(part) + 1)
          .join("/")

      const label =
        BREADCRUMB_LABELS[part] ??
        part.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())

      return { href, label }
    })

  return breadcrumbs
}
