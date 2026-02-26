"use client"

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpsertInstallmentLimitDto, UpsertInstallmentLimitSchema } from "@/schemas/installment-settings.schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { currencyService } from "@/services/currency.service";
import {Currency} from "@/schemas/currency.schema";

interface UpsertLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpsertInstallmentLimitDto) => void;
  isLoading: boolean;
  initialData?: UpsertInstallmentLimitDto & { currencyId: string };
}

export function UpsertLimitModal({ isOpen, onClose, onSubmit, isLoading, initialData }: UpsertLimitModalProps) {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [minEnabled, setMinEnabled] = useState(false);
  const [maxEnabled, setMaxEnabled] = useState(false);


  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<UpsertInstallmentLimitDto>({
    resolver: zodResolver(UpsertInstallmentLimitSchema) as any,
    defaultValues: {
      currencyId: initialData?.currencyId || "",
      minInitialPayment: initialData?.minInitialPayment ?? null,
      maxAmount: initialData?.maxAmount ?? null,
    },
  });


  useEffect(() => {
    if (isOpen) {
      reset({
        currencyId: initialData?.currencyId || "",
        minInitialPayment: initialData?.minInitialPayment ?? null,
        maxAmount: initialData?.maxAmount ?? null,
      });
    }
  }, [initialData, isOpen, reset]);

  useEffect(() => {
    currencyService.findAll().then(setCurrencies);
  }, []);

  useEffect(() => {
    reset(initialData || { currencyId: "", minInitialPayment: 0, maxAmount: 0 });
  }, [initialData, reset]);

  const handleFormSubmit = (data: UpsertInstallmentLimitDto & { currencyId: string }) => {
    onSubmit({
      ...data,
      minInitialPayment: minEnabled ? data.minInitialPayment : null,
      maxAmount: maxEnabled ? data.maxAmount : null,
    });
    reset();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase italic tracking-tighter">
            {initialData ? "Limitni tahrirlash" : "Yangi limit qo‘shish"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
          {/* Валюта */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase opacity-50 ml-1">Valyuta</Label>
            <Select
              onValueChange={(val) => setValue("currencyId", val)}
              defaultValue={initialData?.currencyId || ""}
            >
              <SelectTrigger className="w-full h-12 rounded-xl bg-muted/50 border-none font-bold">
                <SelectValue placeholder="Valyutani tanlang" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.currencyId && <p className="text-destructive text-[10px] font-bold">{errors.currencyId.message}</p>}
          </div>

          {/* Min Initial Payment */}
          <div className="space-y-2">
            <Label className="flex justify-between items-center text-[10px] font-black uppercase opacity-50 ml-1">
              <span>Min. boshlang‘ich to‘lov (%)</span>
              <input type="checkbox" checked={minEnabled} onChange={(e) => setMinEnabled(e.target.checked)} />
            </Label>
            <Input
              {...register("minInitialPayment", {
                valueAsNumber: true,
                setValueAs: (v) => (v === "" ? null : Number(v)),
              })}
              type="number"
              step="0.01"
              disabled={!minEnabled}
              className="h-12 rounded-xl bg-muted/50 border-none font-bold"
            />
            {errors.minInitialPayment && (
              <p className="text-destructive text-[10px] font-bold">{errors.minInitialPayment.message}</p>
            )}
          </div>

          {/* Max Amount */}
          <div className="space-y-2">
            <Label className="flex justify-between items-center text-[10px] font-black uppercase opacity-50 ml-1">
              <span>Maks. summa</span>
              <input type="checkbox" checked={maxEnabled} onChange={(e) => setMaxEnabled(e.target.checked)} />
            </Label>
            <Input
              {...register("maxAmount", {
                valueAsNumber: true,
                setValueAs: (v) => (v === "" ? null : Number(v)),
              })}
              type="number"
              step="0.01"
              disabled={!maxEnabled}
              className="h-12 rounded-xl bg-muted/50 border-none font-bold"
            />
            {errors.maxAmount && (
              <p className="text-destructive text-[10px] font-bold">{errors.maxAmount.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl font-black uppercase tracking-widest"
            >
              {isLoading ? "Yuklanmoqda..." : initialData ? "O‘zgartirish" : "Qo‘shish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
