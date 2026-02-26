"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { CurrencyRatesService } from "@/services/currency-rates.service";
import { currencyService } from "@/services/currency.service";
import {
  CurrencyRate,
  UpdateCurrencyRateDto,
  UpdateCurrencyRateSchema,
} from "@/schemas/currency-rates.schema";

import { currencyRateFields } from "./currency-rates.fields";
import { useCrudController } from "@/hooks/useCrudController";

import { Button } from "@/components/ui/button";
import { CrudRenderer } from "@/components/crud/CrudRenderer";
import { CrudViewToggle } from "@/components/crud/CrudViewToggle";
import { CrudDialog } from "@/components/crud/CrudDialog";
import { CrudForm } from "@/components/crud/CrudForm";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";
import { CrudViewMode } from "@/components/crud/types";
import { toast } from "sonner";
import { Plus, Filter, X, Loader2 } from "lucide-react";
import { CurrencyRateForm } from "@/components/currency-rates/currency-rate-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CurrencyRatesCrud() {
  const queryClient = useQueryClient();
  const controller = useCrudController<CurrencyRate>();

  const [baseCurrency, setBaseCurrency] = useState<string>("");
  const [targetCurrency, setTargetCurrency] = useState<string>("");

  const {
    page,
    setPage,
    limit,
    createOpen,
    setCreateOpen,
    editItem,
    setEditItem,
    deleteId,
    setDeleteId,
    handleEdit,
    handleDeleteClick,
  } = controller;

  const [view, setView] = useState<CrudViewMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("currency-rates-view-mode");
      return (saved as CrudViewMode) || "table";
    }
    return "table";
  });

  const [sortField, setSortField] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    localStorage.setItem("currency-rates-view-mode", view);
  }, [view]);

  // ─── Запрос валют для селектов фильтрации ───
  const { data: currencies } = useQuery({
    queryKey: ["currencies-list"],
    queryFn: () => currencyService.findAll(),
  });

  // ─── Запрос списка курсов (с новыми фильтрами) ───
  const { data, isLoading, error } = useQuery({
    queryKey: ["currency-rates", baseCurrency, targetCurrency, page, limit, sortField, sortOrder],
    queryFn: () =>
      CurrencyRatesService.getAllAdmin({
        baseCurrency: baseCurrency || undefined,
        targetCurrency: targetCurrency || undefined,
        sortField,
        order: sortOrder,
        page,
        limit,
      }),
  });

  const rates = data?.items ?? [];
  const total = data?.total ?? 0;

  // ─── Мутации ───
  const createMutation = useMutation({
    mutationFn: CurrencyRatesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currency-rates"] });
      setCreateOpen(false);
      toast.success("Kurs muvaffaqiyatli qo'shildi");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;

      toast.error(Array.isArray(msg) ? msg[0] : (msg || "Xatolik yuz berdi"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCurrencyRateDto }) =>
      CurrencyRatesService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currency-rates"] });
      setEditItem(null);
      setCreateOpen(false);
      toast.success("Kurs yangilandi");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;

      toast.error(Array.isArray(msg) ? msg[0] : (msg || "Xatolik yuz berdi"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: CurrencyRatesService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currency-rates"] });
      setDeleteId(null);
      toast.success("Kurs o'chirildi");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "O'chirishda xatolik");
    },
  });

  // ─── Handlers ───
  const handleCreate = async (dto: any) => {
    await createMutation.mutateAsync({
      ...dto,
      rate: parseFloat(dto.rate),
    });
  };

  const handleUpdate = async (dto: any) => {
    if (!editItem?.id) return;
    await updateMutation.mutateAsync({
      id: editItem.id,
      dto: {
        ...dto,
        rate: dto.rate !== undefined ? parseFloat(dto.rate) : undefined,
      },
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* ─── Панель фильтров ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-card/10 p-4 rounded-[2rem] border border-border/40 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest ml-2 opacity-50">Base (From)</label>
            <Select value={baseCurrency} onValueChange={(v) => { setBaseCurrency(v); setPage(1); }}>
              <SelectTrigger className="w-[140px] h-10 rounded-xl bg-background/50 border-sidebar-border/40">
                <SelectValue placeholder="Tanlang..." />
              </SelectTrigger>
              <SelectContent>
                {currencies?.map((c) => (
                  <SelectItem key={c.id} value={c.code}>{c.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-6 hidden sm:block">
            <Filter className="size-4 opacity-20" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest ml-2 opacity-50">Target (To)</label>
            <Select value={targetCurrency} onValueChange={(v) => { setTargetCurrency(v); setPage(1); }}>
              <SelectTrigger className="w-[140px] h-10 rounded-xl bg-background/50 border-sidebar-border/40">
                <SelectValue placeholder="Tanlang..." />
              </SelectTrigger>
              <SelectContent>
                {currencies?.map((c) => (
                  <SelectItem key={c.id} value={c.code}>{c.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(baseCurrency || targetCurrency) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setBaseCurrency(""); setTargetCurrency(""); setPage(1); }}
              className="mt-6 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <CrudViewToggle value={view} onChange={setView} />
          <Button onClick={() => setCreateOpen(true)} className="rounded-xl h-10 font-bold uppercase text-[10px] tracking-widest">
            <Plus className="size-4 mr-2" /> Yangi kurs
          </Button>
        </div>
      </div>

      {/* Состояния загрузки / ошибки */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-card/20 animate-pulse rounded-[1.5rem] border border-border/10" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-destructive text-center py-10 p-4 bg-destructive/10 rounded-[2rem] border border-destructive/20 font-bold uppercase text-xs">
          Kurslarni yuklashda xatolik:{" "}
          {error instanceof Error ? error.message : "Noma'lum xatolik"}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <CrudRenderer
            view={view}
            data={rates}
            fields={currencyRateFields}
            permissions={{ canCreate: true, canEdit: true, canDelete: true }}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
          />

          {/* Пагинация */}
          <div className="flex justify-between items-center mt-6 bg-card/5 p-2 rounded-2xl border border-border/20">
            <Button
              variant="ghost"
              className="rounded-xl font-bold uppercase text-[10px]"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Oldingi
            </Button>
            <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">
              Sahifa {page} / {Math.ceil(total / limit) || 1}
            </span>
            <Button
              variant="ghost"
              className="rounded-xl font-bold uppercase text-[10px]"
              disabled={rates.length < limit}
              onClick={() => setPage((p) => p + 1)}
            >
              Keyingi
            </Button>
          </div>
        </>
      )}

      {/* Диалог создания / редактирования */}
      <CrudDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setEditItem(null);
        }}
        title={editItem ? "Kursni tahrirlash" : "Yangi kurs qo'shish"}
      >
        {editItem ? (
          <CrudForm
            fields={currencyRateFields}
            schema={UpdateCurrencyRateSchema}
            defaultValues={editItem}
            onSubmit={handleUpdate}
          />
        ) : (
          <CurrencyRateForm
            onSubmit={handleCreate}
            isLoading={createMutation.isPending}
          />
        )}
      </CrudDialog>

      {/* Подтверждение удаления */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Kurs o'chirilsinmi?"
        description="Bu amalni qaytarib bo'lmaydi. O'chirilgan kurs operatsiyalarda muammo tug'dirishi mumkin."
        onConfirm={handleDelete}
      />
    </div>
  );
}