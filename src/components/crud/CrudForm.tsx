"use client";

import { useForm, Controller } from "react-hook-form"; // Добавили Controller
import { zodResolver } from "@hookform/resolvers/zod";
import { PatternFormat } from "react-number-format"; // Импорт маски
import { Switch } from "@/components/ui/switch";
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
import { useEffect } from "react";

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
    defaultValues: defaultValues as any,
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues as any);
    }
  }, [defaultValues, form]);

  const onInvalid = (errors: any) => {
    console.error("Form Validation Errors:", errors);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, onInvalid)}
      className="space-y-4"
    >
      {fields.filter((field) => !field.hiddenInForm).map((field) => {
        const fieldName = field.name as any;
        const error = form.formState.errors[fieldName as keyof Dto]?.message as string;

        return (
          <div key={String(field.name)} className="space-y-1">
            <Label>{field.label}</Label>

            {/* ===== SELECT ===== */}
            {field.type === "select" && field.options ? (
              <Select
                value={form.watch(fieldName) || ""}
                onValueChange={(value) =>
                  form.setValue(fieldName, value as any, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите..." />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === "boolean" ? (
              /* ===== BOOLEAN ===== */
              <div className="flex items-center space-x-2 py-2">
                <Switch
                  id={String(field.name)}
                  checked={!!form.watch(fieldName)}
                  onCheckedChange={(checked) =>
                    form.setValue(fieldName, checked as any, {
                      shouldValidate: true,
                      shouldDirty: true
                    })
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {form.watch(fieldName) ? "Да" : "Нет"}
                </span>
              </div>
            ) : field.type === "phone" ? (
              /* ===== PHONE INPUT (С МАСКОЙ) ===== */
              <Controller
                control={form.control}
                name={fieldName}
                render={({ field: { onChange, value } }) => (
                  <PatternFormat
                    // 1. В формате ТОЛЬКО те цифры, которые вводит пользователь (9 штук)
                    format="(##) ###-##-##"
                    mask="_"
                    customInput={Input}

                    // 2. Убираем +998 из значения перед передачей в инпут,
                    // чтобы библиотека не пыталась запихнуть '998' в скобки (##)
                    value={value ? value.replace("+998", "") : ""}

                    // 3. Добавляем +998 визуально слева от инпута
                    // Можно использовать CSS или просто обертку
                    prefix="+998 "

                    onValueChange={(values) => {
                      // values.value — это только 9 цифр, которые ввел юзер (например 901234567)
                      const userInput = values.value;

                      if (!userInput) {
                        onChange("");
                      } else {
                        // Сохраняем в стейт полную строку для бэкенда
                        onChange(`+998${userInput}`);
                      }
                    }}
                    placeholder="(__) ___-__-__"
                  />
                )}
              />
            ) : (
              /* ===== DEFAULT INPUT ===== */
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

      <Button
        type="submit"
        className="w-full"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Сохранение..." : "Сохранить"}
      </Button>
    </form>
  );
}