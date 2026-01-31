import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Базовые стили и размеры
        "flex min-h-24 w-full px-4 py-3 text-base md:text-sm transition-all duration-300",

        // Позволяет textarea расти вместе с контентом (если поддерживается)
        "field-sizing-content",

        // Glassmorphism (Тот же стиль, что и у Input)
        "bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl shadow-inner",

        // Текст и плейсхолдер
        "text-foreground placeholder:text-muted-foreground/40 font-medium tracking-tight outline-none",

        // Состояние фокуса
        "focus:bg-background/60 focus:border-primary/40 focus:ring-4 focus:ring-primary/10",

        // Эффект при наведении
        "hover:border-border hover:bg-card/60",

        // Состояние ошибки
        "aria-invalid:border-destructive/60 aria-invalid:ring-destructive/10",

        // Отключенное состояние
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale-[50%] resize-none",

        className
      )}
      {...props}
    />
  )
}

export { Textarea }