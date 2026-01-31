"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrganizationUserService } from "@/services/organization-user.service";
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
import { useCrudController } from "@/hooks/useCrudController";
import { useRouter } from "next/navigation";
import { CreateOrgUserDrawer } from "./CreateOrgUserDrawer";
import {Plus, UserCheck} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function OrganizationUserCrud() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const controller = useCrudController<OrganizationUser>();

  // Состояния для Drawer и выбранного пользователя
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string } | null>(null);

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

  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    localStorage.setItem("crud-view-mode-org-user", view);
  }, [view]);

  // ─── Запрос списка ───
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
  });

  const users = data?.items ?? [];
  const total = data?.total ?? 0;

  // ─── Мутации ───
  const createMutation = useMutation({
    mutationFn: OrganizationUserService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-users"] });
      setCreateOpen(false);
      setSelectedUser(null);
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
  const handleSelectUser = (id: string, email: string) => {
    setSelectedUser({ id, email });
    setDrawerOpen(false);
    setCreateOpen(true); // После выбора в Drawer открываем форму параметров (роль/позиция)
  };

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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const permissions = { canCreate: true, canEdit: true, canDelete: true };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Input
          placeholder="Qidiruv..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="flex items-center gap-3">
          <CrudViewToggle value={view} onChange={setView} />
          <Button onClick={() => setDrawerOpen(true)}>
            <Plus/>
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <CrudRenderer
            view={view}
            data={users}
            onRowClick={(row) => router.push(`/tenant-users/${row.user.id}`)}
            fields={organizationUserFields}
            permissions={permissions}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
          />

          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Oldingi
            </Button>
            <span className="text-sm text-muted-foreground font-medium">
              Sahifa {page} / {Math.ceil(total / limit) || 1}
            </span>
            <Button
              variant="outline"
              disabled={users.length < limit}
              onClick={() => setPage((p) => p + 1)}
            >
              Keyingi
            </Button>
          </div>
        </>
      )}

      {/* Выбор пользователя через Drawer */}
      <CreateOrgUserDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSelect={handleSelectUser}
      />

      {/* Диалог создания (параметры) / редактирования */}
      <CrudDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            setEditItem(null);
            setSelectedUser(null);
          }
        }}
        title={editItem ? "Tahrirlash" : "Kirish huquqini sozlash"}
      >
        {/* Инфо-блок выбранного пользователя при создании */}
        {!editItem && selectedUser && (
          <div className="mb-4 p-3 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-2">
              <UserCheck className="size-4 text-primary" />
              <span className="text-sm font-bold tracking-tight">{selectedUser.email}</span>
            </div>
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">Tanlangan</Badge>
          </div>
        )}

        <CrudForm
          // При создании фильтруем userId из формы, так как он задается программно
          fields={editItem ? organizationUserFields : organizationUserFields.filter(f => f.name !== 'userId')}
          schema={editItem ? UpdateOrganizationUserSchema : CreateOrganizationUserSchema}
          defaultValues={editItem ? editItem : { userId: selectedUser?.id }}
          onSubmit={editItem ? handleUpdate : handleCreate}
        />
      </CrudDialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="O'chirishni tasdiqlaysizmi?"
        description="Foydalanuvchi tashkilot a'zolari ro'yxatidan o'chiriladi."
        onConfirm={handleDelete}
      />
    </div>
  );
}