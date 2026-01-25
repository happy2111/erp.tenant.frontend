// src/components/crud/CrudTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"; // ← добавьте эти иконки

import { CrudField } from "./types";
import { CrudPermissions } from "./types";

interface Props<T extends { id: string }> {
  data: T[];
  fields: CrudField<T>[];
  permissions?: CrudPermissions;
  onEdit?: (row: T) => void;
  onDelete?: (id: string) => void;
  sortField?: string;               // ← новое
  sortOrder?: "asc" | "desc";       // ← новое
  onSort?: (field: string) => void; // ← новое
}

export function CrudTable<T extends { id: string }>({
                                                      data,
                                                      fields,
                                                      permissions = { canEdit: true, canDelete: true },
                                                      onEdit,
                                                      onDelete,
                                                      sortField,
                                                      sortOrder,
                                                      onSort,
                                                    }: Props<T>) {
  const showActions = permissions.canEdit || permissions.canDelete;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {fields
            .filter((f) => !f.hiddenInTable)
            .map((field) => {
              const isSortable = ["name", "email", "phone", "createdAt"].includes(field.name as string);
              const isActive = sortField === field.name;

              return (
                <TableHead
                  key={String(field.name)}
                  className={isSortable ? "cursor-pointer select-none" : ""}
                  onClick={() => isSortable && onSort?.(field.name as string)}
                >
                  <div className="flex items-center gap-2">
                    {field.label}
                    {isSortable && (
                      <>
                        {isActive ? (
                          sortOrder === "asc" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-30" />
                        )}
                      </>
                    )}
                  </div>
                </TableHead>
              );
            })}

          {showActions && (
            <TableHead className="w-[140px]">Действия</TableHead>
          )}
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id}>
            {fields
              .filter((f) => !f.hiddenInTable)
              .map((field) => (
                <TableCell key={String(field.name)}>
                  {field.render
                    ? field.render(row)
                    : String(row[field.name as keyof typeof row] ?? "—")}
                </TableCell>
              ))}

            {showActions && (
              <TableCell className="flex gap-2">
                {permissions.canEdit && onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(row)}
                  >
                    Изменить
                  </Button>
                )}

                {permissions.canDelete && onDelete && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(row.id)}
                  >
                    Удалить
                  </Button>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}