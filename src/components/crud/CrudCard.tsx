"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CrudField, CrudPermissions } from "./types";

interface Props<T extends { id: string }> {
  data: T[];
  fields: CrudField<T>[];
  permissions?: CrudPermissions;

  onEdit?: (row: T) => void;
  onDelete?: (id: string) => void;
}

export function CrudCard<T extends { id: string; images?: { id: string; url: string; alt?: string }[] }>({
                                                                                                           data,
                                                                                                           fields,
                                                                                                           permissions = { canEdit: true, canDelete: true },
                                                                                                           onEdit,
                                                                                                           onDelete,
                                                                                                         }: Props<T>) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((row) => (
        <Card key={row.id}>
          <CardContent className="space-y-2 pt-4">
            {fields
              .filter((f) => !f.hiddenInCard)
              .map((field) => (
                <div key={String(field.name)}>
                  <p className="text-xs text-muted-foreground">{field.label}</p>
                  <p className="font-medium">
                    {field.render ? field.render(row) : String(row[field.name as keyof typeof row] ?? "—")}
                  </p>
                </div>
              ))}

            {/* изображения */}
            {row.images?.length > 0 && (
              <div className="flex gap-2 mt-2">
                {row.images.map((img) => (
                  <img key={img.id} src={img.url} alt={img.alt} className="w-16 h-16 object-cover rounded" />
                ))}
              </div>
            )}
          </CardContent>

          {(permissions.canEdit || permissions.canDelete) && (
            <CardFooter className="flex gap-2 justify-end">
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
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
