'use client'

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  Clock,
  CircleDollarSign,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {InstallmentPlan} from "@/schemas/installment-settings.schema";
import {usePosStore} from "@/store/use-pos-store";
import {useState} from "react";

interface InstallmentFormProps {
  total: number;
  initialPayment: number;
  setInitialPayment: (v: number) => void;
  totalMonths: number;
  setTotalMonths: (v: number) => void;
  currencySymbol?: string;
  plans?: InstallmentPlan[];
}

export function InstallmentForm({
                                  total,
                                  initialPayment,
                                  setInitialPayment,
                                  totalMonths,
                                  setTotalMonths,
                                  currencySymbol = "so'm",
                                  plans
                                }: InstallmentFormProps) {
  const [currentPlan, setCurrentPlan] = useState<InstallmentPlan>()


  const remainingAmount = total - initialPayment;
  const monthlyPayment = totalMonths > 0 ? Math.round(remainingAmount / totalMonths) : 0;

  const withCoefficient =
    currentPlan && totalMonths > 0
      ? Math.round(
        (remainingAmount * currentPlan.coefficient) /
        currentPlan.months
      )
      : 0;

  const currency = usePosStore(state => state.currency);



  return (
    <div className="space-y-6 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* ПЕРВЫЙ ВЗНОС */}
      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase opacity-40 ml-1 tracking-widest flex items-center gap-2">
          <Wallet className="size-3" /> Boshlang‘ich to‘lov
        </Label>
        <div className="relative">
          <Input
            type="number"
            value={initialPayment || ''}
            onChange={(e) => setInitialPayment(Number(e.target.value))}
            className="h-14 rounded-3xl bg-muted/40 border-none px-6 font-black text-xl focus-visible:ring-2 ring-primary/20"
            placeholder="0"
          />
          <div className="absolute right-12 top-1/2 -translate-y-1/2 text-xs font-bold opacity-30">
            {currency?.symbol}
          </div>
        </div>
      </div>

      {/* СРОК РАССРОЧКИ */}
      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase opacity-40 ml-1 tracking-widest flex items-center gap-2">
          <Clock className="size-3" /> Muddat (oy)
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {plans?.map((m) => (
            <Button
              key={m.id}
              type="button"
              variant={totalMonths === m.months ? 'default' : 'outline'}
              onClick={() => {
                setTotalMonths(m.months)
                setCurrentPlan(m)
              }}
              className={cn(
                "rounded-2xl h-12 font-black transition-all shadow-none",
                totalMonths === m.months ? "" : "bg-muted/20 border-transparent hover:bg-muted/40"
              )}
            >
              {m.months}
            </Button>
          ))}
        </div>
      </div>

      {/* РЕЗУЛЬТАТ (КАРТОЧКА) */}
      <div className="p-5 rounded-[2.5rem] bg-primary/5 border border-primary/10 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase opacity-40 leading-none">Qolgan summa </span>
            <span className="text-lg font-black">{remainingAmount.toLocaleString()} {currency?.symbol}</span>
          </div>
          <div className="size-10 rounded-full bg-background flex items-center justify-center border border-primary/10">
            <CircleDollarSign className="size-5 text-primary" />
          </div>
        </div>

        <div className="h-px bg-primary/10 w-full" />

        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase text-primary/60 leading-none mb-1">Oylik to‘lov</span>
            <span className="text-3xl font-black text-primary tracking-tighter">
              {withCoefficient.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
                ?? monthlyPayment.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] font-bold opacity-40 pb-1 uppercase">{currency?.symbol} / oy</span>
        </div>
      </div>

      {initialPayment >= total && total > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-destructive/10 text-destructive text-[10px] font-bold">
          <AlertCircle className="size-4" />
          Boshlang‘ich to‘lov jami summadan kam bo‘lishi kerak
        </div>
      )}
    </div>
  );
}