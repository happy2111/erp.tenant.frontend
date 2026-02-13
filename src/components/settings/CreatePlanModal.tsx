"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateInstallmentPlanSchema, CreateInstallmentPlanDto } from "@/schemas/installment-settings.schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInstallmentPlanDto) => void;
  isLoading: boolean;
}

export function CreatePlanModal({ isOpen, onClose, onSubmit, isLoading }: CreatePlanModalProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateInstallmentPlanDto>({
    resolver: zodResolver(CreateInstallmentPlanSchema),
    defaultValues: { months: 1, coefficient: 1.0 }
  });

  const handleFormSubmit = (data: CreateInstallmentPlanDto) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase italic tracking-tighter">
            Yangi reja
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase opacity-50 ml-1">
              Muddat (oylar)
            </Label>
            <Input
              {...register("months", { valueAsNumber: true })}
              type="number"
              className="h-12 rounded-xl bg-muted/50 border-none font-bold"
            />
            {errors.months && (
              <p className="text-destructive text-[10px] font-bold">
                {errors.months.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase opacity-50 ml-1">
              Narx koeffitsienti (masalan: 1.15)
            </Label>
            <Input
              {...register("coefficient", { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="h-12 rounded-xl bg-muted/50 border-none font-bold"
            />
            {errors.coefficient && (
              <p className="text-destructive text-[10px] font-bold">
                {errors.coefficient.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl font-black uppercase tracking-widest"
            >
              {isLoading ? "Yaratilmoqda..." : "Reja qo‘shish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}