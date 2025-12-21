"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { CrudField } from "./types";
import { CrudPermissions } from "./types";

interface Props<T extends { id: string }> {
  data: T[];
  fields: CrudField<T>[];

  permissions?: CrudPermissions;

  onEdit?: (row: T) => void;
  onDelete?: (id: string) => void;
}

export function CrudTable<T extends { id: string }>({
                                                      data,
                                                      fields,
                                                      permissions = {
                                                        canEdit: true,
                                                        canDelete: true,
                                                      },
                                                      onEdit,
                                                      onDelete,
                                                    }: Props<T>) {
  const showActions =
    permissions.canEdit || permissions.canDelete;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {fields
            .filter((f) => !f.hiddenInTable)
            .map((field) => (
              <TableHead key={String(field.name)}>
                {field.label}
              </TableHead>
            ))}

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
                    ? field.render(row)                 // <--- здесь row
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
