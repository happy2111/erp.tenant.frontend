"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { SalesService } from "@/services/sales.service";
import {
  Sale,
  CreateSaleDto,
  UpdateSaleDto,
  GetSaleQueryDto,
  CreateSaleSchema,
  UpdateSaleSchema,
  SaleStatusValues,
} from "@/schemas/sales.schema";

import { saleFields } from "./sales.fields";
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

export function SalesCrud() {
  const queryClient = useQueryClient();
  const controller = useCrudController<Sale>();
  const router = useRouter()
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
    const saved = localStorage.getItem("sales-view-mode");
    return (saved as CrudViewMode) || "table";
  });

  const [sortField, setSortField] = useState<"saleDate" | "totalAmount" | "createdAt">("saleDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    localStorage.setItem("sales-view-mode", view);
  }, [view]);

  // ─── Запрос списка продаж ───
  const { data, isLoading, error } = useQuery({
    queryKey: ["sales", debouncedSearch, page, limit, sortField, sortOrder, statusFilter],
    queryFn: () =>
      SalesService.getAllAdmin({
        search: debouncedSearch || undefined,
        sortField,
        order: sortOrder,
        page,
        limit,
        status: statusFilter as any,
      }),
    keepPreviousData: true,
  });

  const sales = data?.items ?? [];
  const total = data?.total ?? 0;

  // ─── Мутации ───
  const createMutation = useMutation({
    mutationFn: SalesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      setCreateOpen(false);
      toast.success("Продажа создана (в статусе Черновик)");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Не удалось создать продажу");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSaleDto }) =>
      SalesService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      setEditItem(null);
      setCreateOpen(false);
      toast.success("Продажа обновлена");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Ошибка обновления продажи");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: SalesService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      setDeleteId(null);
      toast.success("Продажа удалена");
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message ||
        "Не удалось удалить продажу (возможно, уже оплачена или есть платежи)"
      );
    },
  });

  // ─── Handlers ───
  const handleCreate = (dto: CreateSaleDto) => {
    createMutation.mutate(dto);
  };

  const handleUpdate = (dto: UpdateSaleDto) => {
    if (!editItem?.id) return;
    updateMutation.mutate({ id: editItem.id, dto });
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
    canEdit: false,
    canDelete: false,
  };

  return (
    <div className="space-y-6">
      {/* Фильтры + поиск + кнопка создания */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Поиск по номеру чека, клиенту, сумме..."
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
                {SaleStatusValues.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "DRAFT"
                      ? "Черновик"
                      : s === "PENDING"
                        ? "Ожидает оплаты"
                        : s === "PAID"
                          ? "Оплачено"
                          : "Отменено"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CrudViewToggle value={view} onChange={setView} />
          {/*<Button onClick={() => setCreateOpen(true)}>Создать продажу</Button>*/}
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
          Ошибка загрузки продаж: {error instanceof Error ? error.message : "Неизвестная ошибка"}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <CrudRenderer
            view={view}
            data={sales}
            fields={saleFields}
            permissions={permissions}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onRowClick={(row) => router.push(`/sales/${row.id}`)}
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
              disabled={sales.length < limit}
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
        title={editItem ? "Редактировать продажу" : "Новая продажа"}
      >
        <CrudForm
          fields={saleFields}
          schema={editItem ? UpdateSaleSchema : CreateSaleSchema}
          defaultValues={
            editItem ?? {
              status: "DRAFT" as const,
              items: [], // здесь обычно добавляют в отдельной форме
            }
          }
          onSubmit={editItem ? handleUpdate : handleCreate}
        />
      </CrudDialog>

      {/* Подтверждение удаления */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Удалить продажу?"
        description="Это действие нельзя отменить. Удаление возможно только если продажа не оплачена и не имеет платежей."
        onConfirm={handleDelete}
      />
    </div>
  );
}