"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Select({
                  ...props
                }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
                       ...props
                     }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
                       ...props
                     }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
                         className,
                         size = "default",
                         children,
                         ...props
                       }: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        // Базовые размеры (высота увеличена до h-12 как у Input)
        "flex w-full items-center justify-between gap-2 px-4 py-2 text-base md:text-[15px] transition-all duration-200 whitespace-nowrap outline-none",
        "data-[size=default]:h-12 data-[size=sm]:h-9",

        // Стекло и фон
        "bg-background/50 backdrop-blur-md dark:bg-input/20",

        // Границы и скругления
        "border-2 border-border/60 rounded-[12px] shadow-sm",
        "data-[placeholder]:text-muted-foreground/60",

        // Интерактивность (Фокус и Ховер)
        "hover:bg-background/80 hover:border-primary/30",
        "focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/10",

        // Иконки и внутренности
        "*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground/50",

        // Ошибки и Disabled
        "aria-invalid:border-destructive aria-invalid:ring-destructive/10 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-5 opacity-60 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
                         className,
                         children,
                         position = "popper",
                         align = "center",
                         ...props
                       }: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          // Стеклянная панель выпадающего списка
          "relative z-50 min-w-[var(--radix-select-trigger-width)] max-h-96 overflow-hidden",
          "bg-card/90 backdrop-blur-2xl border-2 border-border/60 rounded-[16px] shadow-2xl shadow-black/10",
          "text-popover-foreground",

          // Анимации
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-4 data-[side=top]:slide-in-from-bottom-4",

          position === "popper" &&
          "data-[side=bottom]:translate-y-2 data-[side=top]:-translate-y-2",
          className
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1.5",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({
                      className,
                      children,
                      ...props
                    }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        // Элемент списка (увеличена высота и отступы)
        "relative flex w-full cursor-default items-center gap-2 rounded-[8px] py-3 pr-8 pl-3 text-sm font-medium outline-none select-none transition-colors",
        "focus:bg-primary/10 focus:text-primary active:bg-primary/20",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        className
      )}
      {...props}
    >
      <span className="absolute right-3 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4 stroke-[3px]" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

// Остальные вспомогательные компоненты (Separator, Labels и т.д.)
function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return <SelectPrimitive.Label className={cn("px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50", className)} {...props} />
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator className={cn("bg-border/40 -mx-1 my-1.5 h-px", className)} {...props} />
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton className={cn("flex cursor-default items-center justify-center py-1 opacity-50", className)} {...props}>
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton className={cn("flex cursor-default items-center justify-center py-1 opacity-50", className)} {...props}>
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}