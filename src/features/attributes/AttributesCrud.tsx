"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { AttributesService } from "@/services/attributes.service";
import {
  Attribute,
  CreateAttributeDto,
  UpdateAttributeDto,
  GetAttributesQueryDto,
  CreateAttributeSchema,
  UpdateAttributeSchema,
} from "@/schemas/attributes.schema";

import { attributeFields } from "./attributes.fields";
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

export function AttributesCrud() {
  const router = useRouter()
  const queryClient = useQueryClient();
  const controller = useCrudController<Attribute>();

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
    const saved = localStorage.getItem("attributes-view-mode");
    return (saved as CrudViewMode) || "table";
  });

  const [sortField, setSortField] = useState<"name" | "key" | "createdAt">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    localStorage.setItem("attributes-view-mode", view);
  }, [view]);

  // ─── Запрос списка характеристик ───
  const { data, isLoading, error } = useQuery({
    queryKey: ["attributes", debouncedSearch, page, limit, sortField, sortOrder],
    queryFn: () =>
      AttributesService.getAllAdmin({
        search: debouncedSearch || undefined,
        page,
        limit,
        sortField,
        order: sortOrder,
      }),
    keepPreviousData: true,
  });

  const attributes = data?.items ?? [];
  const total = data?.total ?? 0;

  // ─── Мутации ───
  const createMutation = useMutation({
    mutationFn: AttributesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
      setCreateOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAttributeDto }) =>
      AttributesService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
      setEditItem(null);
      setCreateOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: AttributesService.hardDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
      setDeleteId(null);
    },
    onError: (err: any) => {
      // Можно показать более понятное сообщение
      console.error("Ошибка удаления характеристики:", err);
    },
  });

  // ─── Handlers ───
  const handleCreate = (dto: CreateAttributeDto) => {
    createMutation.mutate(dto);
  };

  const handleUpdate = (dto: UpdateAttributeDto) => {
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
    canDelete: true, // часто лучше false — характеристики редко удаляют
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Input
          placeholder="Поиск по названию или ключу..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="flex items-center gap-3">
          <CrudViewToggle value={view} onChange={setView} />
          <Button onClick={() => setCreateOpen(true)}>Добавить характеристику</Button>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-destructive text-center py-10 p-4 bg-destructive/10 rounded-lg">
          Ошибка загрузки характеристик: {error instanceof Error ? error.message : "Неизвестная ошибка"}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <CrudRenderer
            view={view}
            data={attributes}
            fields={attributeFields}
            permissions={permissions}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onRowClick={(row) => {
              router.push(`/attributes/${row.id}`)
            }}
          />

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
              disabled={attributes.length < limit}
              onClick={() => setPage((p) => p + 1)}
            >
              Следующая
            </Button>
          </div>
        </>
      )}

      <CrudDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setEditItem(null);
        }}
        title={editItem ? "Редактировать характеристику" : "Новая характеристика"}
      >
        <CrudForm
          fields={attributeFields}
          schema={editItem ? UpdateAttributeSchema : CreateAttributeSchema}
          defaultValues={editItem ?? {}}
          onSubmit={editItem ? handleUpdate : handleCreate}
        />
      </CrudDialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Удалить характеристику?"
        description="Это действие нельзя отменить. Если характеристика используется в товарах — удаление может быть заблокировано."
        onConfirm={handleDelete}
      />
    </div>
  );
}