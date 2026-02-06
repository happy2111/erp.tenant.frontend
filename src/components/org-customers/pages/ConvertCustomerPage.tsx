"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { OrganizationCustomerService } from "@/services/org.customer.service";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Loader2, Save, X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

import { CreateAccountSection } from "@/components/tenant-user/sections/CreateAccountSection";
import { CreateProfileSection } from "@/components/tenant-user/sections/CreateProfileSection";
import { CreatePhonesSection } from "@/components/tenant-user/sections/CreatePhonesSection";
import {
  OrganizationCustomer,
  ConvertCustomerToUserDto,
} from "@/schemas/org-customer.schema";

type FormData = {
  email?: string;
  password?: string;
  isActive?: boolean;
  profile?: any;
  phonesToAdd?: Array<{
    phone: string;
    note?: string;
    isPrimary: boolean;
  }>;
};

export default function ConvertCustomerToUserPage({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Собираем все данные для отправки в convertToUser
  const [formData, setFormData] = useState<FormData>({});

  // Загружаем данные клиента
  const { data: customer, isLoading, error } = useQuery({
    queryKey: ["organization-customer", "admin", id],
    queryFn: () => OrganizationCustomerService.getByIdAdmin(id),
  });

  // Мутация конвертации
  const convertMutation = useMutation({
    mutationFn: (dto: ConvertCustomerToUserDto) =>
      OrganizationCustomerService.convertToUser(dto),
    onSuccess: (response) => {
      toast.success("Клиент успешно конвертирован в пользователя");
      queryClient.invalidateQueries({ queryKey: ["organization-customer", "admin", id] });
      router.replace(`/tenant-users/${response?.data?.id}`);
    },
    onError: (error: any) => {
      const errorData = error.response?.data?.message;

      let msg = "Конвертация не удалась";

      if (typeof errorData === 'string') {
        msg = errorData;
      } else if (Array.isArray(errorData)) {
        // Если message это сразу массив
        msg = errorData.join(", ");
      } else if (typeof errorData === 'object' && Array.isArray(errorData?.message)) {
        // ВАШ СЛУЧАЙ: message — это объект, внутри которого есть массив message
        msg = errorData.message.join(", ");
      }

      toast.error(msg);
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Ошибка загрузки клиента: {error.message || "Неизвестная ошибка"}
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Клиент не найден
      </div>
    );
  }
  const handleSave = () => {
    if (!formData.password) {
      toast.error("Пароль обязательны для создания пользователя");
      return;
    }

    // Формируем профиль БЕЗ firstName и lastName
    const profileData = {
      ...formData.profile,
      // Явно удаляем запрещённые поля (на всякий случай)
      firstName: undefined,
      lastName: undefined,
      patronymic: undefined,
      // можно также patronymic: undefined, если бэкенд тоже его не хочет
    };

    const dto: ConvertCustomerToUserDto = {
      customerId: id,
      user: {
        email: formData.email,
        password: formData.password,
        isActive: formData.isActive ?? true,
        profile: profileData,
      },
      phonesToAdd: formData.phonesToAdd || [],
    };

    convertMutation.mutate(dto);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 pb-20">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-background/40 p-4 backdrop-blur-md rounded-3xl border border-border/40">

        {/* Левая часть */}
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <UserPlus className="size-6 text-primary shrink-0" />
            <h1 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
              Конвертация клиента в пользователя
            </h1>
          </div>

          <p className="text-xs text-muted-foreground font-mono mt-1 truncate">
            {customer.firstName} {customer.lastName} · {customer.phone}
          </p>
        </div>

        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Button
            variant="ghost"
            className="rounded-2xl w-full sm:w-auto"
            onClick={() => router.back()}
          >
            <X className="mr-2 size-4" />
            Bekor qilish
          </Button>

          <Button
            className="rounded-2xl shadow-lg shadow-primary/20 w-full sm:w-auto"
            onClick={handleSave}
            disabled={convertMutation.isPending}
          >
            {convertMutation.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            Konvertatsiya qilish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Левая колонка — аккаунт + телефоны */}
        <div className="md:col-span-1 space-y-6">
          <CreateAccountSection
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, ...val }))
            }
            // initialData не передаём → пользователь создаётся новый
          />

          <CreatePhonesSection
            onChange={(phones) =>
              setFormData((prev) => ({ ...prev, phonesToAdd: phones }))
            }
          />
        </div>

        {/* Правая колонка — профиль */}
        <div className="md:col-span-2">
          <CreateProfileSection
            onChange={(profileData) =>
              setFormData((prev) => ({ ...prev, profile: profileData }))
            }
            // Предзаполняем данными из клиента
            initialData={{
              profile: {
                firstName: customer.firstName,
                lastName: customer.lastName,
                patronymic: customer.patronymic || undefined,
                // остальные поля остаются пустыми → пользователь сам заполнит
              },
            }}
          />
        </div>
      </div>

      {/* Подсказка / предупреждение внизу */}
      <div className="text-xs text-muted-foreground/80 italic bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 mt-8">
        <strong>Важно:</strong> После конвертации клиент станет полноценным
        пользователем системы. Email и пароль обязательны. Телефоны можно
        добавить/изменить.
      </div>
    </div>
  );
}