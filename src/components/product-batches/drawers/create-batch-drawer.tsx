"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateProductBatchSchema, CreateProductBatchDto } from "@/schemas/product-batches.schema";
import { ProductBatchesService } from "@/services/product-batches.service";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Boxes, Calendar, Loader2, X } from "lucide-react";

interface Props {
  variantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBatchDrawer({ variantId, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductBatchDto>({
    resolver: zodResolver(CreateProductBatchSchema),
    defaultValues: {
      productVariantId: variantId,
      quantity: 1,
      batchNumber: `BATCH-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateProductBatchDto) => ProductBatchesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-batches", variantId] });
      queryClient.invalidateQueries({ queryKey: ["product-batches-stats", variantId] });
      toast.success("Yangi partiya muvaffaqiyatli qo'shildi");
      reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-xl mx-auto rounded-t-[2.5rem] border-t-primary/20">
        <DrawerHeader className="text-center pt-8">
          <div className="mx-auto size-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4 border border-orange-500/20">
            <Boxes className="size-7 text-orange-600" />
          </div>
          <DrawerTitle className="text-2xl font-black italic uppercase tracking-tighter">
            Partiya Qo'shish
          </DrawerTitle>
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-40 font-bold">
            Ombor zaxirasini to&apos;ldirish
          </p>
        </DrawerHeader>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">

            {/* Batch Number */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">
                Partiya raqami
              </Label>
              <Input
                {...register("batchNumber")}
                placeholder="Masalan: B-105"
                className="h-12 rounded-2xl bg-muted/50 border-border/50 font-mono focus:bg-background transition-all"
              />
              {errors.batchNumber && <p className="text-[10px] text-destructive font-bold">{errors.batchNumber.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Quantity */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">
                  Miqdori (Dona)
                </Label>
                <Input
                  type="number"
                  {...register("quantity", { valueAsNumber: true })}
                  className="h-12 rounded-2xl bg-muted/50 border-border/50 font-black focus:bg-background transition-all"
                />
                {errors.quantity && <p className="text-[10px] text-destructive font-bold">{errors.quantity.message}</p>}
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">
                  Amal qilish muddati
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="datetime-local"
                    {...register("expiryDate")}
                    className="h-12 pl-10 rounded-2xl bg-muted/50 border-border/50 focus:bg-background transition-all"
                  />
                </div>
                {errors.expiryDate && <p className="text-[10px] text-destructive font-bold">{errors.expiryDate.message}</p>}
              </div>
            </div>
          </div>

          <DrawerFooter className="px-0 pt-4 flex-row gap-3">
            <DrawerClose asChild>
              <Button type="button" variant="ghost" className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest opacity-40">
                Bekor qilish
              </Button>
            </DrawerClose>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="flex-[2] h-14 rounded-2xl bg-orange-600 hover:bg-orange-700 font-black uppercase tracking-widest italic"
            >
              {mutation.isPending ? <Loader2 className="animate-spin" /> : "Saqlash"}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}