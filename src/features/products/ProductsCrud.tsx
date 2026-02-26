"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData
} from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { ProductsService } from "@/services/products.service";
import {
  Product,
  CreateProductDto,
  UpdateProductDto,
  GetProductQueryDto,
  CreateProductSchema,
  UpdateProductSchema,
} from "@/schemas/products.schema";

import { productFields } from "./products.fields";
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

export function ProductsCrud() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const controller = useCrudController<Product>();

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
    const saved = localStorage.getItem("products-view-mode");
    return (saved as CrudViewMode) || "table";
  });

  const [sortField, setSortField] = useState<"name" | "createdAt" | "code">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    localStorage.setItem("products-view-mode", view);
  }, [view]);

  // ─── Запрос списка товаров ───
  const { data, isLoading, error } = useQuery({
    queryKey: ["products", debouncedSearch, page, limit, sortField, sortOrder],
    queryFn: () =>
      ProductsService.getAllAdmin({
        search: debouncedSearch || undefined,
        sortField,
        order: sortOrder,
        page,
        limit,
      }),
    placeholderData: keepPreviousData,
  });

  const products = data?.items ?? [];
  const total = data?.total ?? 0;

  // ─── Мутации ───
  const createMutation = useMutation({
    mutationFn: ProductsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setCreateOpen(false);
      toast.success("Товар успешно создан");
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.message)
          ? err.response.data.message.join(", ")
          : "Не удалось создать товар");
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductDto }) =>
      ProductsService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditItem(null);
      setCreateOpen(false);
      toast.success("Товар обновлён");
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message || "Ошибка при обновлении товара"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ProductsService.hardDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeleteId(null);
      toast.success("Товар удалён");
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message ||
        "Не удалось удалить товар (возможно, есть связанные варианты/цены/изображения)";
      toast.error(msg);
    },
  });

  // ─── Handlers ───
  const handleCreate = async (dto: CreateProductDto) => {
    await createMutation.mutateAsync(dto);
  };

  const handleUpdate = async (dto: UpdateProductDto) => {
    if (!editItem?.id) return;
   await  updateMutation.mutateAsync({ id: editItem.id, dto });
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
      if (["name" , "createdAt" , "code"].includes(validField)) {
        setSortField(validField);
        setSortOrder("asc");
      }
    }
    setPage(1);
  };

  const permissions = {
    canCreate: true,
    canEdit: true,
    canDelete: true, // часто ставят false — товары удаляют редко
  };

  return (
    <div className="space-y-6">
      {/* Поиск + переключение вида + кнопка создания */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Input
          placeholder="Поиск по названию, артикулу..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="flex items-center gap-3">
          <CrudViewToggle value={view} onChange={setView} />
          <Button onClick={() => router.push("/products/create")}><Plus/></Button>
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
          Ошибка загрузки товаров: {error instanceof Error ? error.message : "Неизвестная ошибка"}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <CrudRenderer
            view={view}
            data={products}
            fields={productFields}
            permissions={permissions}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onRowClick={(row) => router.push(`/products/${row.id}`)} // → детальная страница товара
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
              disabled={products.length < limit}
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
        title={editItem ? "Редактировать товар" : "Новый товар"}
      >
        <CrudForm
          fields={productFields}
          schema={editItem ? UpdateProductSchema : CreateProductSchema}
          defaultValues={editItem ?? {}}
          onSubmit={editItem ? handleUpdate : handleCreate}
        />
      </CrudDialog>

      {/* Подтверждение удаления */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Удалить товар?"
        description="Это действие нельзя отменить. Если у товара есть варианты, цены, изображения или он в заказах — удаление будет заблокировано."
        onConfirm={handleDelete}
      />
    </div>
  );
}