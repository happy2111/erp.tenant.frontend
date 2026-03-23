import { useEffect } from "react"

export function useSidebarGesture(toggleSidebar: () => void) {
  useEffect(() => {
    let startX = 0
    let startY = 0
    let isTracking = false

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      const screenWidth = window.innerWidth

      if (touch.clientX < screenWidth - 20 && touch.clientX > screenWidth - 80) {
        startX = touch.clientX
        startY = touch.clientY
        isTracking = true
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (!isTracking) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - startX
      const deltaY = Math.abs(touch.clientY - startY)

      if (deltaX < -60 && deltaY < 50) {
        toggleSidebar()
      }

      isTracking = false
    }

    window.addEventListener("touchstart", onTouchStart)
    window.addEventListener("touchend", onTouchEnd)

    return () => {
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchend", onTouchEnd)
    }
  }, [toggleSidebar])
}