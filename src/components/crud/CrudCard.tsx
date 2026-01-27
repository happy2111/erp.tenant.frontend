"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import { CrudField, CrudPermissions } from "./types";
import { cn } from "@/lib/utils";

interface Props<T extends { id: string }> {
  data: T[];
  fields: CrudField<T>[];
  permissions?: CrudPermissions;
  onEdit?: (row: T) => void;
  onRowClick?: (row: T) => void;
  onDelete?: (id: string) => void;
}
export function CrudCard<T extends { id: string; images?: { id: string; url: string; alt?: string }[] }>({
                                                                                                           data,
                                                                                                           fields,
                                                                                                           permissions = { canEdit: true, canDelete: true },
                                                                                                           onEdit,
                                                                                                           onDelete,
                                                                                                           onRowClick
                                                                                                         }: Props<T>) {
  return (
    /* Изменено: добавлена поддержка 4 и 5 колонок на больших экранах */
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {data.map((row) => (
        <Card
          key={row.id}
          onClick={() => onRowClick?.(row)}
          className={cn(
            "group relative overflow-hidden transition-all duration-300",
            "rounded-[1.5rem] bg-card/40 backdrop-blur-xl hover:-translate-y-1",
            /* Четкие границы: комбинируем border и кольцо для контраста */
            "border border-border/100 shadow-sm hover:shadow-xl dark:border-white/10 dark:hover:border-primary/50"
          )}
        >
          {/* Стеклянный блик сверху стал ярче */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <CardContent className="p-3 space-y-3"> {/* Уменьшены padding с 6 до 3 */}
            {/* Изображение стало компактнее по высоте */}
            {row.images && row.images.length > 0 ? (
              <div className="relative h-36 w-full overflow-hidden rounded-xl bg-sidebar-accent/50">
                <img
                  src={row.images[0].url}
                  alt={row.images[0].alt || "Preview"}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {row.images.length > 1 && (
                  <div className="absolute bottom-1.5 right-1.5 rounded-md bg-black/60 backdrop-blur-md px-1.5 py-0.5 text-[9px] text-white flex items-center gap-1">
                    <ImageIcon className="size-3" />
                    +{row.images.length - 1}
                  </div>
                )}
              </div>
            ) : (
              <div></div>
              // <div className="h-36 w-full rounded-xl bg-sidebar-accent/20 flex items-center justify-center border border-dashed border-border/50 text-muted-foreground/40">
              //   <ImageIcon className="size-8" />
              // </div>
            )}

            <div className="grid grid-cols-2 gap-2"> {/* Поля теперь в две колонки для компактности */}
              {fields
                .filter((f) => !f.hiddenInCard)
                .map((field) => (
                  <div key={String(field.name)} className="flex flex-col min-w-0">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold truncate">
                      {field.label}
                    </span>
                    <div className="text-xs font-semibold truncate group-hover:text-primary transition-colors">
                      {field.render ? field.render(row) : String(row[field.name as keyof typeof row] ?? "—")}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>

          {(permissions.canEdit || permissions.canDelete) && (
            <CardFooter onClick={(e) => e.stopPropagation()} className="flex gap-1 justify-end p-2 bg-sidebar-accent/10 border-t border-border/50">
              {permissions.canEdit && onEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(row)}
                  className="h-8 px-2 rounded-lg hover:bg-primary/10 hover:text-primary gap-1.5 transition-all text-[11px]"
                >
                  <Edit2 className="size-3" />
                  Tahrirlash
                </Button>
              )}

              {permissions.canDelete && onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(row.id)}
                  className="h-8 px-2 rounded-lg hover:bg-destructive/10 hover:text-destructive gap-1.5 transition-all text-[11px]"
                >
                  <Trash2 className="size-3" />
                  O&lsquo;chirish
                </Button>
              )}
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}