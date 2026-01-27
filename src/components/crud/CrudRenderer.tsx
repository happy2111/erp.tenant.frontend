"use client";

import { CrudTable } from "./CrudTable";
import { CrudCard } from "./CrudCard";
import { CrudField, CrudPermissions, CrudViewMode } from "./types";

interface Props<T extends { id: string }> {
  view: CrudViewMode;
  data: T[];
  fields: CrudField<T>[];
  permissions?: CrudPermissions;

  // Обработчики действий
  onEdit?: (row: T) => void;
  onDelete?: (id: string) => void;

  /** * Новый пропс: срабатывает при клике на всю строку таблицы или всю карточку.
   * Пример: (row) => router.push(`/tenant-user/${row.id}`)
   */
  onRowClick?: (row: T) => void;

  // Сортировка
  sortField?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string) => void;
}

export function CrudRenderer<T extends { id: string }>({
                                                         view,
                                                         data,
                                                         fields,
                                                         permissions,
                                                         onEdit,
                                                         onDelete,
                                                         onRowClick,
                                                         sortField,
                                                         sortOrder,
                                                         onSort,
                                                       }: Props<T>) {

  const commonProps = {
    data,
    fields,
    permissions,
    onEdit,
    onDelete,
    onRowClick,
  };

  if (view === "card") {
    return <CrudCard {...commonProps} />;
  }

  return (
    <CrudTable
      {...commonProps}
      sortField={sortField}
      sortOrder={sortOrder}
      onSort={onSort}
    />
  );
}