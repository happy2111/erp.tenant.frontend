"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { KassasService } from "@/services/kassas.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudRenderer } from "@/components/crud/CrudRenderer";
import { kassaHistoryFields } from "@/features/kassas/kassa-history.fields";
import {
  ArrowLeft,
  Wallet,
  Calendar,
  RefreshCcw,
  Loader2,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { format } from "date-fns";

export default function KassaDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [historyPage, setHistoryPage] = useState(1);

  // 1. Загрузка данных кассы
  const { data: kassa, isLoading: kassaLoading } = useQuery({
    queryKey: ["kassa", id],
    queryFn: () => KassasService.findOne(id as string),
    enabled: !!id,
  });

  // 2. Загрузка истории
  const { data: history, isLoading: historyLoading, refetch } = useQuery({
    queryKey: ["kassa-history", id, historyPage],
    queryFn: () => KassasService.getKassaHistory(id as string, {
      page: historyPage,
      limit: 15
    }),
    enabled: !!id,
  });

  if (kassaLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="size-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl">
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">
              {kassa?.name}
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
              Kassa tafsilotlari va operatsiyalar
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          className="rounded-2xl gap-2 text-xs font-bold uppercase"
        >
          <RefreshCcw className={historyLoading ? "animate-spin size-4" : "size-4"} />
          Yangilash
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Info Card */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-2xl bg-gradient-to-br from-primary/10 via-background to-background">
            <CardHeader className="pb-2">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-4">
                <Wallet className="size-6 text-primary" />
              </div>
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                Joriy Balans
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <span className="text-4xl font-black italic tracking-tighter">
                  {kassa?.balance.toLocaleString()}
                </span>
                <span className="ml-2 text-xl font-bold opacity-40 italic">
                  {kassa?.currency?.code}
                </span>
              </div>

              <div className="pt-6 border-t border-border/40 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase opacity-40">Turi</span>
                  <span className="text-xs font-black uppercase italic">{kassa?.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase opacity-40">Valyuta</span>
                  <span className="text-xs font-black uppercase italic">{kassa?.currency?.name} ({kassa?.currency?.symbol})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase opacity-40">Ochilgan sana</span>
                  <span className="text-xs font-black uppercase italic">
                    {kassa?.createdAt ? format(new Date(kassa.createdAt), "dd.MM.yyyy") : "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Placeholder */}
          {/*<div className="grid grid-cols-2 gap-4">*/}
          {/*  <div className="p-4 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10">*/}
          {/*    <TrendingUp className="size-4 text-emerald-500 mb-2" />*/}
          {/*    <p className="text-[9px] font-bold uppercase opacity-40">Kirimlar</p>*/}
          {/*    <p className="text-sm font-black">+ Operatsiyalar</p>*/}
          {/*  </div>*/}
          {/*  <div className="p-4 rounded-[2rem] bg-rose-500/5 border border-rose-500/10">*/}
          {/*    <TrendingDown className="size-4 text-rose-500 mb-2" />*/}
          {/*    <p className="text-[9px] font-bold uppercase opacity-40">Chiqimlar</p>*/}
          {/*    <p className="text-sm font-black">- Operatsiyalar</p>*/}
          {/*  </div>*/}
          {/*</div>*/}
        </div>

        {/* History Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
              <Calendar className="size-4" /> Operatsiyalar tarixi
            </h2>
          </div>

          <CrudRenderer
            view="table"
            data={history?.data || []}
            fields={kassaHistoryFields}
            permissions={{ canEdit: false, canDelete: false }}
          />

          {/* Простая пагинация */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={historyPage === 1}
              onClick={() => setHistoryPage(p => p - 1)}
              className="rounded-xl font-bold uppercase text-[10px]"
            >
              Oldingi
            </Button>
            <span className="text-[10px] font-black opacity-40 uppercase">Sahifa {historyPage}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={history?.length < 15}
              onClick={() => setHistoryPage(p => p + 1)}
              className="rounded-xl font-bold uppercase text-[10px]"
            >
              Keyingi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}