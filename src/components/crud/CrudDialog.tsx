"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function CrudDialog({
                             open,
                             title,
                             onOpenChange,
                             children,
                             className,
                           }: Props) {
  return (
    <div className="py-4">
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className={cn(
            "bg-card/60 backdrop-blur-2xl border-white/20 sm:max-w-[550px] rounded-[3rem] p-0 h-[80vh]  overflow-hidden shadow-2xl",
            className
          )}
        >
          {/* Кнопка закрытия идентична AddToCartModal */}
          <DialogClose asChild>
            <Button className="absolute bg-primary top-4 right-4 h-10 w-10 rounded-full hover:bg-muted/30 transition z-50 shadow-none">
              <X className="size-5 text-primary-foreground sm:text-gray-500" />
            </Button>
          </DialogClose>

          {/* Декоративный блик сверху */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          {/* Отступы идентичны p-3 sm:p-8 */}
          <div className="mt-4 p-3 sm:p-8 pt-12 sm:pt-12 space-y-8 overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tight uppercase italic opacity-90 text-left leading-tight">
                {title}
              </DialogTitle>
            </DialogHeader>

            <div className="relative">
              {children}
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}