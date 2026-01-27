"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrganizationUserService } from "@/services/OrganizationUserService";
import {
  OrganizationUser,
  CreateOrganizationUserDto,
  UpdateOrganizationUserDto,
  CreateOrganizationUserSchema,
  UpdateOrganizationUserSchema,
  GetOrgUsersQueryDto,
} from "@/schemas/organization-user.schema";
import { organizationUserFields } from "./organization-user.fields";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CrudRenderer } from "@/components/crud/CrudRenderer";
import { CrudViewToggle } from "@/components/crud/CrudViewToggle";
import { CrudDialog } from "@/components/crud/CrudDialog";
import { CrudForm } from "@/components/crud/CrudForm";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";
import { CrudViewMode } from "@/components/crud/types";
import { useEffect, useState } from "react";
import {useCrudController} from "@/hooks/useCrudController";

export function OrganizationUserCrud() {
  const queryClient = useQueryClient();
  const controller = useCrudController<OrganizationUser>();

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
    const saved = localStorage.getItem("crud-view-mode-org-user");
    return (saved as CrudViewMode) || "table";
  });

  const [sortField, setSortField] = useState<
    "createdAt" | "role" | "position" | "user.profile.firstName" | "user.profile.lastName"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    localStorage.setItem("crud-view-mode-org-user", view);
  }, [view]);

  // ─── Запрос списка пользователей организации ───
  const { data, isLoading, error } = useQuery({
    queryKey: ["organization-users", debouncedSearch, page, limit, sortField, sortOrder],
    queryFn: () =>
      OrganizationUserService.getAllAdmin({
        search: debouncedSearch,
        page,
        limit,
        sortField,
        order: sortOrder,
      } as GetOrgUsersQueryDto),
    keepPreviousData: true,
  });

  const users = data?.items ?? [];
  const total = data?.total ?? 0;

  // ─── Мутации ───
  const createMutation = useMutation({
    mutationFn: OrganizationUserService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-users"] });
      setCreateOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateOrganizationUserDto }) =>
      OrganizationUserService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-users"] });
      setEditItem(null);
      setCreateOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: OrganizationUserService.hardDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-users"] });
      setDeleteId(null);
    },
  });

  // ─── Handlers ───
  const handleCreate = (dto: CreateOrganizationUserDto) => {
    createMutation.mutate(dto);
  };

  const handleUpdate = (dto: UpdateOrganizationUserDto) => {
    if (!editItem) return;
    updateMutation.mutate({ id: editItem.id, dto });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
  };

  const handleSort = (
    field:
      | "createdAt"
      | "role"
      | "position"
      | "user.profile.firstName"
      | "user.profile.lastName",
  ) => {
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
    canDelete: true,
  };

  return (
    <div className="space-y-6">
      {/* Поиск + переключение вида + кнопка создания */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Input
          placeholder="Поиск по имени, фамилии, email, должности..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="flex items-center gap-3">
          <CrudViewToggle value={view} onChange={setView} />
          <Button onClick={() => setCreateOpen(true)}>
            Добавить пользователя
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
          Ошибка загрузки пользователей: {error instanceof Error ? error.message : "Неизвестная ошибка"}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <CrudRenderer
            view={view}
            data={users}
            fields={organizationUserFields}
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
              disabled={users.length < limit}
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
        title={editItem ? "Редактировать пользователя" : "Добавить пользователя"}
      >
        <CrudForm
          fields={organizationUserFields}
          schema={editItem ? UpdateOrganizationUserSchema : CreateOrganizationUserSchema}
          defaultValues={editItem ?? {}}
          onSubmit={editItem ? handleUpdate : handleCreate}
        />
      </CrudDialog>

      {/* Подтверждение удаления */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Удалить пользователя из организации?"
        description="Пользователь будет удалён из этой организации. Это действие нельзя отменить."
        onConfirm={handleDelete}
      />
    </div>
  );
}