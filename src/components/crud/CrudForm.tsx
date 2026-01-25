"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CrudField } from "./types";

interface Props<T, Dto> {
  fields: CrudField<T>[];
  schema: any;
  defaultValues?: Partial<Dto>;
  onSubmit: (dto: Dto) => Promise<void>;
}

export function CrudForm<T, Dto>({
                                   fields,
                                   schema,
                                   defaultValues,
                                   onSubmit,
                                 }: Props<T, Dto>) {
  const form = useForm<Dto>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
    >
      {fields.filter((field) => !field.hiddenInForm).map((field) => {
        const fieldName = field.name as any;
        const error =
          form.formState.errors[fieldName]?.message as string;

        return (
          <div key={String(field.name)} className="space-y-1">
            <Label>{field.label}</Label>

            {/* ===== SELECT ===== */}
            {field.type === "select" && field.options ? (
              <Select
                value={form.watch(fieldName)}
                onValueChange={(value) =>
                  form.setValue(fieldName, value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите..." />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              /* ===== INPUT ===== */
              <Input
                type={field.type ?? "text"}
                {...form.register(fieldName)}
              />
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        );
      })}

      <Button type="submit" className="w-full">
        Сохранить
      </Button>
    </form>
  );
}
