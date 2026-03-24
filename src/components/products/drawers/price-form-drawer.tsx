'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateProductPriceSchema, PriceTypeLabels,
  PriceTypeValues,
} from '@/schemas/product-prices.schema';
import { ProductPricesService } from '@/services/product-prices.service';
import { CurrencyService } from '@/services/currency.service';
import { OrganizationService } from '@/services/organization.service';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

function PriceFormDialog({
                           productId, open, onOpenChange, editingPrice, onSuccess
                         }: any) {
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    resolver: zodResolver(CreateProductPriceSchema),
    defaultValues: {
      productId,
      priceType: 'CASH',
      amount: '',
      currencyId: '',
      customerType: 'CLIENT'
    }
  });

  const currentCurrency = watch('currencyId');
  const currentPriceType = watch('priceType');

  useEffect(() => {
    if (open) {
      Promise.all([
        new CurrencyService().findAll(),
        OrganizationService.getAllAdmin({ limit: 50 })
      ]).then(([cData, oData]) => {
        setCurrencies(cData);
        const organizationsArray = Array.isArray(oData) ? oData : (oData as any)?.items || [];
        setOrgs(organizationsArray);
      });

      if (editingPrice) {
        reset({
          productId: editingPrice.productId,
          priceType: editingPrice.priceType,
          amount: String(editingPrice.amount),
          currencyId: editingPrice.currencyId,
          customerType: editingPrice.customerType || 'CLIENT',
          organizationId: editingPrice.organizationId
        });
      } else {
        reset({ productId, priceType: 'CASH', amount: '', customerType: 'CLIENT' });
      }
    }
  }, [open, editingPrice, reset, productId]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      let result;
      if (editingPrice) {
        result = await ProductPricesService.update(editingPrice.id, data);
        toast.success("Narx yangilandi");
      } else {
        result = await ProductPricesService.create(data);
        toast.success("Yangi narx qo'shildi");
      }
      onSuccess(result);
    } catch (e) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "bg-card/60 backdrop-blur-2xl border-white/20",
          "rounded-[3rem] p-0 h-[80vh] overflow-hidden shadow-2xl",
          "sm:max-w-[550px]"
        )}
      >
        <DialogClose asChild>
          <Button className="absolute bg-primary top-4 right-4 h-10 w-10 rounded-full z-50">
            <X className="size-5 text-primary-foreground" />
          </Button>
        </DialogClose>

        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* Scrollable content */}
        <div className="mt-4 p-3 sm:p-8 pt-12 space-y-8 overflow-y-auto h-full">

          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tight uppercase italic opacity-90 text-left">
              {editingPrice ? "Narxni tahrirlash" : "Yangi narx qo'shish"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 px-1">
                  Summa
                </label>
                <Input
                  {...register('amount')}
                  placeholder="0.00"
                  className="h-12 text-lg font-black italic tracking-tighter"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 px-1">
                  Valyuta
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {currencies.map(c => (
                    <div
                      key={c.id}
                      onClick={() => setValue('currencyId', c.id)}
                      className={cn(
                        "h-12 rounded-xl border flex items-center justify-center cursor-pointer text-xs font-black transition-all",
                        currentCurrency === c.id
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-card/40 border-border/40"
                      )}
                    >
                      {c.code}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50 px-1">
                Narx turi
              </label>

              <div className="flex flex-wrap gap-2">
                {PriceTypeValues.map(type => (
                  <div
                    key={type}
                    onClick={() => setValue('priceType', type)}
                    className={cn(
                      "px-4 py-2 rounded-xl border text-[10px] font-bold uppercase cursor-pointer",
                      currentPriceType === type
                        ? "bg-primary/20 border-primary/40 text-primary"
                        : "bg-card/20 border-border/20"
                    )}
                  >
                    {PriceTypeLabels[type]}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                disabled={loading}
                className="h-14 w-full rounded-[1.5rem] text-[12px] font-black uppercase"
              >
                {loading && <Loader2 className="mr-2 animate-spin" />}
                {editingPrice
                  ? "O'zgarishlarni saqlash"
                  : "Narxni tasdiqlash"}
              </Button>

              <Button
                variant="ghost"
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-full rounded-xl opacity-50"
              >
                Bekor qilish
              </Button>
            </div>

          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PriceFormDialog;