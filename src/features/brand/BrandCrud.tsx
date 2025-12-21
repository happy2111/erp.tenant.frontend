"use client";

import { useState, useEffect } from "react";
import {
  createBrandSchema,
  updateBrandSchema,
  CreateBrandDto,
  UpdateBrandDto,
  Brand,
} from "@/schemas/brand.schema";

import { CrudTable } from "@/components/crud/CrudTable";
import { CrudForm } from "@/components/crud/CrudForm";
import { CrudDialog } from "@/components/crud/CrudDialog";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";
import { brandFields } from "./brand.fields";

import { CrudViewToggle } from "@/components/crud/CrudViewToggle";
import { CrudRenderer } from "@/components/crud/CrudRenderer";
import { CrudViewMode } from "@/components/crud/types";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { debounce } from "lodash";
import {useBrandStore} from "@/store/brand.store";

export function BrandCrud() {
  const {
    brands,
    total,
    page,
    limit,
    fetchBrands,
    createBrand,
    updateBrand,
    deleteBrand,
  } = useBrandStore();

  // CRUD dialogs
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [view, setView] = useState<CrudViewMode>("table");

  // search
  const [search, setSearch] = useState("");

  // ===== Fetch Brands =====
  const loadBrands = (searchTerm = "", pageNum = 1) => {
    fetchBrands({ search: searchTerm, page: pageNum, limit });
  };

  // debounce search input
  const handleSearchChange = debounce((value: string) => {
    loadBrands(value, 1);
  }, 300);

  useEffect(() => {
    loadBrands(search, page);
  }, []);

  // ===== CRUD Handlers =====
  const handleCreate = async (dto: CreateBrandDto) => {
    await createBrand(dto);
    setOpen(false);
    loadBrands(search, page);
  };

  const handleUpdate = async (dto: UpdateBrandDto) => {
    if (!editing) return;
    await updateBrand(editing.id, dto);
    setEditing(null);
    setOpen(false);
    loadBrands(search, page);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await deleteBrand(deletingId);
    setDeletingId(null);
    loadBrands(search, page);
  };

  const handlePrevPage = () => {
    if (page > 1) loadBrands(search, page - 1);
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(total / limit);
    if (page < totalPages) loadBrands(search, page + 1);
  };

  const permissions = {
    canCreate: true,
    canEdit: true,
    canDelete: true,
  };


  return (
    <>
      {/* Search + Create */}
      <div className="flex max-sm:flex-col-reverse justify-between sm:items-center items-end mb-4 gap-2">
        <Input
          placeholder="Поиск..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            handleSearchChange(e.target.value);
          }}
        />
        <div className="flex items-center gap-2">
          <CrudViewToggle value={view} onChange={setView} />
          <Button onClick={() => setOpen(true)}>Создать бренд</Button>
        </div>
      </div>


      <CrudRenderer
        view={view}
        data={brands}
        fields={brandFields}
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

      {/* Create / Edit Dialog */}
      <CrudDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Редактировать бренд" : "Создать бренд"}
      >
        <CrudForm
          fields={brandFields}
          schema={editing ? updateBrandSchema : createBrandSchema}
          defaultValues={editing ?? {}}
          onSubmit={editing ? handleUpdate : handleCreate}
        />
      </CrudDialog>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Удалить бренд?"
        description="Вы точно хотите удалить этот бренд? Это действие нельзя отменить."
        onConfirm={handleDelete}
      />
    </>
  );
}
