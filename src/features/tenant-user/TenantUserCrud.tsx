"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TenantUserService } from "@/services/tenant-user.service"; // ← создадим ниже
import {
  TenantUser,
  CreateTenantUserDto,
  UpdateTenantUserDto,
  CreateTenantUserSchema,
  UpdateTenantUserSchema,
  GetTenantUsersQueryDto,
} from "@/schemas/tenant-user.schema";
import { tenantUserFields } from "./tenant-user.fields";
import { useCrudController } from "@/hooks/useCrudController";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CrudRenderer } from "@/components/crud/CrudRenderer";
import { CrudViewToggle } from "@/components/crud/CrudViewToggle";
import { CrudDialog } from "@/components/crud/CrudDialog";
import { CrudForm } from "@/components/crud/CrudForm";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";
import { CrudViewMode } from "@/components/crud/types";
import { useEffect, useState } from "react";
import {useRouter} from "next/navigation";

export function TenantUserCrud() {
  const router = useRouter()


  const queryClient = useQueryClient();
  const controller = useCrudController<TenantUser>();

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
    const saved = localStorage.getItem("crud-view-mode-tenant-users");
    return (saved as CrudViewMode) || "table";
  });

  const [sortField, setSortField] = useState<
    "createdAt" | "email" | "profile.firstName" | "profile.lastName"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    localStorage.setItem("crud-view-mode-tenant-users", view);
  }, [view]);

  // ─── Запрос списка ───
  const { data, isLoading, error } = useQuery({
    queryKey: ["tenant-users", debouncedSearch, page, limit, sortField, sortOrder],
    queryFn: () =>
      TenantUserService.getAllAdmin({
        search: debouncedSearch,
        page,
        limit,
        sortField,
        order: sortOrder,
      } as GetTenantUsersQueryDto),
    keepPreviousData: true,
  });

  const users = data?.items ?? [];
  const total = data?.total ?? 0;

  // ─── Мутации ───
  const createMutation = useMutation({
    mutationFn: TenantUserService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-users"] });
      setCreateOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTenantUserDto }) =>
      TenantUserService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-users"] });
      setEditItem(null);
      setCreateOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: TenantUserService.hardDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-users"] });
      setDeleteId(null);
    },
  });

  // ─── Handlers ───
  const handleCreate = (dto: CreateTenantUserDto) => {
    createMutation.mutate(dto);
  };

  const handleUpdate = (dto: UpdateTenantUserDto) => {
    if (!editItem) return;
    updateMutation.mutate({ id: editItem.id, dto });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
  };

  const handleSort = (
    field: "createdAt" | "email" | "profile.firstName" | "profile.lastName",
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Input
          placeholder="Поиск по имени, фамилии, email, телефону..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="flex items-center gap-3">
          <CrudViewToggle value={view} onChange={setView} />
          <Button onClick={() => router.push("/tenant-users/create")}>
            Добавить пользователя
          </Button>

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
          Ошибка загрузки: {error instanceof Error ? error.message : "Неизвестная ошибка"}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <CrudRenderer
            view={view}
            data={users}
            fields={tenantUserFields}
            permissions={permissions}
            onEdit={(row) => router.push(`/tenant-users/${row.id}/edit`)}
            onDelete={handleDeleteClick}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onRowClick={(row) => router.push(`/tenant-users/${row.id}`)}
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
              disabled={users.length < limit}
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
        title={editItem ? "Редактировать пользователя" : "Добавить пользователя"}
      >
        <CrudForm
          fields={tenantUserFields}
          schema={editItem ? UpdateTenantUserSchema : CreateTenantUserSchema}
          defaultValues={editItem ?? {}}
          onSubmit={editItem ? handleUpdate : handleCreate}
        />
      </CrudDialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Удалить пользователя?"
        description="Это действие нельзя отменить. Все связанные данные будут удалены."
        onConfirm={handleDelete}
      />
    </div>
  );
}