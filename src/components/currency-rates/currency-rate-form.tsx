
// src/components/currency-rates/currency-rate-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { currencyService } from "@/services/currency.service";
import { CreateCurrencyRateSchema, CreateCurrencyRateDto } from "@/schemas/currency-rates.schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowRightLeft } from "lucide-react";

interface Props {
  onSubmit: (data: CreateCurrencyRateDto) => void;
  isLoading: boolean;
}

export function CurrencyRateForm({ onSubmit, isLoading }: Props) {
  const { data: currencies, isLoading: currenciesLoading } = useQuery({
    queryKey: ["currencies"],
    queryFn: () => currencyService.findAll(),
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateCurrencyRateDto>({
    resolver: zodResolver(CreateCurrencyRateSchema),
  });

  if (currenciesLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-primary opacity-50" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        {/* Базовая валюта */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Sotiladigan valyuta (From)</Label>
          <Select onValueChange={(val) => setValue("baseCurrency", val)}>
            <SelectTrigger className="h-12 rounded-2xl border-sidebar-border/40">
              <SelectValue placeholder="Tanlang..." />
            </SelectTrigger>
            <SelectContent>
              {currencies?.map((c) => (
                <SelectItem key={c.id} value={c.code}>
                  <span className="font-bold">{c.code}</span> — {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.fromCurrencyId && <p className="text-[10px] text-destructive italic">{errors.fromCurrencyId.message}</p>}
        </div>

        {/* Целевая валюта */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Olinadigan valyuta (To)</Label>
          <Select onValueChange={(val) => setValue("targetCurrency", val)}>
            <SelectTrigger className="h-12 rounded-2xl border-sidebar-border/40">
              <SelectValue placeholder="Tanlang..." />
            </SelectTrigger>
            <SelectContent>
              {currencies?.map((c) => (
                <SelectItem key={c.id} value={c.code}>
                  <span className="font-bold">{c.code}</span> — {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.toCurrencyId && <p className="text-[10px] text-destructive italic">{errors.toCurrencyId.message}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Kurs (Rate)</Label>
          <div className="relative">
            <Input
              {...register("rate")}
              type="text"
              placeholder="0.00"
              className="h-14 rounded-2xl border-sidebar-border/40 pl-4 font-mono text-lg font-bold"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
              <ArrowRightLeft className="size-5" />
            </div>
          </div>
          {errors.rate && <p className="text-[10px] text-destructive italic">{errors.rate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Sana (Date)</Label>
          <Input
            {...register("date")}
            type="date"
            className="h-12 rounded-2xl border-sidebar-border/40 uppercase text-xs"
            defaultValue={new Date().toISOString().split('T')[0]}
          />
          {errors.date && <p className="text-[10px] text-destructive italic">{errors.date.message}</p>}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-14 rounded-2xl font-black uppercase italic tracking-widest"
      >
        {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Kursni saqlash"}
      </Button>
    </form>
  );
}