"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { TenantUserService } from "@/services/tenant-user.service";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import {CreateAccountSection} from "@/components/tenant-user/sections/CreateAccountSection";
import {CreateProfileSection} from "@/components/tenant-user/sections/CreateProfileSection";
import { EditPhonesSection} from "@/components/tenant-user/sections/EditPhonesSecation";
import {
  EditAccountSection
} from "@/components/tenant-user/sections/EditAccountSection";

export default function EditTenantUserPage({id}: { id: string}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Состояние для сбора всех данных
  const [formData, setFormData] = useState<any>({});

  // 1. Загрузка текущих данных
  const { data: user, isLoading } = useQuery({
    queryKey: ["tenant-users", id],
    queryFn: () => TenantUserService.getByIdAdmin(id),
  });

  // 2. Мутация для сохранения
  const updateMutation = useMutation({
    mutationFn: (dto: any) => TenantUserService.update(id, dto),
    onSuccess: () => {
      toast.success("Ma'lumotlar muvaffaqiyatli saqlandi");
      queryClient.invalidateQueries({ queryKey: ["tenant-users", id] });
      router.push(`/tenant-users/${id}`);
    },
    onError: (error: any) => {
      const serverMessage = error.response?.data?.message;

      // Если message — это массив (часто в NestJS при валидации), соединяем в строку
      const finalMessage = Array.isArray(serverMessage)
        ? serverMessage.join(", ")
        : typeof serverMessage === 'object'
          ? "Ma'lumotlar xato yuborildi"
          : serverMessage;

      toast.error(finalMessage || "Saqlashda xatolik yuz berdi");
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 bg-background/40 p-4 backdrop-blur-md rounded-3xl border border-border/40">
        <div>
          <h1 className="text-xl font-black tracking-tight">Tahrirlash</h1>
          <p className="text-xs text-muted-foreground font-mono">{user?.data?.email}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" className="rounded-2xl" onClick={() => router.back()}>
            <X className="mr-2 size-4" /> Bekor qilish
          </Button>
          <Button
            className="rounded-2xl shadow-lg shadow-primary/20"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
            Saqlash
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <EditAccountSection
            initialData={user?.data}
            onChange={(val) => setFormData((prev: any) => ({ ...prev, ...val }))}
          />
          <EditPhonesSection
            initialPhones={user?.data?.phone_numbers}
            onChange={(val: any) => setFormData((prev: any) => ({ ...prev, ...val }))}
          />
        </div>
        <div className="md:col-span-2">
          <CreateProfileSection
            onChange={(val) => setFormData((prev: any) => ({ ...prev, profile: val }))}
            initialData={user?.data}
          />
        </div>
      </div>
    </div>
  );
}