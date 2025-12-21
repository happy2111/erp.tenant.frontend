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

export function CrudRenderer<T extends { id: string }>({
                                                         view,
                                                         ...props
                                                       }: Props<T>) {
  if (view === "card") {
    return <CrudCard {...props} />;
  }

  return <CrudTable {...props} />;
}
