"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { KassasService } from "@/services/kassas.service";
import {
  Kassa,
  CreateKassaDto,
  UpdateKassaDto,
  CreateKassaSchema,
  UpdateKassaSchema,
} from "@/schemas/kassas.schema";

import { kassaFields } from "./kassas.fields";
import { useCrudController } from "@/hooks/useCrudController";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CrudRenderer } from "@/components/crud/CrudRenderer";
import { CrudViewToggle } from "@/components/crud/CrudViewToggle";
import { CrudDialog } from "@/components/crud/CrudDialog";
import { CrudForm } from "@/components/crud/CrudForm";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";
import { CrudViewMode } from "@/components/crud/types";
import { toast } from "sonner";
import { CreateKassaForm } from "@/components/kassas/create-kassa-form";
import {useRouter} from "next/navigation";

export function KassasCrud() {
  const queryClient = useQueryClient();
  const controller = useCrudController<Kassa>();
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
    const saved = localStorage.getItem("kassas-view-mode");
    return (saved as CrudViewMode) || "table";
  });

  const [sortField, setSortField] = useState<"name" | "createdAt" | "balance">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    localStorage.setItem("kassas-view-mode", view);
  }, [view]);

  // ─── Запрос списка касс ───
  const { data, isLoading, error } = useQuery({
    queryKey: ["kassas", debouncedSearch, page, limit, sortField, sortOrder],
    queryFn: () =>
      KassasService.getAllAdmin({
        search: debouncedSearch || undefined,
        sortField,
        order: sortOrder,
        page,
        limit,
      }),
    keepPreviousData: true,
  });

  const kassas = data?.items ?? [];
  const total = data?.total ?? 0;

  // ─── Мутации ───
  const createMutation = useMutation({
    mutationFn: KassasService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kassas"] });
      setCreateOpen(false);
      toast.success("Касса успешно создана");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg || "Xatolik yuz berdi"));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateKassaDto }) =>
      KassasService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kassas"] });
      setEditItem(null);
      setCreateOpen(false);
      toast.success("Касса обновлена");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Ошибка обновления кассы");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: KassasService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kassas"] });
      setDeleteId(null);
      toast.success("Касса удалена");
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message ||
        "Не удалось удалить кассу (возможно, есть операции или баланс)";
      toast.error(msg);
    },
  });

  // ─── Handlers ───
  const handleCreate = (dto: CreateKassaDto) => {
    createMutation.mutate(dto);
  };

  const handleUpdate = (dto: UpdateKassaDto) => {
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
    canDelete: true, // часто лучше false — кассы удаляют редко
  };

  return (
    <div className="space-y-6">
      {/* Поиск + переключение вида + кнопка создания */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Input
          placeholder="Поиск по названию кассы..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="flex items-center gap-3">
          <CrudViewToggle value={view} onChange={setView} />
          <Button onClick={() => setCreateOpen(true)}>Добавить кассу</Button>
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
          Ошибка загрузки касс: {error instanceof Error ? error.message : "Неизвестная ошибка"}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <CrudRenderer
            view={view}
            data={kassas}
            fields={kassaFields}
            permissions={permissions}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onRowClick={(row) => router.push(`/kassas/${row.id}`)} // → детальная страница кассы
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
              disabled={kassas.length < limit}
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
        title={editItem ? "Редактировать кассу" : "Новая касса"}
      >
        {/* Если это редактирование, используем CrudForm (так как валюту менять нельзя по логике многих систем)
      Если создание — нашу новую форму с Drawer */}
        {editItem ? (
          <CrudForm
            fields={kassaFields.filter(f => f.name !== 'currencyId')} // Запрещаем менять валюту при ред.
            schema={UpdateKassaSchema}
            defaultValues={editItem}
            onSubmit={handleUpdate}
          />
        ) : (
          <CreateKassaForm
            onSubmit={handleCreate}
            isLoading={createMutation.isPending}
          />
        )}
      </CrudDialog>

      {/* Подтверждение удаления */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Удалить кассу?"
        description="Это действие нельзя отменить. Удаление возможно только если по кассе нет операций и баланс нулевой."
        onConfirm={handleDelete}
      />
    </div>
  );
}