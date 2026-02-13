'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InstallmentsService } from '@/services/installments.service';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Calendar,
  User,
  CreditCard,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  History,
  TrendingDown,
  Phone,
  ExternalLink,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { useState } from 'react';
import { AddInstallmentPaymentModal } from './AddInstallmentPaymentModal';

export function InstallmentDetailView({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { data: installment, isLoading } = useQuery({
    queryKey: ['installment', id],
    queryFn: () => InstallmentsService.getById(id),
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse font-black opacity-20 uppercase tracking-widest">Загрузка данных рассрочки...</div>;
  if (!installment) return <div className="p-8 text-center font-bold">Рассрочка не найдена</div>;

  const statusStyles = {
    COMPLETED: "bg-emerald-500/20 text-emerald-600 border-emerald-500/20",
    PENDING: "bg-blue-500/20 text-blue-600 border-blue-500/20",
    OVERDUE: "bg-destructive/20 text-destructive border-destructive/20 animate-pulse",
    CANCELLED: "bg-muted text-muted-foreground border-border",
  };

  const paidForInstallment = Math.max(
    0,
    installment.paidAmount - installment.initialPayment
  );

  const payProgress =
    installment.totalAmount > 0
      ? (paidForInstallment / installment.totalAmount) * 100
      : 0;


  return (
    <div className="flex flex-col h-full space-y-6 p-4 lg:p-8 bg-transparent max-w-[1400px] mx-auto">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost" size="icon"
            onClick={() => router.back()}
            className="rounded-2xl bg-card/40 backdrop-blur-xl border border-border/50"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">Рассрочка</h1>
              <Badge className={cn("rounded-lg border font-black text-[10px]", statusStyles[installment.status])}>
                {installment.status}
              </Badge>
            </div>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">
              Оформлено: {format(new Date(installment.createdAt), 'dd.MM.yyyy')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-2xl font-bold text-xs uppercase border-border/50 bg-card/40 backdrop-blur-md">
            <FileText className="size-4 mr-2" /> Чек продажи
          </Button>
          {installment.status !== 'COMPLETED' && (
            <Button
              onClick={() => setIsPaymentModalOpen(true)}
              className="rounded-2xl font-black text-xs uppercase shadow-xl shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform"
            >
              <Plus className="size-4 mr-2" /> Добавить платёж
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: Progress & Payments */}
        <div className="lg:col-span-2 space-y-6">

          {/* PROGRESS CARD */}
          <Card className="rounded-[2.5rem] border-none bg-card/40 backdrop-blur-xl p-8 overflow-hidden relative shadow-none">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <TrendingDown className="size-32" />
            </div>
            <div className="relative z-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase opacity-40 tracking-widest">Сумма рассрочки</span>
                  <p className="text-3xl font-black italic">{installment.totalAmount.toLocaleString()} <span className="text-sm opacity-40 not-italic font-medium">{installment.sale?.currency.symbol}</span></p>
                </div>
                <div className="space-y-1 text-emerald-500">
                  <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">Оплачено</span>
                  <p className="text-3xl font-black italic">{installment.paidAmount.toLocaleString()} <span className="text-sm opacity-40 not-italic font-medium">{installment.sale?.currency.symbol}</span></p>
                </div>
                <div className="space-y-1 text-destructive">
                  <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">Остаток</span>
                  <p className="text-3xl font-black italic">{installment.remaining.toLocaleString()} <span className="text-sm opacity-40 not-italic font-medium">{installment.sale?.currency.symbol}</span></p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span>Прогресс погашения</span>
                  <span>{Math.round(payProgress)}%</span>
                </div>
                <Progress value={payProgress} className="h-3 rounded-full bg-muted/20" />
              </div>
            </div>
          </Card>

          {/* PAYMENTS HISTORY */}
          <Card className="rounded-[2.5rem] bg-card/40 backdrop-blur-xl border-border/40 overflow-hidden shadow-none">
            <div className="p-6 border-b border-border/20 bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="size-4 opacity-40" />
                <h2 className="text-sm font-black uppercase tracking-widest opacity-60">История платежей</h2>
              </div>
            </div>
            <CardContent className="p-0">
              {installment.payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border/10 text-[10px] uppercase font-black opacity-30">
                        <th className="px-6 py-4 italic">Дата</th>
                        <th className="px-6 py-4 italic">Метод</th>
                        <th className="px-6 py-4 italic">Комментарий</th>
                        <th className="px-6 py-4 text-right italic">Сумма</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {installment.payments.map((p) => (
                        <tr key={p.id} className="border-b border-border/5 hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4 font-bold opacity-60">
                            {format(new Date(p.paidAt), 'dd.MM.yyyy HH:mm')}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="rounded-lg text-[10px] font-black uppercase border-primary/20 text-primary">
                              {p.paymentMethod || 'cash'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 italic opacity-50 text-xs">
                            {p.note || '—'}
                          </td>
                          <td className="px-6 py-4 text-right font-black text-emerald-500">
                            + {p.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center opacity-20 italic">Платежей еще не было</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Schedule & Client */}
        <div className="space-y-6">

          {/* MONTHLY INFO */}
          <Card className="rounded-[2.5rem] bg-primary text-primary-foreground overflow-hidden shadow-2xl shadow-primary/20 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <CardContent className="p-8 space-y-6 relative z-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em]">Ежемесячный платеж</span>
                <span className="text-4xl font-black tracking-tighter italic">
                  {installment.monthlyPayment.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-3xl bg-black/10 border border-white/10">
                  <span className="text-[9px] font-black uppercase opacity-60 block mb-1">Осталось месяцев</span>
                  <span className="text-2xl font-black italic">{installment.monthsLeft} / {installment.totalMonths}</span>
                </div>
                <div className="p-4 rounded-3xl bg-black/10 border border-white/10">
                  <span className="text-[9px] font-black uppercase opacity-60 block mb-1">След. срок</span>
                  <span className="text-lg font-black italic">{format(new Date(installment.dueDate), 'dd.MM')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CUSTOMER CARD */}
          <Card className="rounded-[2.5rem] bg-card/40 backdrop-blur-xl border-border/40 overflow-hidden shadow-none">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <User className="size-6 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase opacity-40">Клиент</span>
                  <span className="text-lg font-black tracking-tight">{installment.customer?.firstName} {installment.customer?.lastName}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/10">
                  <Phone className="size-4 opacity-40" />
                  <span className="text-sm font-bold italic">{installment.customer?.phone}</span>
                </div>
                <Link href={`/sales/${installment.saleId}`} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/10 hover:bg-primary/5 transition-colors group">
                  <div className="flex items-center gap-3">
                    <FileText className="size-4 opacity-40" />
                    <span className="text-sm font-bold italic">Заказ #{installment.sale?.invoiceNumber}</span>
                  </div>
                  <ExternalLink className="size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>

              {installment.notes && (
                <div className="mt-4 p-4 rounded-3xl bg-orange-500/5 border border-orange-500/10">
                  <span className="text-[9px] font-black uppercase text-orange-600 block mb-1">Заметки</span>
                  <p className="text-xs italic opacity-70 leading-relaxed">{installment.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AddInstallmentPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        installmentId={id}
        remainingAmount={installment.remaining}
        monthlyPayment={installment.monthlyPayment}
        currency={installment.sale?.currency}
      />
    </div>
  );
}