"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Cuboid, Layers, Plus } from "lucide-react";
import { toast } from "sonner";

import { AttributesService } from "@/services/attributes.service";
import {
  Attribute,
  AttributeScope,
  AttributeScopeSchema,
  CreateAttributeDto,
  UpdateAttributeDto,
  CreateAttributeSchema,
  UpdateAttributeSchema,
} from "@/schemas/attributes.schema";

import { attributeFields } from "./attributes.fields";
import { useCrudController } from "@/hooks/useCrudController";
import { PRODUCT_LABELS } from "@/lib/product-labels";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CrudRenderer } from "@/components/crud/CrudRenderer";
import { CrudViewToggle } from "@/components/crud/CrudViewToggle";
import { CrudDialog } from "@/components/crud/CrudDialog";
import { CrudForm } from "@/components/crud/CrudForm";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";
import { CrudViewMode } from "@/components/crud/types";

function parseScope(raw: string | null): AttributeScope {
  const parsed = AttributeScopeSchema.safeParse(raw);
  return parsed.success ? parsed.data : "variant";
}

export function AttributesCrud() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const controller = useCrudController<Attribute>();

  const scope = parseScope(searchParams.get("scope"));

  const setScope = (next: AttributeScope) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("scope", next);
    router.replace(`/attributes?${params.toString()}`);
    setPage(1);
  };

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

  const [sortField, setSortField] = useState<"name" | "key" | "createdAt">(
    "name",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    localStorage.setItem("attributes-view-mode", view);
  }, [view]);

  // Нет ?scope= — фиксируем в URL, чтобы вкладка была явным searchParam
  useEffect(() => {
    if (!searchParams.get("scope")) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("scope", "variant");
      router.replace(`/attributes?${params.toString()}`);
    }
  }, [searchParams, router]);

  const listFilter = useMemo(
    () =>
      scope === "instance"
        ? { isForInstance: true as const }
        : { isForVariant: true as const },
    [scope],
  );

  const createDefaults = useMemo(
    () => ({
      isRequired: false,
      isForVariant: scope === "variant",
      isForInstance: scope === "instance",
    }),
    [scope],
  );

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "attributes",
      scope,
      debouncedSearch,
      page,
      limit,
      sortField,
      sortOrder,
    ],
    queryFn: () =>
      AttributesService.getAllAdmin({
        search: debouncedSearch || undefined,
        page,
        limit,
        sortField,
        order: sortOrder,
        ...listFilter,
      }),
    placeholderData: keepPreviousData,
  });

  const attributes = data?.items ?? [];
  const total = data?.total ?? 0;

  const createMutation = useMutation({
    mutationFn: AttributesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
      setCreateOpen(false);
      toast.success("Xarakteristika yaratildi");
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message?.message ||
          err?.response?.data?.message ||
          "Yaratishda xatolik",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAttributeDto }) =>
      AttributesService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
      setEditItem(null);
      setCreateOpen(false);
      toast.success("Saqlandi");
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message?.message ||
          err?.response?.data?.message ||
          "Yangilashda xatolik",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: AttributesService.hardDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
      setDeleteId(null);
      toast.success("O‘chirildi");
    },
    onError: (err: any) => {
      const errorMessage =
        err?.response?.data?.message?.message ||
        err?.response?.data?.message ||
        "O‘chirishda xatolik";

      toast.error(errorMessage);
    },
  });

  const handleCreate = async (dto: CreateAttributeDto) => {
    // Область задаётся вкладкой (?scope=), не формой — иначе zod-default
    // isForVariant:true затрёт создание instance-атрибута.
    await createMutation.mutateAsync({
      ...dto,
      isForVariant: scope === "variant",
      isForInstance: scope === "instance",
    });
  };

  const handleUpdate = async (dto: UpdateAttributeDto) => {
    if (!editItem?.id) return;
    await updateMutation.mutateAsync({ id: editItem.id, dto });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
  };

  const handleSort = (field: string) => {
    const validField = field as typeof sortField;

    if (sortField === validField) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else if (["name", "key", "createdAt"].includes(validField)) {
      setSortField(validField);
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
      <Tabs
        value={scope}
        onValueChange={(v) => setScope(parseScope(v))}
        className="w-full"
      >
        <TabsList className="h-auto w-full sm:w-fit p-1 gap-1">
          <TabsTrigger
            value="variant"
            className="h-auto flex-1 sm:flex-none items-start gap-2 px-3 py-2.5 whitespace-normal"
          >
            <Layers className="size-4 mt-0.5 shrink-0" />
            <span className="flex flex-col items-start text-left gap-0.5">
              <span className="font-bold leading-none">
                {PRODUCT_LABELS.variant.shortPlural}
              </span>
              <span className="text-[10px] font-medium opacity-50 leading-tight">
                {PRODUCT_LABELS.attributes.forVariantHint}
              </span>
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="instance"
            className="h-auto flex-1 sm:flex-none items-start gap-2 px-3 py-2.5 whitespace-normal"
          >
            <Cuboid className="size-4 mt-0.5 shrink-0" />
            <span className="flex flex-col items-start text-left gap-0.5">
              <span className="font-bold leading-none">
                {PRODUCT_LABELS.instance.shortPlural}
              </span>
              <span className="text-[10px] font-medium opacity-50 leading-tight">
                {PRODUCT_LABELS.attributes.forInstanceHint}
              </span>
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Input
          placeholder="Nomi yoki kalit bo‘yicha qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="flex items-center gap-3">
          <CrudViewToggle value={view} onChange={setView} />
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
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
          Xarakteristikalarni yuklashda xatolik:{" "}
          {error instanceof Error ? error.message : "Noma’lum xatolik"}
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
              router.push(`/attributes/${row.id}?scope=${scope}`);
            }}
          />

          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Oldingi
            </Button>
            <span>
              Sahifa {page} / {Math.max(1, Math.ceil(total / limit))}
            </span>
            <Button
              variant="outline"
              disabled={attributes.length < limit}
              onClick={() => setPage((p) => p + 1)}
            >
              Keyingi
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
        title={
          editItem
            ? PRODUCT_LABELS.attributes.edit
            : scope === "instance"
              ? PRODUCT_LABELS.attributes.newForInstance
              : PRODUCT_LABELS.attributes.newForVariant
        }
      >
        <CrudForm
          fields={attributeFields}
          schema={editItem ? UpdateAttributeSchema : CreateAttributeSchema}
          defaultValues={
            editItem ??
            ({
              key: "",
              name: "",
              ...createDefaults,
            } as Partial<CreateAttributeDto>)
          }
          onSubmit={(editItem ? handleUpdate : handleCreate) as any}
          submitLabel="Saqlash"
          submittingLabel="Saqlanmoqda..."
        />
      </CrudDialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Xarakteristikani o‘chirish?"
        description="Bu amalni bekor qilib bo‘lmaydi. Agar xarakteristika tovarlarda ishlatilayotgan bo‘lsa — o‘chirish bloklanishi mumkin."
        confirmLabel="Tasdiqlash"
        cancelLabel="Bekor qilish"
        onConfirm={handleDelete}
      />
    </div>
  );
}
