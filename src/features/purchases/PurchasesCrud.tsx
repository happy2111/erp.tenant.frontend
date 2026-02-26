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
  CreatePurchaseDto,
  UpdatePurchaseDto,
  CreatePurchaseSchema,
  UpdatePurchaseSchema,
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
import { CrudDialog } from "@/components/crud/CrudDialog";
import { CrudForm } from "@/components/crud/CrudForm";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";
import { CrudViewMode } from "@/components/crud/types";
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

  // ─── Мутации ───A
  const createMutation = useMutation({
    mutationFn: PurchasesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      setCreateOpen(false);
      toast.success("Закупка создана (в статусе Черновик)");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Не удалось создать закупку");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePurchaseDto }) =>
      PurchasesService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      setEditItem(null);
      setCreateOpen(false);
      toast.success("Закупка обновлена");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Ошибка обновления закупки");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: PurchasesService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      setDeleteId(null);
      toast.success("Закупка удалена");
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message ||
        "Не удалось удалить закупку (возможно, уже оплачена или есть платежи)"
      );
    },
  });

  // ─── Handlers ───
  const handleCreate = async (dto: CreatePurchaseDto) => {
    await createMutation.mutateAsync(dto);
  };

  const handleUpdate = async (dto: UpdatePurchaseDto) => {
    if (!editItem?.id) return;
    await updateMutation.mutateAsync({ id: editItem.id, dto });
  };

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
                    {s === "DRAFT"
                      ? "Черновик"
                      : s === "PARTIAL"
                        ? "Частично оплачено"
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

      {/* Диалог создания / редактирования */}
      <CrudDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setEditItem(null);
        }}
        title={editItem ? "Редактировать закупку" : "Новая закупка"}
      >
        <CrudForm
          fields={purchaseFields}
          schema={editItem ? UpdatePurchaseSchema : CreatePurchaseSchema}
          defaultValues={
            editItem
              ? {
                supplierId: editItem.supplierId,
                status: editItem.status,
                currencyId: editItem.currencyId,
                kassaId: editItem.kassaId,
                items: editItem.items?.map(item => ({
                  productVariantId: item.productVariantId,
                  quantity: item.quantity,
                  price: item.price,
                  discount: item.discount ?? 0,
                  batchNumber: item.batchNumber,
                  // Convert Date object to ISO string for the Zod schema
                  expiryDate: item.expiryDate instanceof Date
                    ? item.expiryDate.toISOString()
                    : item.expiryDate,
                })) || [],
              }
              : {
                status: "DRAFT" as const,
                items: [],
              }
          }
          onSubmit={editItem ? handleUpdate : handleCreate}
        />
      </CrudDialog>

      {/* Подтверждение удаления */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Удалить закупку?"
        description="Это действие нельзя отменить. Удаление возможно только если закупка не оплачена и не имеет платежей."
        onConfirm={handleDelete}
      />
    </div>
  );
}