"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { KassaTransfersService } from "@/services/kassa-transfers.service";
import {
  KassaTransfer,
  CreateKassaTransferDto,
  GetKassaTransferQueryDto,
  CreateKassaTransferSchema,
} from "@/schemas/kassa-transfers.schema";

import { kassaTransferFields } from "./kassa-transfers.fields";
import { useCrudController } from "@/hooks/useCrudController";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CrudRenderer } from "@/components/crud/CrudRenderer";
import { CrudViewToggle } from "@/components/crud/CrudViewToggle";
import { CrudDialog } from "@/components/crud/CrudDialog";
import { CrudForm } from "@/components/crud/CrudForm";
import { CrudViewMode } from "@/components/crud/types";
import { toast } from "sonner";
import {
  CreateKassaTransferForm
} from "@/components/kassa-transfers/CreateKassaTransfer";

export function KassaTransfersCrud() {
  const queryClient = useQueryClient();
  const controller = useCrudController<KassaTransfer>();
  const [isTransferOpen, setIsTransferOpen] = useState(false);

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
    const saved = localStorage.getItem("kassa-transfers-view-mode");
    return (saved as CrudViewMode) || "table";
  });

  const [sortField, setSortField] = useState<"createdAt" | "amount">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    localStorage.setItem("kassa-transfers-view-mode", view);
  }, [view]);

  // ─── Запрос списка переводов ───
  const { data, isLoading, error } = useQuery({
    queryKey: ["kassa-transfers", debouncedSearch, page, limit, sortField, sortOrder],
    queryFn: () =>
      KassaTransfersService.getAllAdmin({
        search: debouncedSearch || undefined,
        sortField,
        order: sortOrder,
        page,
        limit,
      }),
    keepPreviousData: true,
  });

  const transfers = data?.items ?? [];
  const total = data?.total ?? 0;

  // ─── Мутации ───
  const createMutation = useMutation({
    mutationFn: KassaTransfersService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kassa-transfers"] });
      setCreateOpen(false);
      toast.success("Перевод успешно создан");
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message ||
        "Не удалось создать перевод (проверьте баланс источника)"
      );
    },
  });

  // ─── Handlers ───
  const handleCreate = (dto: CreateKassaTransferDto) => {
    // Приводим amount и rate к числу, если бэкенд ожидает number
    const payload = {
      ...dto,
      amount: parseFloat(dto.amount),
      rate: dto.rate ? parseFloat(dto.rate) : 1,
    };
    createMutation.mutate(payload as any);
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
    canEdit: false,   // редактирование переводов обычно запрещено
    canDelete: false, // удаление переводов обычно запрещено
  };

  return (
    <div className="space-y-6">
      {/* Поиск + кнопка создания */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Input
          placeholder="Поиск по сумме, комментарию, кассам..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="flex items-center gap-3">
          <CrudViewToggle value={view} onChange={setView} />
          <Button onClick={() => setIsTransferOpen(true)}>
            Перевод между кассами
          </Button>
        </div>
      </div>

      {/* Загрузка / ошибка */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-destructive text-center py-10 p-4 bg-destructive/10 rounded-lg">
          Ошибка загрузки переводов: {error instanceof Error ? error.message : "Неизвестная ошибка"}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <CrudRenderer
            view={view}
            data={transfers}
            fields={kassaTransferFields}
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
              disabled={transfers.length < limit}
              onClick={() => setPage((p) => p + 1)}
            >
              Следующая
            </Button>
          </div>
        </>
      )}

      {/* Диалог создания перевода */}
      <CrudDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Создать перевод между кассами"
      >
        <CrudForm
          fields={kassaTransferFields}
          schema={CreateKassaTransferSchema}
          defaultValues={{ rate: "1" }}
          onSubmit={handleCreate}
        />
      </CrudDialog>

      <CrudDialog
        open={isTransferOpen}
        onOpenChange={setIsTransferOpen}
        title="Внутренний перевод"
      >
        <CreateKassaTransferForm onSuccess={() => setIsTransferOpen(false)} />
      </CrudDialog>
    </div>
  );
}