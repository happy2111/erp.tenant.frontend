"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { ProductInstancesService } from "@/services/product-instances.service";
import {
  ProductInstance,
  CreateProductInstanceDto,
  UpdateProductInstanceDto,
  FindAllProductInstanceDto,
  CreateProductInstanceSchema,
  UpdateProductInstanceSchema,
  ProductStatusValues,
} from "@/schemas/product-instances.schema";

import { productInstanceFields } from "./product-instances.fields";
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
import {Plus} from "lucide-react";

export function ProductInstancesCrud() {
  const queryClient = useQueryClient();
  const controller = useCrudController<ProductInstance>();
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
    const saved = localStorage.getItem("product-instances-view-mode");
    return (saved as CrudViewMode) || "table";
  });

  const [sortField, setSortField] = useState<"createdAt" | "serialNumber">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    localStorage.setItem("product-instances-view-mode", view);
  }, [view]);

  // ─── Запрос списка экземпляров ───
  const { data, isLoading, error } = useQuery({
    queryKey: ["product-instances", debouncedSearch, page, limit, sortField, sortOrder, statusFilter],
    queryFn: () => {
      const filter: FindAllProductInstanceDto = {
        search: debouncedSearch || undefined,
        sortField,
        order: sortOrder,
        page,
        limit,
        status: statusFilter as any,
      };
      return ProductInstancesService.findAll(filter);
    },
    keepPreviousData: true,
  });

  const instances = data?.data ?? [];
  const total = data?.total ?? 0;

  // ─── Мутации ───
  const createMutation = useMutation({
    mutationFn: ProductInstancesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-instances"] });
      setCreateOpen(false);
      toast.success("Экземпляр создан");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Ошибка создания экземпляра");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductInstanceDto }) =>
      ProductInstancesService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-instances"] });
      setEditItem(null);
      setCreateOpen(false);
      toast.success("Экземпляр обновлён");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ProductInstancesService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-instances"] });
      setDeleteId(null);
      toast.success("Экземпляр удалён");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Не удалось удалить экземпляр");
    },
  });

  // ─── Handlers ───
  const handleCreate = (dto: CreateProductInstanceDto) => {
    createMutation.mutate(dto);
  };

  const handleUpdate = (dto: UpdateProductInstanceDto) => {
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
    canEdit: true,
    canDelete: true, // часто лучше false — экземпляры удаляют редко
  };

  return (
    <div className="space-y-6">
      {/* Фильтры + поиск + кнопка создания */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Поиск по серийному номеру..."
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
                {ProductStatusValues.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "IN_STOCK"
                      ? "В наличии"
                      : s === "SOLD"
                        ? "Продано"
                        : s === "RETURNED"
                          ? "Возвращён"
                          : "Утерян"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CrudViewToggle value={view} onChange={setView} />
          <Button onClick={() => router.push('/product-instances/create')}><Plus/></Button>
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
          Ошибка загрузки экземпляров: {error instanceof Error ? error.message : "Неизвестная ошибка"}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <CrudRenderer
            view={view}
            data={instances}
            fields={productInstanceFields}
            permissions={permissions}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onRowClick={(row) => router.push("/product-instances/" + row.id)}
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
              disabled={instances.length < limit}
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
        title={editItem ? "Редактировать экземпляр" : "Новый экземпляр товара"}
      >
        <CrudForm
          fields={productInstanceFields}
          schema={editItem ? UpdateProductInstanceSchema : CreateProductInstanceSchema}
          defaultValues={editItem ?? { currentStatus: "IN_STOCK" }}
          onSubmit={editItem ? handleUpdate : handleCreate}
        />
      </CrudDialog>

      {/* Подтверждение удаления */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Удалить экземпляр?"
        description="Это действие необратимо. Удаление возможно только если экземпляр не участвовал в продажах или других операциях."
        onConfirm={handleDelete}
      />
    </div>
  );
}