"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateKassaSchema, CreateKassaDto, KassaTypeValues } from "@/schemas/kassas.schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CurrencySelectorDrawer } from "./currency-selector-drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface Props {
  onSubmit: (data: CreateKassaDto) => void;
  isLoading: boolean;
  defaultValues?: Partial<CreateKassaDto>;
}

export function CreateKassaForm({ onSubmit, isLoading, defaultValues }: Props) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateKassaDto>({
    resolver: zodResolver(CreateKassaSchema),
    defaultValues: {
      type: 'наличные',
      ...defaultValues
    }
  });

  const selectedCurrencyId = watch("currencyId");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Название */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">
            Название кассы
          </Label>
          <Input
            {...register("name")}
            placeholder="Основная касса (USD)"
            className="h-12 rounded-2xl"
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        {/* Тип кассы */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">
            Kassa turi
          </Label>
          <div className="relative">
            <Input
              {...register("type")}
              placeholder="Kassa turini kiriting (masalan: Asosiy, Filial или Naqd)"
              className="h-12 rounded-2xl bg-muted/30 border-border/50 focus:bg-background transition-all pl-4"
            />
          </div>
          <p className="text-[9px] text-muted-foreground ml-1 italic">
            * Bu yerda kassaning operatsion turi ko'rsatiladi
          </p>
        </div>

        {/* Выбор валюты (Drawer) */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">
            Валюта
          </Label>
          <CurrencySelectorDrawer
            selectedId={selectedCurrencyId}
            onSelect={(id) => setValue("currencyId", id)}
          />
          {errors.currencyId && <p className="text-xs text-destructive">{errors.currencyId.message}</p>}
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl font-black uppercase italic tracking-widest">
        {isLoading ? "Сохранение..." : "Создать кассу"}
      </Button>
    </form>
  );
}