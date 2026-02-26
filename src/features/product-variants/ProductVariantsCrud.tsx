"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData
} from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { ProductVariantsService } from "@/services/product-variants.service";
import {
  ProductVariant,
  CreateProductVariantDto,
  UpdateProductVariantDto,
  CreateProductVariantSchema,
  UpdateProductVariantSchema,
} from "@/schemas/product-variants.schema";

import { productVariantFields } from "./product-variants.fields";
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
import {Plus} from "lucide-react";
import {useRouter} from "next/navigation";

export function ProductVariantsCrud() {
  const queryClient = useQueryClient();
  const controller = useCrudController<ProductVariant>();
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
    const saved = localStorage.getItem("product-variants-view-mode");
    return (saved as CrudViewMode) || "table";
  });

  const [sortField, setSortField] = useState<"title" | "sku" | "createdAt">("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    localStorage.setItem("product-variants-view-mode", view);
  }, [view]);

  // ─── Запрос списка вариантов ───
  const { data, isLoading, error } = useQuery({
    queryKey: ["product-variants", debouncedSearch, page, limit, sortField, sortOrder],
    queryFn: () =>
      ProductVariantsService.getAllAdmin({
        search: debouncedSearch || undefined,
        sortField,
        order: sortOrder,
        page,
        limit,
      }),
    placeholderData: keepPreviousData,
  });

  const variants = data?.items ?? [];
  const total = data?.total ?? 0;

  // ─── Мутации ───
  const createMutation = useMutation({
    mutationFn: ProductVariantsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-variants"] });
      setCreateOpen(false);
      toast.success("Вариант товара создан");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Ошибка создания варианта");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductVariantDto }) =>
      ProductVariantsService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-variants"] });
      setEditItem(null);
      setCreateOpen(false);
      toast.success("Вариант обновлён");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ProductVariantsService.hardDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-variants"] });
      setDeleteId(null);
      toast.success("Вариант удалён");
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message ||
        "Не удалось удалить вариант (возможно, есть связанные записи)"
      );
    },
  });

  // ─── Handlers ───
  const handleCreate = async (dto: CreateProductVariantDto) => {
    await createMutation.mutateAsync(dto);
  };

  const handleUpdate = async (dto: UpdateProductVariantDto) => {
    if (!editItem?.id) return;
    await updateMutation.mutateAsync({ id: editItem.id, dto });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
   await  deleteMutation.mutateAsync(deleteId);
  };

  const handleSort = (field: string) => { // Меняем тип аргумента на string
    const validField = field as typeof sortField; // Приводим к нужному типу для логики

    if (sortField === validField) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      if (["title" , "sku" , "createdAt"].includes(validField)) {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Input
          placeholder="Поиск по названию варианта, SKU, штрихкоду..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="flex items-center gap-3">
          <CrudViewToggle value={view} onChange={setView} />
          <Button onClick={() => router.push('/product-variants/create')}><Plus/></Button>
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
          Ошибка загрузки вариантов: {error instanceof Error ? error.message : "Неизвестная ошибка"}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <CrudRenderer
            view={view}
            data={variants}
            fields={productVariantFields}
            permissions={permissions}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onRowClick={(row) => router.push('/product-variants/' + row.id)}
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
              disabled={variants.length < limit}
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
        title={editItem ? "Редактировать вариант" : "Новый вариант товара"}
      >
        <CrudForm
          fields={productVariantFields}
          schema={editItem ? UpdateProductVariantSchema : CreateProductVariantSchema}
          defaultValues={editItem ?? {}}
          onSubmit={editItem ? handleUpdate : handleCreate}
        />
      </CrudDialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Удалить вариант товара?"
        description="Это действие нельзя отменить. Если вариант используется в заказах или имеет остатки — удаление может быть заблокировано."
        onConfirm={handleDelete}
      />
    </div>
  );
}