"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { currencyService } from "@/services/currency.service"; // ← путь к твоему сервису
import {
  Currency,
  CreateCurrencyDto,
  UpdateCurrencyDto,
  createCurrencySchema,
  updateCurrencySchema,
} from "@/schemas/currency.schema";

import { currencyFields } from "./currency.fields";
import { useCrudController } from "@/hooks/useCrudController";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CrudRenderer } from "@/components/crud/CrudRenderer";
import { CrudViewToggle } from "@/components/crud/CrudViewToggle";
import { CrudDialog } from "@/components/crud/CrudDialog";
import { CrudForm } from "@/components/crud/CrudForm";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";
import { CrudViewMode } from "@/components/crud/types";

export function CurrencyCrud() {
  const queryClient = useQueryClient();
  const controller = useCrudController<Currency>();

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
    const saved = localStorage.getItem("currency-view-mode");
    return (saved as CrudViewMode) || "table";
  });

  useEffect(() => {
    localStorage.setItem("currency-view-mode", view);
  }, [view]);

  // ─── Запрос списка валют ───
  const { data: currencies = [], isLoading, error } = useQuery({
    queryKey: ["currencies", debouncedSearch],
    queryFn: async () => {
      const all = await currencyService.findAll();
      // Фильтрация по поиску на фронте (т.к. бэкенд пока не поддерживает search)
      if (!debouncedSearch) return all;
      const term = debouncedSearch.toLowerCase();
      return all.filter(
        (c) =>
          c.code.toLowerCase().includes(term) ||
          c.name.toLowerCase().includes(term) ||
          c.symbol.includes(term)
      );
    },
    keepPreviousData: true,
  });

  // ─── Мутации ───
  const createMutation = useMutation({
    mutationFn: (dto: CreateCurrencyDto) => currencyService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      setCreateOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCurrencyDto }) =>
      currencyService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      setEditItem(null);
      setCreateOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => currencyService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      setDeleteId(null);
    },
  });

  // ─── Handlers ───
  const handleCreate = (dto: CreateCurrencyDto) => {
    createMutation.mutate(dto);
  };

  const handleUpdate = (dto: UpdateCurrencyDto) => {
    if (!editItem?.id) return;
    updateMutation.mutate({ id: editItem.id, dto });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
  };

  const permissions = {
    canCreate: true,
    canEdit: true,
    canDelete: true, // ← можно отключить, если удаление валют нежелательно
  };

  return (
    <div className="space-y-6">
      {/* Поиск + переключение вида + кнопка создания */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Input
          placeholder="Поиск по коду, названию или символу..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="flex items-center gap-3">
          <CrudViewToggle value={view} onChange={setView} />
          <Button onClick={() => setCreateOpen(true)}>Добавить валюту</Button>
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
          Ошибка загрузки валют: {error instanceof Error ? error.message : "Неизвестная ошибка"}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <CrudRenderer
            view={view}
            data={currencies}
            fields={currencyFields}
            permissions={permissions}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            // Сортировка пока отключена, т.к. бэкенд не поддерживает
            // Если добавишь — можно включить
          />

          {/* Пагинация пока не нужна, т.к. валют мало → можно включить позже */}
        </>
      )}

      {/* Диалог создания / редактирования */}
      <CrudDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setEditItem(null);
        }}
        title={editItem ? "Редактировать валюту" : "Новая валюта"}
      >
        <CrudForm
          fields={currencyFields}
          schema={editItem ? updateCurrencySchema : createCurrencySchema}
          defaultValues={editItem ?? {}}
          onSubmit={editItem ? handleUpdate : handleCreate}
        />
      </CrudDialog>

      {/* Подтверждение удаления */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Удалить валюту?"
        description="Это действие нельзя отменить. Валюта будет удалена из системы. Убедитесь, что она не используется в транзакциях."
        onConfirm={handleDelete}
      />
    </div>
  );
}