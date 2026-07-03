'use client'

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PosSetupFields } from '@/components/pos/sections/PosSetupFields';
import { usePosStore } from '@/store/use-pos-store';
import { LayoutTemplate } from 'lucide-react';

export function PosSetupModal() {
  const [open, setOpen] = useState(true);
  const { currencyId, kassaId, customerId } = usePosStore();
  // const isComplete = Boolean(currencyId);
  const isComplete = true;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isComplete) return;
        setOpen(nextOpen);
      }}
    >
      <DialogContent
        showCloseButton={isComplete}
        className="fixed inset-0 top-0 left-0 z-[100] flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 p-0 shadow-none sm:max-w-none"
        onInteractOutside={(event) => {
          if (!isComplete) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (!isComplete) event.preventDefault();
        }}
      >
        <div className="flex flex-1 flex-col overflow-hidden bg-background">
          <div className="border-b border-border/40 bg-background/80 px-6 pb-6 pt-10 backdrop-blur-xl">
            <DialogHeader className="items-center text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-[1.5rem] bg-primary/10 ring-1 ring-primary/20">
                <LayoutTemplate className="size-8 text-primary" />
              </div>
              <DialogTitle className="text-3xl font-black uppercase italic tracking-tight">
                POS sozlash
              </DialogTitle>
              <DialogDescription className="max-w-sm text-base">
                Savdo boshlash uchun mijoz, valyuta va kassani tanlang
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mx-auto w-full max-w-lg">
              <PosSetupFields layout="modal" showReset={false} />
            </div>
          </div>

          <div className="border-t border-border/40 bg-background/90 p-6 backdrop-blur-xl">
            <Button
              className="mx-auto h-14 w-full max-w-lg rounded-2xl text-sm font-black uppercase"
              disabled={!isComplete}
              onClick={() => setOpen(false)}
            >
              Davom etish
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
