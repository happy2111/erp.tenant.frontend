"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { CurrencyRatesService } from "@/services/currency-rates.service";
import {
  CurrencyRate,
  CreateCurrencyRateDto,
  UpdateCurrencyRateDto,
  CreateCurrencyRateSchema,
  UpdateCurrencyRateSchema,
} from "@/schemas/currency-rates.schema";

import { currencyRateFields } from "./currency-rates.fields";
import { useCrudController } from "@/hooks/useCrudController";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CrudRenderer } from "@/components/crud/CrudRenderer";
import { CrudViewToggle } from "@/components/crud/CrudViewToggle";
import { CrudDialog } from "@/components/crud/CrudDialog";
import { CrudForm } from "@/components/crud/CrudForm";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";
import { CrudViewMode } from "@/components/crud/types";
import { toast } from "sonner";

export function CurrencyRatesCrud() {
  const queryClient = useQueryClient();
  const controller = useCrudController<CurrencyRate>();

  const {
    search,
    debouncedSearch,
    setSearch,
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
    const saved = localStorage.getItem("currency-rates-view-mode");
    return (saved as CrudViewMode) || "table";
  });

  const [sortField, setSortField] = useState<"date" | "rate" | "createdAt">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    localStorage.setItem("currency-rates-view-mode", view);
  }, [view]);

  // ─── Запрос списка курсов ───
  const { data, isLoading, error } = useQuery({
    queryKey: ["currency-rates", debouncedSearch, page, limit, sortField, sortOrder],
    queryFn: () =>
      CurrencyRatesService.getAllAdmin({
        search: debouncedSearch || undefined,
        sortField,
        order: sortOrder,
        page,
        limit,
      }),
    keepPreviousData: true,
  });

  const rates = data?.items ?? [];
  const total = data?.total ?? 0;

  // ─── Мутации ───
  const createMutation = useMutation({
    mutationFn: CurrencyRatesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currency-rates"] });
      setCreateOpen(false);
      toast.success("Курс валют успешно добавлен");
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message || "Не удалось добавить курс валют"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCurrencyRateDto }) =>
      CurrencyRatesService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currency-rates"] });
      setEditItem(null);
      setCreateOpen(false);
      toast.success("Курс валют обновлён");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Ошибка обновления курса");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: CurrencyRatesService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currency-rates"] });
      setDeleteId(null);
      toast.success("Курс валют удалён");
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message ||
        "Не удалось удалить курс (возможно, он используется в операциях)"
      );
    },
  });

  // ─── Handlers ───
  const handleCreate = (dto: CreateCurrencyRateDto) => {
    // Приводим rate к числу (в схеме string, но в базе number)
    const payload = {
      ...dto,
      rate: parseFloat(dto.rate),
    };
    createMutation.mutate(payload as any);
  };

  const handleUpdate = (dto: UpdateCurrencyRateDto) => {
    if (!editItem?.id) return;

    const payload = {
      ...dto,
      rate: dto.rate !== undefined ? parseFloat(dto.rate) : undefined,
    };

    updateMutation.mutate({ id: editItem.id, dto: payload as any });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const permissions = {
    canCreate: true,
    canEdit: true,
    canDelete: true, // можно поставить false — курсы удаляют редко
  };

  return (
    <div className="space-y-6">
      {/* Поиск + переключение вида + кнопка создания */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Input
          placeholder="Поиск по коду валюты (USD → UZS)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="flex items-center gap-3">
          <CrudViewToggle value={view} onChange={setView} />
          <Button onClick={() => setCreateOpen(true)}>Добавить курс</Button>
        </div>
      </div>

      {/* Состояния загрузки / ошибки */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-destructive text-center py-10 p-4 bg-destructive/10 rounded-lg">
          Ошибка загрузки курсов валют:{" "}
          {error instanceof Error ? error.message : "Неизвестная ошибка"}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <CrudRenderer
            view={view}
            data={rates}
            fields={currencyRateFields}
            permissions={permissions}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
          />

          {/* Пагинация */}
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Предыдущая
            </Button>
            <span>
              Страница {page} из {Math.ceil(total / limit)}
            </span>
            <Button
              variant="outline"
              disabled={rates.length < limit}
              onClick={() => setPage((p) => p + 1)}
            >
              Следующая
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
        title={editItem ? "Редактировать курс" : "Новый курс валют"}
      >
        <CrudForm
          fields={currencyRateFields}
          schema={editItem ? UpdateCurrencyRateSchema : CreateCurrencyRateSchema}
          defaultValues={editItem ?? {}}
          onSubmit={editItem ? handleUpdate : handleCreate}
        />
      </CrudDialog>

      {/* Подтверждение удаления */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Удалить курс валют?"
        description="Это действие нельзя отменить. Курс может использоваться в операциях или переводах."
        onConfirm={handleDelete}
      />
    </div>
  );
}