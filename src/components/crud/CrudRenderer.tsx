"use client";

import { CrudTable } from "./CrudTable";
import { CrudCard } from "./CrudCard";
import { CrudField, CrudPermissions } from "./types";
import { CrudViewMode } from "./types";

interface Props<T extends { id: string }> {
  view: CrudViewMode;
  data: T[];
  fields: CrudField<T>[];
  permissions?: CrudPermissions;

  onEdit?: (row: T) => void;
  onDelete?: (id: string) => void;
}
// src/components/crud/CrudRenderer.tsx
export function CrudRenderer<T extends { id: string }>({
                                                         view,
                                                         data,
                                                         fields,
                                                         permissions,
                                                         onEdit,
                                                         onDelete,
                                                         sortField,
                                                         sortOrder,
                                                         onSort,
                                                       }: Props<T> & {
  sortField?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string) => void;
}) {
  if (view === "card") {
    return <CrudCard data={data} fields={fields} permissions={permissions} onEdit={onEdit} onDelete={onDelete} />;
  }

  return (
    <CrudTable
      data={data}
      fields={fields}
      permissions={permissions}
      onEdit={onEdit}
      onDelete={onDelete}
      sortField={sortField}
      sortOrder={sortOrder}
      onSort={onSort}
    />
  );
}