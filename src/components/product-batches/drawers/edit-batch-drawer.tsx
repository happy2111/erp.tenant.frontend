"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductBatchesService } from "@/services/product-batches.service";
import {
  UpdateProductBatchSchema,
  UpdateProductBatchDto,
  ProductBatch
} from "@/schemas/product-batches.schema";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

interface EditBatchDrawerProps {
  batch: ProductBatch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBatchDrawer({ batch, open, onOpenChange }: EditBatchDrawerProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProductBatchDto>({
    resolver: zodResolver(UpdateProductBatchSchema),
  });

  // Заполняем форму данными при открытии
  useEffect(() => {
    if (batch) {
      reset({
        batchNumber: batch.batchNumber,
        quantity: batch.quantity,
        expiryDate: batch.expiryDate ? new Date(batch.expiryDate).toISOString().split('T')[0] : null,
      });
    }
  }, [batch, reset]);

  const mutation = useMutation({
    mutationFn: (data: UpdateProductBatchDto) =>
      ProductBatchesService.update(batch!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-batches"] });
      queryClient.invalidateQueries({ queryKey: ["product-batches-stats"] });
      toast.success("Partiya muvaffaqiyatli yangilandi");
      onOpenChange(false);
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-4">
        <SheetHeader>
          <SheetTitle className="uppercase font-black tracking-tighter">
            Partiyani tahrirlash
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6 mt-8">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold opacity-60">Partiya raqami</Label>
            <Input {...register("batchNumber")} placeholder="BATCH-2024-..." className="rounded-xl" />
            {errors.batchNumber && <p className="text-red-500 text-xs">{errors.batchNumber.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold opacity-60">Miqdori (dona)</Label>
            <Input type="number" {...register("quantity", { valueAsNumber: true })} className="rounded-xl" />
            {errors.quantity && <p className="text-red-500 text-xs">{errors.quantity.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold opacity-60">Amal qilish muddati</Label>
            <Input type="date" {...register("expiryDate")} className="rounded-xl" />
          </div>

          <Button
            disabled={mutation.isPending}
            className="w-full rounded-2xl h-12 font-bold uppercase tracking-widest bg-orange-600 hover:bg-orange-700"
          >
            {mutation.isPending ? <Loader2 className="animate-spin mr-2" /> : "Saqlash"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}