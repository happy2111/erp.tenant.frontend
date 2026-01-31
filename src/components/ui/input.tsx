import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Базовые размеры и шрифты
        "flex h-12 w-full px-4 py-2 text-base md:text-sm transition-all duration-300",

        // Glassmorphism (Стеклянный эффект как в карточках)
        "bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl shadow-inner",

        // Текст и плейсхолдер
        "text-foreground placeholder:text-muted-foreground/40 font-medium tracking-tight",

        // Состояние фокуса (Мягкое свечение в стиле Primary)
        "focus:outline-none focus:bg-background/60 focus:border-primary/40 focus:ring-4 focus:ring-primary/10",

        // Эффект при наведении (hover)
        "hover:border-border hover:bg-card/60",

        // Файлы
        "file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-primary",

        // Состояние ошибки
        "aria-invalid:border-destructive/60 aria-invalid:ring-destructive/10",

        // Отключенное состояние
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale-[50%]",

        className
      )}
      {...props}
    />
  )
}

export { Input }