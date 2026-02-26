"use client"

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InstallmentSettingsService } from '@/services/installment-settings.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {Plus, Trash2, Percent, Lock, Edit} from 'lucide-react';
import { toast } from 'sonner';
import { CreatePlanModal } from './CreatePlanModal';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { InfoPopup } from "@/components/InfoPopup";
import { UpsertLimitModal } from './UpsertLimitModal';
import {
  InstallmentLimit,
  UpsertInstallmentLimitDto
} from "@/schemas/installment-settings.schema";
import {InstallmentsService} from "@/services/installments.service";



export function InstallmentSettingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [editingLimit, setEditingLimit] = useState<InstallmentLimit | null>(null);


  const handleCreateLimit = () => {
    setEditingLimit(null);
    setIsLimitModalOpen(true);
  };

  const handleEditLimit = (limit: InstallmentLimit) => {
    setEditingLimit(limit);
    setIsLimitModalOpen(true);
  };


  const { data: settings, isLoading } = useQuery({
    queryKey: ['installment-settings'],
    queryFn: () => InstallmentSettingsService.getMySettings()
  });

  const upsertLimitMutation = useMutation({
    mutationFn: ({ currencyId, minInitialPayment, maxAmount }: UpsertInstallmentLimitDto & { currencyId: string }) =>
      InstallmentSettingsService.upsertLimit({currencyId, minInitialPayment, maxAmount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installment-settings'] });
      toast.success('Limit muvaffaqiyatli saqlandi');
      setIsLimitModalOpen(false);
    },
    onError: () => toast.error('Limitni saqlashda xatolik yuz berdi'),
  });


  const updateSettingsMutation = useMutation({
    mutationFn: InstallmentSettingsService.updateMySettings,
    onSuccess: (data) => {
      queryClient.setQueryData(['installment-settings'], data);
      queryClient.invalidateQueries({ queryKey: ['installment-settings'] });
      toast.success('Sozlamalar muvaffaqiyatli yangilandi');
    },
    onError: () => toast.error('Sozlamalarni yangilab bo‘lmadi')
  });

  const deleteLimitMutation = useMutation({
    mutationFn: (limitId: string) => InstallmentSettingsService.deleteLimit(limitId),
    onSuccess: () => {
      // Перезагружаем данные после успешного удаления
      queryClient.invalidateQueries({ queryKey: ['installment-settings'] });
      toast.success('Limit o‘chirildi');
    },
    onError: () => toast.error('Limitni o‘chirishda xatolik yuz berdi'),
  });


  const planMutation = useMutation({
    mutationFn: InstallmentSettingsService.createPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installment-settings'] });
      toast.success('Rassrochka rejasi qo‘shildi');
      setIsModalOpen(false);
    }
  });

  const deletePlanMutation = useMutation({
    mutationFn: InstallmentSettingsService.deletePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installment-settings'] });
      toast.error('Reja o‘chirildi');
    }
  });

  if (isLoading) return <div className="animate-pulse p-10 font-black  uppercase">Ma’lumotlar yuklanmoqda...</div>;

  const isActive = settings?.isActive ?? false;

  const handleGlobalUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateSettingsMutation.mutate({
      penaltyPercent: Number(formData.get('penaltyPercent')),
    });
  };

  return (
    <div className="space-y-10 pb-20 relative">
      {/* Шапка */}
      <div className="flex flex-wrap gap-2 justify-between items-center bg-card p-6 rounded-[2.5rem] border border-border/40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className={cn(
            "size-3 rounded-full animate-pulse",
            isActive ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]"
          )} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black  uppercase tracking-tighter leading-none">Rassrochka</h2>
              <InfoPopup
                title="Rassrochka xizmati"
                description="Tashkilot uchun rassrochka xizmatini yoqish yoki o'chirish. Yoqilgan holatda mijozlarga to'lovlarni bo'lib to'lash imkoniyati yaratiladi."
              />
            </div>
            <p className="text-[10px] font-bold uppercase opacity-40 mt-1">
              Holat: {isActive ? 'Xizmat ishlamoqda' : 'Xizmat o‘chirilgan'}
            </p>
          </div>
        </div>

        <Button
          onClick={() => updateSettingsMutation.mutate({ isActive: !isActive })}
          variant={isActive ? "destructive" : "default"}
          className="rounded-2xl max-sm:flex-1 font-black  uppercase text-[10px] px-8 h-12 transition-all active:scale-95"
        >
          {isActive ? 'O‘chirish' : 'Faollashtirish'}
        </Button>
      </div>

      <div className={cn(
        "space-y-10 transition-all duration-500",
        !isActive && "opacity-40 grayscale-[0.5] pointer-events-none select-none"
      )}>

        {/* Блок 1: Глобальные лимиты и штрафы */}
        <form onSubmit={handleGlobalUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-[2.5rem] border-none bg-card shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase opacity-60  tracking-widest">Jarima tizimi</span>
                  <InfoPopup
                    title="Jarimalar tartibi"
                    description="To'lov muddati o'tib ketgan taqdirda qo'llaniladigan foiz yoki belgilangan miqdordagi jarimalar sozlamalari."
                  />
                </div>
              </div>
              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-[9px] font-black uppercase ml-1 opacity-50 flex items-center gap-1">
                    Kunlik penya (%)
                    <InfoPopup
                      title="Foizli jarima"
                      description="Kechiktirilgan har bir kun uchun umumiy summadan hisoblanadigan jarima foizi. Masalan: 0.1 = kuniga 0.1%."
                    />
                  </label>
                  <Input
                    name="penaltyPercent"
                    defaultValue={settings?.penaltyPercent ?? 0}
                    type="number"
                    step="0.01"
                    className="h-12 bg-muted/50 border-none rounded-xl font-black text-lg focus:ring-2 focus:ring-destructive/20"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={updateSettingsMutation.isPending || !isActive}
                  className="rounded-xl font-black uppercase text-[10px] h-12 px-6 shadow-lg shadow-primary/20"
                >
                  Yangilash
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Блок 2: Планы */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Percent className="size-5 text-primary" />
              <h3 className="text-xl font-black  uppercase tracking-tighter">Rassrochka jadvallari</h3>
              <InfoPopup
                title="Rassrochka rejalari"
                description="Mijozlar uchun taklif qilinadigan muddatlar va ularga mos keladigan ustama koeffitsiyentlari."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {settings?.plans.map((plan) => (
              <div key={plan.id} className="p-6 rounded-[2.5rem] bg-card border border-border/50 flex justify-between items-center group hover:bg-muted/30 transition-all border-b-4 border-b-primary/10">
                <div>
                  <p className="text-[10px] font-black uppercase opacity-40">To‘lov muddati</p>
                  <p className="text-3xl font-black ">{plan.months} <span className="text-xs not- opacity-40">oy</span></p>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <div className="flex items-center justify-end gap-1">
                      <p className="text-[10px] font-black uppercase opacity-40 text-emerald-500">Koeff.</p>
                      <InfoPopup
                        title="Ustama koeffitsiyenti"
                        description={`Ushbu ${plan.months} oylik reja uchun narx koeffitsiyenti. Masalan: 1.15 koeffitsiyent narxni 15% ga oshiradi.`}
                      />
                    </div>
                    <p className="text-xl font-black  text-emerald-500 tracking-tight">x{plan.coefficient}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deletePlanMutation.mutate(plan.id)}
                    className=" transition-opacity rounded-full text-destructive"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            ))}

            <button
              onClick={() => isActive && setIsModalOpen(true)}
              className="p-6 rounded-[2.5rem] border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 group min-h-[120px]"
            >
              <div className="size-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                <Plus size={20} />
              </div>
              <span className="text-[10px] font-black uppercase opacity-40 group-hover:opacity-100 tracking-tighter text-center">
                Yangi muddat rejasi
              </span>
            </button>
          </div>
        </div>

        {/* Блок 3: Лимиты рассрочки */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Lock className="size-5 text-primary" />
              <h3 className="text-xl font-black uppercase tracking-tighter">Rassrochka limiti</h3>
              <InfoPopup
                title="Rassrochka limiti"
                description="Minimal va maksimal to‘lov limitlari tashkilot uchun belgilanishi mumkin."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {settings?.installment_limits && settings.installment_limits.length > 0 && (
              settings.installment_limits.map((limit) => (
                <div
                  key={limit.id}
                  className="p-6 rounded-[2.5rem] bg-card border border-border/50 flex justify-between items-center group hover:bg-muted/30 transition-all border-b-4 border-b-primary/10"
                >
                  <div>
                    {limit.minInitialPayment != null && (
                      <>
                        <p className="text-[10px] font-black uppercase opacity-40">Min boshlang‘ich to‘lov</p>
                        <p className="text-2xl font-black">{limit.minInitialPayment}{limit?.currency?.symbol}</p>
                      </>
                    )}
                    {limit.maxAmount != null && (
                      <>
                        <p className="text-[10px] font-black uppercase opacity-40 mt-2">Maks summa</p>
                        <p className="text-2xl font-black">{limit.maxAmount}{limit?.currency?.symbol}</p>
                      </>
                    )}
                  </div>

                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditLimit(limit)}
                      className="transition-opacity rounded-full text-destructive hover:bg-destructive/10"
                    >
                      <Edit size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteLimitMutation.mutate(limit.id)}
                      className=" transition-opacity rounded-full text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>

                </div>
              ))
            )}

            <button
              onClick={handleCreateLimit}
              className="p-6 rounded-[2.5rem] border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 group min-h-[120px]"
            >
              <div className="size-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                <Plus size={20} />
              </div>
              <span className="text-[10px] font-black uppercase opacity-40 group-hover:opacity-100 tracking-tighter text-center">
          Yangi limit qo‘shish
        </span>
            </button>
          </div>
        </div>

      </div>

      <UpsertLimitModal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        initialData={editingLimit as any}
        onSubmit={(data) => upsertLimitMutation.mutate(data)}
        isLoading={upsertLimitMutation.isPending}
      />


      <CreatePlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => planMutation.mutate(data)}
        isLoading={planMutation.isPending}
      />
    </div>
  );
}