"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Phone, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Импорт обновленной схемы и DTO
import { CreateOrganizationSchema, CreateOrganizationDto } from "@/schemas/organization.schema";
import { useOrganizationStore } from "@/store/organization.store";

// Используем схему напрямую
type OrganizationFormValues = z.infer<typeof CreateOrganizationSchema>;

export function OrganizationForm2() {
  const router = useRouter();
  const createOrganization = useOrganizationStore((state) => state.createOrganization);
  const loading = useOrganizationStore((state) => state.loading);

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(CreateOrganizationSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
    },
  });

  const onSubmit = async (values: OrganizationFormValues) => {
    const dto: CreateOrganizationDto = values;

    const newOrg = await createOrganization(dto);

    // if (newOrg) {
    //   // Перенаправление на страницу новой организации
    //   router.push(`/organizations/${newOrg.id}`);
    // }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Поле Название Организации (Обязательное) */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название Организации <span className="text-[var(--color-destructive)]">*</span></FormLabel>
              <FormControl>
                <Input
                  placeholder="Например, 'OOO TechSolutions'"
                  {...field}
                  className="h-10 text-[var(--color-foreground)] border-[var(--color-border)] focus-visible:ring-[var(--color-ring)]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Поле Email (Необязательное) */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                  <Input
                    placeholder="contact@company.com"
                    {...field}
                    value={field.value || ""} // Для корректной работы с nullable/optional
                    className="pl-10 h-10 text-[var(--color-foreground)] border-[var(--color-border)] focus-visible:ring-[var(--color-ring)]"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Поле Телефон (Необязательное) */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Телефон</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                  <Input
                    placeholder="+998 90 123 45 67"
                    {...field}
                    value={field.value || ""}
                    className="pl-10 h-10 text-[var(--color-foreground)] border-[var(--color-border)] focus-visible:ring-[var(--color-ring)]"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Поле Адрес (Необязательное, используем Textarea для потенциально длинного текста) */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Адрес</FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-[var(--color-muted-foreground)]" />
                  <Textarea
                    placeholder="Главный офис, ул. Независимости, 10"
                    className="resize-none pl-10 min-h-[80px] text-[var(--color-foreground)] border-[var(--color-border)] focus-visible:ring-[var(--color-ring)]"
                    {...field}
                    value={field.value || ""}
                  />
                </div>
              </FormControl>
              <FormDescription className="text-[var(--color-muted-foreground)]">
                Физический или юридический адрес организации.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Кнопка Отправить */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-10 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-[var(--color-primary-foreground)] rounded-[var(--radius-sm)]"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Создание...</>
          ) : (
            "Создать Организацию"
          )}
        </Button>
      </form>
    </Form>
  );
}