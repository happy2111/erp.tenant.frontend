"use client";

import { useState, useEffect } from "react";
import {
  createProductSchema,
  updateProductSchema,
  CreateProductDto,
  UpdateProductDto,
  Product,
} from "@/schemas/product.schema";

import { CrudForm } from "@/components/crud/CrudForm";
import { CrudDialog } from "@/components/crud/CrudDialog";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";
import { CrudRenderer } from "@/components/crud/CrudRenderer";
import { CrudViewToggle } from "@/components/crud/CrudViewToggle";
import { CrudViewMode } from "@/components/crud/types";

import { productFields } from "./product.fields";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { debounce } from "lodash";
import {useProductStore} from "@/store/product.store";
import {useBrandStore} from "@/store/brand.store";

export function ProductCrud() {
  const {
    products,
    total,
    page,
    limit,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProductStore();

  const { brands, fetchBrands } = useBrandStore();

  useEffect(() => {
    if (brands.length === 0) {
      fetchBrands({ page: 1, limit: 100 });
    }
  }, []);



  // dialogs
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // view mode
  const [view, setView] = useState<CrudViewMode>("table");

  // search
  const [search, setSearch] = useState("");

  // ===== Fetch Products =====
  const loadProducts = (searchTerm = "", pageNum = 1) => {
    fetchProducts({ search: searchTerm, page: pageNum, limit });
  };

  const handleSearchChange = debounce((value: string) => {
    loadProducts(value, 1);
  }, 300);

  useEffect(() => {
    loadProducts(search, page);
  }, []);

  // ===== CRUD handlers =====
  const handleCreate = async (dto: CreateProductDto) => {
    await createProduct(dto);
    setOpen(false);
    loadProducts(search, page);
  };

  const handleUpdate = async (dto: UpdateProductDto) => {
    if (!editing) return;
    await updateProduct(editing.id, dto);
    setEditing(null);
    setOpen(false);
    loadProducts(search, page);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await deleteProduct(deletingId);
    setDeletingId(null);
    loadProducts(search, page);
  };

  const handlePrevPage = () => {
    if (page > 1) loadProducts(search, page - 1);
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(total / limit);
    if (page < totalPages) loadProducts(search, page + 1);
  };

  // permissions (позже легко подключить RBAC)
  const permissions = {
    canCreate: true,
    canEdit: true,
    canDelete: true,
  };

  const fields = productFields(brands);


  return (
    <>
      {/* Search + Controls */}
      <div className="flex max-sm:flex-col-reverse justify-between sm:items-center items-end mb-4 gap-2">
        <Input
          placeholder="Поиск товаров..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            handleSearchChange(e.target.value);
          }}
        />

        <div className="flex items-center gap-2">
          <CrudViewToggle value={view} onChange={setView} />
          {permissions.canCreate && (
            <Button onClick={() => setOpen(true)}>
              Создать товар
            </Button>
          )}
        </div>
      </div>

      {/* Table / Card */}
      <CrudRenderer
        view={view}
        data={products}
        fields={fields}
        permissions={permissions}
        onEdit={(row) => {
          setEditing(row);
          setOpen(true);
        }}
        onDelete={(id) => {
          setDeletingId(id);
          setDeleteOpen(true);
        }}
      />

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <Button
          variant="outline"
          onClick={handlePrevPage}
          disabled={page <= 1}
        >
          Предыдущая
        </Button>

        <span>
          Страница {page} из {Math.ceil(total / limit)}
        </span>

        <Button
          variant="outline"
          onClick={handleNextPage}
          disabled={page >= Math.ceil(total / limit)}
        >
          Следующая
        </Button>
      </div>

      {/* Create / Edit */}
      <CrudDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Редактировать товар" : "Создать товар"}
      >
        <CrudForm
          fields={fields}
          schema={editing ? updateProductSchema : createProductSchema}
          defaultValues={editing ?? {}}
          onSubmit={editing ? handleUpdate : handleCreate}
        />
      </CrudDialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Удалить товар?"
        description="Вы уверены, что хотите удалить этот товар? Это действие необратимо."
        onConfirm={handleDelete}
      />
    </>
  );
}
