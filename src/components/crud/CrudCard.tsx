"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Image as ImageIcon, ArrowRight } from "lucide-react";
import { CrudField, CrudPermissions } from "./types";
import { cn, getNestedValue } from "@/lib/utils";
import {toast} from "sonner";

interface Props<T extends { id: string }> {
  data: T[];
  fields: CrudField<T>[];
  permissions?: CrudPermissions;
  onEdit?: (row: T) => void;
  onRowClick?: (row: T) => void;
  onDelete?: (id: string) => void;
}





export function CrudCard<
  T extends {
    id: string;
    images?: { id: string; url: string; alt?: string }[];
  }
>({
    data,
    fields,
    permissions = { canEdit: true, canDelete: true },
    onEdit,
    onDelete,
    onRowClick,
  }: Props<T>) {
  const titleField = fields.find((f) => f.isTitle);

  const handleCopy = (text: string) => {
    if (!text || text === "—") return;

    navigator.clipboard.writeText(text);

    // Foydalanuvchiga xabar berish (ixtiyoriy)
    toast.success("Nusxalandi: " + text);
  };



  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {data.map((row) =>

      {
        return (
          <Card
            key={row.id}
            onClick={() => onRowClick?.(row)}
            className={cn(
              "group relative overflow-hidden cursor-pointer",
              "rounded-2xl bg-card/50 backdrop-blur-xl",
              "border border-border shadow-sm",
              "transition-all duration-300",
              "hover:-translate-y-1 hover:shadow-xl",
              "dark:bg-white/[0.03] dark:border-white/10 py-0 pb-6"
            )}
          >
            {/* subtle top highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            {/* IMAGE / HERO */}
            {row.images && row.images.length > 0 ? (
              <div className="relative h-36 overflow-hidden">
                <img
                  src={row.images[0].url}
                  alt={row.images[0].alt || "Preview"}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* title on image */}
                {titleField && (
                  <div className="absolute bottom-2 left-3 right-3 text-white text-sm font-semibold leading-tight line-clamp-2">
                    {titleField.render
                      ? titleField.render(row)
                      : String(getNestedValue(row, String(titleField.name)))}
                  </div>
                )}

                {row.images.length > 1 && (
                  <div className="absolute top-2 right-2 rounded-md bg-black/60 backdrop-blur px-1.5 py-0.5 text-[10px] text-white flex items-center gap-1">
                    <ImageIcon className="size-3" />
                    +{row.images.length - 1}
                  </div>
                )}
              </div>
            ) : (
              <div />
              // <div className="h-36 flex flex-col items-center justify-center gap-1 text-muted-foreground">
              //   <ImageIcon className="size-6 opacity-40" />
              //   <span className="text-[11px]">Rasm yo‘q</span>
              // </div>
            )}

            {/* CONTENT */}
            <CardContent className=" pb-10 space-y-3">
              {/* title without image */}
              {!row.images?.length && titleField && (
                <div className="text-sm font-bold leading-tight line-clamp-2">
                  {titleField.render
                    ? titleField.render(row)
                    : String(getNestedValue(row, String(titleField.name)))}
                </div>
              )}

              {/* meta fields */}
              <div className="space-y-1.5 divide-y divide-border/40">
                {fields
                  .filter((f) => !f.hiddenInCard && !f.isTitle)
                  .map((field) => {
                    const content = field.render
                      ? field.render(row)
                      : String(getNestedValue(row, String(field.name)) ?? "—");

                    return (
                      <div
                        key={String(field.name)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex justify-between gap-2 text-xs py-1.5 hover:bg-neutral-500/5 rounded-[2px]"
                      >
                        <span className="text-muted-foreground truncate text-sm">
                          {field.label}
                        </span>
                        <span
                          className="font-medium text-sm truncate text-right group-hover:text-primary transition-colors cursor-pointer active:scale-95 duration-200"
                          onClick={() => handleCopy(String(content))}
                          title="Nusxalash uchun bosing"
                        >
                          {content}
                        </span>
                      </div>
                    )
                  })}
              </div>

            </CardContent>

            {/* ACTIONS (hover only) */}
            {(permissions.canEdit || permissions.canDelete) && (
              <div
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "absolute inset-x-0 bottom-0",
                  "flex justify-end gap-1 p-2",
                  "bg-gradient-to-t from-background/90 to-transparent",
                  "transition-all duration-300",

                  // 📱 Mobile: always visible
                  "opacity-100 translate-y-0",

                  // 🖥 Desktop: hover only
                  "lg:opacity-0 lg:translate-y-2",
                  "lg:group-hover:opacity-100 lg:group-hover:translate-y-0"
                )}
              >
                {permissions.canEdit && onEdit && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(row)}
                    className="h-8 px-2 text-[11px] rounded-lg hover:bg-primary/10 hover:text-primary"
                  >
                    <Edit2 className="size-3 mr-1" />
                    Tahrirlash
                  </Button>
                )}

                {permissions.canDelete && onDelete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(row.id)}
                    className="h-8 px-2 text-[11px] rounded-lg hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-3 mr-1" />
                    O‘chirish
                  </Button>
                )}

                {
                  onRowClick && (<Button
                    onClick={() => onRowClick?.(row)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-lg hover:bg-muted"
                  >
                    <ArrowRight className="size-4" />
                  </Button>)
                }

              </div>
            )}
          </Card>
        )
      })}
    </div>
  );
}
