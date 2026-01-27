import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Базовые размеры и отступы (высота увеличена до h-12)
        "h-12 w-full px-4 py-2 text-base md:text-[15px] transition-all duration-200",

        // Фон и стекло (Liquid Glass)
        "bg-background/50 backdrop-blur-md dark:bg-input/20",

        // Границы (делаем их четче, как в ваших карточках)
        "border-2 border-border/60 rounded-[12px] shadow-sm",

        // Текст и плейсхолдер
        "text-foreground placeholder:text-muted-foreground/50 font-medium",

        // Файлы
        "file:inline-flex file:h-full file:border-0 file:bg-transparent file:text-sm file:font-bold file:text-primary",

        // Состояние фокуса (интенсивное свечение)
        "focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:outline-none",

        // Состояние ошибки
        "aria-invalid:border-destructive aria-invalid:ring-destructive/10",

        // Отключенное состояние
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted/30",

        className
      )}
      {...props}
    />
  )
}

export { Input }