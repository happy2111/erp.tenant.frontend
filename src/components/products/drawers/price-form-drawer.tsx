'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateProductPriceSchema,
  PriceTypeValues,
} from '@/schemas/product-prices.schema';
import { ProductPricesService } from '@/services/product-prices.service';
import { CurrencyService } from '@/services/currency.service';
import { OrganizationService } from '@/services/organization.service';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";

function PriceFormDrawer({
                                  productId, open, onOpenChange, editingPrice, onSuccess
                                }: any) {
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(CreateProductPriceSchema),
    defaultValues: {
      productId,
      priceType: 'WHOLESALE',
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

        // ИСПРАВЛЕНИЕ: Проверяем, является ли oData массивом или объектом с полем items
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
        reset({ productId, priceType: 'WHOLESALE', amount: '', customerType: 'CLIENT' });
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-background/80 backdrop-blur-2xl border-t border-border/50">
        <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-black tracking-tighter italic uppercase italic">
              {editingPrice ? "Narxni tahrirlash" : "Yangi narx qo'shish"}
            </DrawerTitle>
          </DrawerHeader>

          <div className="p-4 space-y-6">
            {/* Amount & Currency Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 px-1">Summa</label>
                <Input {...register('amount')} placeholder="0.00" className="h-12 text-lg font-black italic tracking-tighter" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 px-1">Valyuta</label>
                <div className="grid grid-cols-2 gap-2">
                  {currencies.map(c => (
                    <div
                      key={c.id}
                      onClick={() => setValue('currencyId', c.id)}
                      className={cn(
                        "h-12 rounded-xl border flex items-center justify-center cursor-pointer transition-all font-black text-xs",
                        currentCurrency === c.id ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-card/40 border-border/40 hover:bg-card/60"
                      )}
                    >
                      {c.code}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Type Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50 px-1">Narx turi</label>
              <div className="flex flex-wrap gap-2">
                {PriceTypeValues.map(type => (
                  <div
                    key={type}
                    onClick={() => setValue('priceType', type)}
                    className={cn(
                      "px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all",
                      currentPriceType === type ? "bg-primary/20 border-primary/40 text-primary" : "bg-card/20 border-border/20"
                    )}
                  >
                    {type}
                  </div>
                ))}
              </div>
            </div>

            {/* Organization Selector (Simulated Search) */}
            {/*<div className="space-y-2">*/}
            {/*  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 px-1">*/}
            {/*    Tashkilot (Ixtiyoriy)*/}
            {/*  </label>*/}

            {/*  <Select*/}
            {/*    value={watch('organizationId') ?? 'ALL'}*/}
            {/*    onValueChange={(value) => {*/}
            {/*      if (value === 'ALL') {*/}
            {/*        setValue('organizationId', undefined);*/}
            {/*      } else {*/}
            {/*        setValue('organizationId', value);*/}
            {/*      }*/}
            {/*    }}*/}
            {/*  >*/}
            {/*    <SelectTrigger className="w-full h-12 rounded-xl bg-card/40 backdrop-blur-xl border border-border/40 px-4 text-xs font-bold focus:ring-2 ring-primary/20">*/}
            {/*      <SelectValue placeholder="Barcha tashkilotlar uchun" />*/}
            {/*    </SelectTrigger>*/}

            {/*    <SelectContent>*/}
            {/*      <SelectItem value="ALL">*/}
            {/*        Barcha tashkilotlar uchun*/}
            {/*      </SelectItem>*/}

            {/*      {orgs.map((o) => (*/}
            {/*        <SelectItem key={o.id} value={o.id}>*/}
            {/*          {o.name}*/}
            {/*        </SelectItem>*/}
            {/*      ))}*/}
            {/*    </SelectContent>*/}
            {/*  </Select>*/}
            {/*</div>*/}

          </div>

            <DrawerFooter className="pb-8">
            <Button type="submit" disabled={loading} className="h-14 rounded-[1.5rem] text-[12px] font-black uppercase tracking-[0.2em] italic shadow-xl shadow-primary/20">
              {loading && <Loader2 className="mr-2 animate-spin" />}
              {editingPrice ? "O'zgarishlarni saqlash" : "Narxni tasdiqlash"}
            </Button>
            <Button  variant="ghost" type="button" onClick={() => onOpenChange(false)} className="rounded-xl mt-3 opacity-50">Bekor qilish</Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}

export default PriceFormDrawer