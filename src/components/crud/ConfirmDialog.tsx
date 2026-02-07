"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
                                open,
                                onOpenChange,
                                title = "Подтвердите действие",
                                description = "Вы уверены, что хотите удалить элемент?",
                                onConfirm,
                              }: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-card/60 backdrop-blur-2xl border-white/20 rounded-[3rem] p-0 overflow-hidden sm:max-w-[420px] shadow-2xl"
      >
        <DialogClose asChild>
          <Button className="absolute bg-primary-foreground backdrop-blur-3xl top-4 right-4 h-10 w-10 rounded-full hover:bg-muted/30 transition z-50 shadow-none">
            <X className="size-5 text-primary sm:text-gray-500" />
          </Button>
        </DialogClose>

        {/* Декоративный блик */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-destructive/40 to-transparent" />

        <div className="p-3 sm:p-8 pt-12 sm:pt-12">
          <DialogHeader className="mb-4 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-destructive/10">
                <AlertCircle className="size-6 text-destructive" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight uppercase italic opacity-90">
                {title}
              </DialogTitle>
            </div>
          </DialogHeader>

          <p className="text-sm font-medium opacity-70 leading-relaxed mb-8 px-1">
            {description}
          </p>

          {/* Кнопки теперь всегда в колонку на мобилках и без теней */}
          <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:gap-3">
            <Button
              variant="outline"
              className="w-full h-16 rounded-4xl text-base font-black uppercase backdrop-blur-2xl transition-all active:scale-[0.98]"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              className="w-full h-16 rounded-4xl text-base font-black uppercase backdrop-blur-2xl transition-all active:scale-[0.98]"
              onClick={handleConfirm}
            >
              Подтвердить
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}