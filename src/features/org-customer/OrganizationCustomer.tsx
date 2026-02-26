"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData
} from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { OrganizationCustomerService } from "@/services/org.customer.service";
import {
  OrganizationCustomer,
  CreateOrgCustomerDto,
  UpdateOrgCustomerDto,
  CreateOrgCustomerSchema,
  UpdateOrgCustomerSchema,
} from "@/schemas/org-customer.schema";

import { organizationCustomerFields } from "./organization-customer-fields";
import { useCrudController } from "@/hooks/useCrudController";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CrudRenderer } from "@/components/crud/CrudRenderer";
import { CrudViewToggle } from "@/components/crud/CrudViewToggle";
import { CrudDialog } from "@/components/crud/CrudDialog";
import { CrudForm } from "@/components/crud/CrudForm";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";
import { CrudViewMode } from "@/components/crud/types";
import {Plus} from "lucide-react";
import {useRouter} from "next/navigation";
import {
  OrganizationCustomerDialog
} from "@/features/org-customer/OrganizationCustomerDialog";

export function OrganizationCustomerCrud() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const controller = useCrudController<OrganizationCustomer>();

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
    const saved = localStorage.getItem("org-customer-view-mode");
    return (saved as CrudViewMode) || "table";
  });

  const [sortField, setSortField] = useState<"createdAt" | "firstName" | "lastName" | "type">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    localStorage.setItem("org-customer-view-mode", view);
  }, [view]);

  // ─── Запрос списка клиентов ───
  const { data, isLoading, error } = useQuery({
    queryKey: ["org-customers", debouncedSearch, page, limit, sortField, sortOrder],
    queryFn: () =>
      OrganizationCustomerService.getAllAdmin({
        search: debouncedSearch || undefined,
        page,
        limit,
        sortBy: sortField,
        sortOrder,
      }),
    placeholderData: keepPreviousData,
  });

  const customers = data?.items ?? [];
  const total = data?.total ?? 0;

  // ─── Мутации ───
  const createMutation = useMutation({
    mutationFn: OrganizationCustomerService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-customers"] });
      setCreateOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateOrgCustomerDto }) =>
      OrganizationCustomerService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-customers"] });
      setEditItem(null);
      setCreateOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: OrganizationCustomerService.hardDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-customers"] });
      setDeleteId(null);
    },
  });

  // ─── Handlers ───
  const handleCreate = (dto: CreateOrgCustomerDto) => {
    createMutation.mutate(dto);
  };

  const handleUpdate = async (dto: UpdateOrgCustomerDto) => {
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
      if (["createdAt" , "firstName" , "lastName" , "type"].includes(validField)) {
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
      {/* Поиск + переключение вида + кнопка создания */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Input
          placeholder="Поиск по имени, фамилии, телефону..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="flex items-center gap-3">
          <CrudViewToggle value={view} onChange={setView} />
          <Button onClick={() => setCreateOpen(true)}><Plus/></Button>
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
          Ошибка загрузки клиентов: {error instanceof Error ? error.message : "Неизвестная ошибка"}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <CrudRenderer
            view={view}
            data={customers}
            fields={organizationCustomerFields}
            permissions={permissions}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onRowClick={(row) => {
              if(row?.userId) {
                router.push(`/tenant-users/${row.userId}`);
              }else {
                router.push(`/organizations/customers/${row.id}/convert-to-user`);
              }
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
              disabled={customers.length < limit}
              onClick={() => setPage((p) => p + 1)}
            >
              Следующая
            </Button>
          </div>
        </>
      )}


      {/* Подтверждение удаления */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Удалить клиента?"
        description="Это действие нельзя отменить."
        onConfirm={handleDelete}
      />

      <OrganizationCustomerDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setEditItem(null);
        }}
        editItem={editItem}
      />
    </div>
  );
}