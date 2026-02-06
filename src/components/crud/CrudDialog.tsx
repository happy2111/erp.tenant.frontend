"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  title: string;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
  className?: string; // Добавил для гибкости
}

export function CrudDialog({
                             open,
                             title,
                             onOpenChange,
                             children,
                             className,
                           }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // Эффект жидкого стекла
          "bg-card/60 backdrop-blur-2xl border-white/20 shadow-2xl",
          // Геометрия
          "sm:max-w-[550px] rounded-[2.5rem] p-0 overflow-hidden",
          className
        )}
      >
        {/* Декоративный блик сверху */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black tracking-tight uppercase italic opacity-80">
              {title}
            </DialogTitle>
          </DialogHeader>

          <div className="relative">
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}