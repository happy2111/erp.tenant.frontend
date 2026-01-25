"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrganizationService } from "@/services/organization.service";
import {
  OrganizationWithUserRole,
  CreateOrganizationDto,
  UpdateOrganizationDto, UpdateOrganizationSchema, CreateOrganizationSchema,
} from "@/schemas/organization.schema";
import { organizationFields } from "./organization.fields";
import { useCrudController } from "@/hooks/useCrudController";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CrudRenderer } from "@/components/crud/CrudRenderer";
import { CrudViewToggle } from "@/components/crud/CrudViewToggle";
import { CrudDialog } from "@/components/crud/CrudDialog";
import { CrudForm } from "@/components/crud/CrudForm";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";
import { CrudViewMode } from "@/components/crud/types";
import {useEffect, useState} from "react";

export function OrganizationCrud() {
  const queryClient = useQueryClient();
  const controller = useCrudController<OrganizationWithUserRole>();

  const {
    search,           // Для инпута
    debouncedSearch,  // Для сервера
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
    const saved = localStorage.getItem("crud-view-mode");
    return (saved as CrudViewMode) || "table";
  });

  const [sortField, setSortField] = useState<"name" | "email" | "phone" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");


  useEffect(() => {
    localStorage.setItem("crud-view-mode", view);
  }, [view]);

  // ─── Запрос списка организаций ───
  const { data, isLoading, error } = useQuery({
    queryKey: ["organizations", debouncedSearch, page, limit, sortField, sortOrder],
    queryFn: () =>
      OrganizationService.getAllAdmin({
        search: debouncedSearch,
        page,
        limit,
        sortField,
        order: sortOrder,
      }),
    keepPreviousData: true,
  });

  const organizations = data?.items ?? [];
  const total = data?.total ?? 0;

  // ─── Мутации ───
  const createMutation = useMutation({
    mutationFn: OrganizationService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setCreateOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateOrganizationDto }) =>
      OrganizationService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setEditItem(null);
      setCreateOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: OrganizationService.hardDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setDeleteId(null);
    },
  });

  // ─── Handlers ───
  const handleCreate = (dto: CreateOrganizationDto) => {
    createMutation.mutate(dto);
  };

  const handleUpdate = (dto: UpdateOrganizationDto) => {
    if (!editItem) return;
    updateMutation.mutate({ id: editItem.id, dto });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
  };

  const handleSort = (field: "name" | "email" | "phone" | "createdAt") => {
    if (sortField === field) {
      // Если уже сортируем по этой колонке — меняем направление
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // Новая колонка — начинаем с asc
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(1); // при смене сортировки сбрасываем на первую страницу
  };

  const permissions = {
    canCreate: true,
    canEdit: true,
    canDelete: true,
  };
  return (
    <div className="space-y-6">
      {/* Поиск + переключение вида + кнопка создания */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Input
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="flex items-center gap-3">
          {/* ← Теперь toggle полностью рабочий! */}
          <CrudViewToggle value={view} onChange={setView} />
          <Button onClick={() => setCreateOpen(true)}>
            Создать организацию
          </Button>
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
          Ошибка загрузки организаций: {error instanceof Error ? error.message : "Неизвестная ошибка"}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <CrudRenderer
            view={view}
            data={organizations}
            fields={organizationFields}
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
              disabled={organizations.length < limit}
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
        title={editItem ? "Редактировать организацию" : "Создать организацию"}
      >
        <CrudForm
          fields={organizationFields}
          schema={editItem ? UpdateOrganizationSchema : CreateOrganizationSchema}
          defaultValues={editItem ?? {}}
          onSubmit={editItem ? handleUpdate : handleCreate}
        />
      </CrudDialog>

      {/* Подтверждение удаления */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Удалить организацию?"
        description="Это действие нельзя отменить. Все связанные данные (пользователи, кассы, товары и т.д.) будут удалены."
        onConfirm={handleDelete}
      />
    </div>
  );
}