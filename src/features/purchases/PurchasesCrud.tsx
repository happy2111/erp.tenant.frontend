"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData
} from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { PurchasesService } from "@/services/purchases.service";
import {
  Purchase,
  PurchaseStatusLabels,
  PurchaseStatusValues,
} from "@/schemas/purchases.schema";

import { purchaseFields } from "./purchases.fields";
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
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";
import { CrudViewMode } from "@/components/crud/types";
import {
  PurchaseEditDialog
} from "@/components/purchases/dialogs/PurchaseEditDialog";
import { toast } from "sonner";
import {useRouter} from "next/navigation";

export function PurchasesCrud() {
  const queryClient = useQueryClient();
  const controller = useCrudController<Purchase>();
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
    const saved = localStorage.getItem("purchases-view-mode");
    return (saved as CrudViewMode) || "table";
  });

  const [sortField, setSortField] = useState<"purchaseDate" | "totalAmount" | "createdAt">("purchaseDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    localStorage.setItem("purchases-view-mode", view);
  }, [view]);

  // ─── Запрос списка закупок ───
  const { data, isLoading, error } = useQuery({
    queryKey: ["purchases", debouncedSearch, page, limit, sortField, sortOrder, statusFilter],
    queryFn: () =>
      PurchasesService.getAllAdmin({
        search: debouncedSearch || undefined,
        sortField,
        order: sortOrder,
        page,
        limit,
        status: statusFilter as any,
      }),
    placeholderData: keepPreviousData,
  });

  const purchases = data?.items ?? [];
  const total = data?.total ?? 0;

  // ─── Мутации ───
  const deleteMutation = useMutation({
    mutationFn: PurchasesService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      setDeleteId(null);
      toast.success("Закупка удалена");
    },
    onError: (err: any) => {
      const errorMessage =
        err?.response?.data?.message?.message ||
        err?.response?.data?.message ||
        "Ошибка удаления";

      toast.error(errorMessage);
      console.error("Ошибка удаления характеристики:", err);
    },
  });

  // ─── Handlers ───
  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
  };

  const handleSort = (field: string) => { // Меняем тип аргумента на string
    const validField = field as typeof sortField; // Приводим к нужному типу для логики

    if (sortField === validField) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      if (["purchaseDate" , "totalAmount" , "createdAt"].includes(validField)) {
        setSortField(validField);
        setSortOrder("asc");
      }
    }
    setPage(1);
  };


  const permissions = {
    canCreate: true,
    canEdit: true,
    canDelete: true,
  };

  return (
    <div className="space-y-6">
      {/* Фильтры + поиск + кнопка создания */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Поиск по номеру накладной, поставщику, сумме..."
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
                {PurchaseStatusValues.map((s) => (
                  <SelectItem key={s} value={s}>
                    {PurchaseStatusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CrudViewToggle value={view} onChange={setView} />
          <Button onClick={() => router.push('/purchases/create')}>Создать закупку</Button>
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
          Ошибка загрузки закупок: {error instanceof Error ? error.message : "Неизвестная ошибка"}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <CrudRenderer
            view={view}
            data={purchases}
            fields={purchaseFields}
            permissions={permissions}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onRowClick={(row) => router.push(`/purchases/${row.id}`)}
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
              disabled={purchases.length < limit}
              onClick={() => setPage((p) => p + 1)}
            >
              Следующая
            </Button>
          </div>
        </>
      )}

      {/* Правка шапки черновика. Позиции меняются только пересозданием
          документа, статус — через провести / оплатить / отменить */}
      {editItem && (
        <PurchaseEditDialog
          key={editItem.id}
          purchase={editItem}
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) setEditItem(null);
          }}
        />
      )}

      {/* Подтверждение удаления */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Удалить закупку?"
        description="Удалить можно только черновик. Проведённую закупку нужно отменять — тогда партии удалятся, товар снимется со склада, а деньги вернутся в кассу."
        onConfirm={handleDelete}
      />
    </div>
  );
}