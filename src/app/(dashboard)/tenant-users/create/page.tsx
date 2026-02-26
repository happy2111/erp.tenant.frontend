"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TenantUserService } from "@/services/tenant-user.service";
import { useState } from "react";
import {
  CreateAccountSection
} from "@/components/tenant-user/sections/CreateAccountSection";
import {
  CreateProfileSection
} from "@/components/tenant-user/sections/CreateProfileSection";
import {
  CreatePhonesSection
} from "@/components/tenant-user/sections/CreatePhonesSection";
import ProtectedRoute from "@/components/auth/protected-route";
import {CreateTenantUserDto, Phone} from "@/schemas/tenant-user.schema";


export default function TenantUserCreatePage() {
  const router = useRouter();

  const [account, setAccount] = useState({});
  const [profile, setProfile] = useState({});
  const [phones, setPhones] = useState<Phone[]>([]);

  const mutation = useMutation({
    mutationFn: TenantUserService.create,
    onSuccess: (user) => {
      console.log(user);
      router.push(`/tenant-users/${user.data.id}`)
    },
  });

  const handleSubmit = () => {
    mutation.mutate({
      ...account,
      profile,
      phone_numbers: phones,
    } as unknown as CreateTenantUserDto);
    // TODO типизируй !!!
  };

  return (
    <ProtectedRoute>
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Создание пользователя</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            Создать
          </Button>
        </div>
      </div>

      <Separator />

      <CreatePhonesSection onChange={setPhones} />
      <CreateAccountSection onChange={setAccount} />
      <CreateProfileSection onChange={setProfile} />
    </div>
    </ProtectedRoute>
  );
}
