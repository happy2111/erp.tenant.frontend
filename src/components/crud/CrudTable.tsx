import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, Edit2, Trash2 } from "lucide-react";
import {cn, getNestedValue} from "@/lib/utils";

import { CrudField } from "./types";
import { CrudPermissions } from "./types";

interface Props<T extends { id: string }> {
  data: T[];
  fields: CrudField<T>[];
  permissions?: CrudPermissions;
  onEdit?: (row: T) => void;
  onDelete?: (id: string) => void;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string) => void;
  onRowClick?: (row: T) => void;

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
                                                      onRowClick
                                                    }: Props<T>) {
  const showActions = permissions.canEdit || permissions.canDelete;

  return (
    <div className="rounded-[2rem] border border-sidebar-border/40 bg-card/20 backdrop-blur-md overflow-hidden shadow-xl">
      <Table>
        <TableHeader className="bg-sidebar-accent/30">
          <TableRow  className="hover:bg-transparent border-b border-sidebar-border/40">
            {fields
              .filter((f) => !f.hiddenInTable)
              .map((field) => {
                const isSortable = ["name", "email", "phone", "createdAt"].includes(field.name as string);
                const isActive = sortField === field.name;

                return (
                  <TableHead
                    key={String(field.name)}
                    className={cn(
                      "h-14 px-6 text-[11px] uppercase tracking-[0.2em] font-bold text-muted-foreground/70 transition-colors",
                      isSortable && "cursor-pointer hover:text-primary select-none"
                    )}
                    onClick={() => isSortable && onSort?.(field.name as string)}
                  >
                    <div className="flex items-center gap-2">
                      {field.label}
                      {isSortable && (
                        <div className={cn(
                          "flex items-center justify-center size-5 rounded-lg transition-all",
                          isActive ? "bg-primary text-primary-foreground" : "bg-sidebar-accent/50"
                        )}>
                          {isActive ? (
                            sortOrder === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
                          ) : (
                            <ArrowUpDown className="size-3 opacity-50" />
                          )}
                        </div>
                      )}
                    </div>
                  </TableHead>
                );
              })}

            {showActions && (
              <TableHead className="w-[160px] text-[11px] uppercase tracking-[0.2em] font-bold text-muted-foreground/70 px-6">
                Amallar
              </TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length > 0 ? (
            data.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className="group border-b border-sidebar-border/20 transition-all hover:bg-sidebar-accent/30"
              >
                {fields
                  .filter((f) => !f.hiddenInTable)
                  .map((field) => {
                    // alert(JSON.stringify(row))

                    return (
                      <TableCell
                        key={String(field.name)}
                        className="px-6 py-4 text-sm font-medium"
                      >
                        {field.render ? (
                          field.render(row)
                        ) : (
                          <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                            {String(getNestedValue(row, String(field.name)) ?? "—")}
                        </span>
                        )}
                      </TableCell>
                    )

                  })}

                {showActions && (
                  <TableCell className="px-6 py-4" >
                    <div className="flex items-center gap-2 sm:opacity-60 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      {permissions.canEdit && onEdit && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(row);
                          }}
                        >
                          <Edit2 className="size-4" />
                        </Button>
                      )}

                      {permissions.canDelete && onDelete && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
                          onClick={() => onDelete(row.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={fields.length + 1} className="h-32 text-center text-muted-foreground opacity-50 italic">
                Ma&apos;lumot topilmadi...
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}