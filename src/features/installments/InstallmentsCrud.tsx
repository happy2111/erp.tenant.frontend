"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData
} from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { InstallmentsService } from "@/services/installments.service";
import {
  Installment,
  CreateInstallmentDto,
  CreateInstallmentSchema,
  InstallmentStatusValues,
} from "@/schemas/installments.schema";

import { installmentFields } from "./installments.fields";
import { useCrudController } from "@/hooks/useCrudController";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CrudRenderer } from "@/components/crud/CrudRenderer";
import { CrudViewToggle } from "@/components/crud/CrudViewToggle";
import { CrudDialog } from "@/components/crud/CrudDialog";
import { CrudForm } from "@/components/crud/CrudForm";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";
import { CrudViewMode } from "@/components/crud/types";
import { toast } from "sonner";
import {useRouter} from "next/navigation";

export function InstallmentsCrud() {
  const queryClient = useQueryClient();
  const controller = useCrudController<Installment>();
  const router = useRouter();
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
    const saved = localStorage.getItem("installments-view-mode");
    return (saved as CrudViewMode) || "table";
  });

  const [sortField, setSortField] = useState<"dueDate" | "totalAmount" | "createdAt">("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    localStorage.setItem("installments-view-mode", view);
  }, [view]);

  // ─── Запрос списка рассрочек ───
  const { data, isLoading, error } = useQuery({
    queryKey: ["installments", debouncedSearch, page, limit, sortField, sortOrder, statusFilter],
    queryFn: () =>
      InstallmentsService.getAllAdmin({
        search: debouncedSearch || undefined,
        sortField,
        order: sortOrder,
        page,
        limit,
        status: statusFilter as any,
      }),
    placeholderData: keepPreviousData,
  });

  const installments = data?.items ?? [];
  const total = data?.total ?? 0;

  // ─── Мутации ───
  const createMutation = useMutation({
    mutationFn: InstallmentsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["installments"] });
      setCreateOpen(false);
      toast.success("Рассрочка создана");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Не удалось создать рассрочку");
    },
  });

  // ─── Handlers ───
  const handleCreate = async (dto: CreateInstallmentDto) => {
    await createMutation.mutateAsync(dto);
  };

  const handleSort = (field: string) => { // Меняем тип аргумента на string
    const validField = field as typeof sortField; // Приводим к нужному типу для логики

    if (sortField === validField) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      if (["dueDate" , "totalAmount" , "createdAt"].includes(validField)) {
        setSortField(validField);
        setSortOrder("asc");
      }
    }
    setPage(1);
  };

  const permissions = {
    canCreate: true,
    canEdit: false,
    canDelete: false,
  };

  return (
    <div className="space-y-6">
      {/* Фильтры + поиск + кнопка создания */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Поиск по клиенту, сумме, номеру продажи..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />

          <div className="w-48">
            <Select
              value={statusFilter || "all"}
              onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                {InstallmentStatusValues.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "PENDING"
                      ? "Ожидает"
                      : s === "COMPLETED"
                        ? "Завершена"
                        : s === "OVERDUE"
                          ? "Просрочена"
                          : "Отменена"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CrudViewToggle value={view} onChange={setView} />
          <Button onClick={() => setCreateOpen(true)}>Создать рассрочку</Button>
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
          Ошибка загрузки рассрочек: {error instanceof Error ? error.message : "Неизвестная ошибка"}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <CrudRenderer
            view={view}
            data={installments}
            fields={installmentFields}
            permissions={permissions}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onRowClick={(row) => router.push(`/installments/${row.id}`)}
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
              disabled={installments.length < limit}
              onClick={() => setPage((p) => p + 1)}
            >
              Следующая
            </Button>
          </div>
        </>
      )}

      {/* Диалог создания рассрочки */}
      <CrudDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Создать новую рассрочку"
      >
        <CrudForm
          fields={installmentFields}
          schema={CreateInstallmentSchema}
          defaultValues={{}}
          onSubmit={handleCreate}
        />
      </CrudDialog>
    </div>
  );
}