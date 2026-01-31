"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { BrandsService } from "@/services/brands.service"; // ← подставь правильный путь
import {
  Brand,
  CreateBrandDto,
  UpdateBrandDto,
  GetBrandsQueryDto,
  CreateBrandSchema,
  UpdateBrandSchema,
} from "@/schemas/brands.schema";

import { brandFields } from "./brands.fields";
import { useCrudController } from "@/hooks/useCrudController";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CrudRenderer } from "@/components/crud/CrudRenderer";
import { CrudViewToggle } from "@/components/crud/CrudViewToggle";
import { CrudDialog } from "@/components/crud/CrudDialog";
import { CrudForm } from "@/components/crud/CrudForm";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";
import { CrudViewMode } from "@/components/crud/types";
import {useRouter} from "next/navigation";

export function BrandsCrud() {
  const router = useRouter()
  const queryClient = useQueryClient();
  const controller = useCrudController<Brand>();

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
    const saved = localStorage.getItem("brands-view-mode");
    return (saved as CrudViewMode) || "table";
  });

  const [sortField, setSortField] = useState<"name" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    localStorage.setItem("brands-view-mode", view);
  }, [view]);

  // ─── Запрос списка брендов ───
  const { data, isLoading, error } = useQuery({
    queryKey: ["brands", debouncedSearch, page, limit, sortField, sortOrder],
    queryFn: () =>
      BrandsService.getAllAdmin({
        search: debouncedSearch || undefined,
        page,
        limit,
        sortField,
        order: sortOrder,
      }),
    keepPreviousData: true,
  });

  const brands = data?.items ?? [];
  const total = data?.total ?? 0;

  // ─── Мутации ───
  const createMutation = useMutation({
    mutationFn: BrandsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setCreateOpen(false);
    },
    onError: (err: any) => {
      console.error("Ошибка создания бренда:", err);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBrandDto }) =>
      BrandsService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setEditItem(null);
      setCreateOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: BrandsService.hardDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setDeleteId(null);
    },
  });

  // ─── Handlers ───
  const handleCreate = (dto: CreateBrandDto) => {
    createMutation.mutate(dto);
  };

  const handleUpdate = (dto: UpdateBrandDto) => {
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
    canDelete: true, // можно поставить false, если удаление брендов нежелательно
  };

  return (
    <div className="space-y-6">
      {/* Поиск + переключение вида + кнопка создания */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Input
          placeholder="Поиск по названию бренда..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="flex items-center gap-3">
          <CrudViewToggle value={view} onChange={setView} />
          <Button onClick={() => setCreateOpen(true)}>Добавить бренд</Button>
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
          Ошибка загрузки брендов: {error instanceof Error ? error.message : "Неизвестная ошибка"}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <CrudRenderer
            view={view}
            data={brands}
            fields={brandFields}
            permissions={permissions}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onRowClick={(row) => {
              router.push(`/products/brands/${row.id}`)
            }}
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
              disabled={brands.length < limit}
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
        title={editItem ? "Редактировать бренд" : "Создать бренд"}
      >
        <CrudForm
          fields={brandFields}
          schema={editItem ? UpdateBrandSchema : CreateBrandSchema}
          defaultValues={editItem ?? {}}
          onSubmit={editItem ? handleUpdate : handleCreate}
        />
      </CrudDialog>

      {/* Подтверждение удаления */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Удалить бренд?"
        description="Это действие нельзя отменить. Если с брендом связаны товары — они могут остаться без бренда."
        onConfirm={handleDelete}
      />
    </div>
  );
}