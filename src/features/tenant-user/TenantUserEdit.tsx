
"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TenantUserService } from "@/services/tenant-user.service";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { UserAccountSection } from "./sections/UserAccountSection";
import { UserProfileSection } from "./sections/UserProfileSection";
import { UserPhonesSection } from "./sections/UserPhonesSection";
import {useState} from "react";

export function TenantUserEdit({ userId }: { userId: string }) {
  const router = useRouter();
  const [accountPayload, setAccountPayload] = useState({});
  const [profilePayload, setProfilePayload] = useState({});
  const [phonesPayload, setPhonesPayload] = useState({});

  const { data: response, isLoading } = useQuery({
    queryKey: ["tenant-users", userId],
    queryFn: () => TenantUserService.getByIdAdmin(userId),
  });

  const user = response?.data;

  const mutation = useMutation({
    mutationFn: (dto: any) => TenantUserService.update(userId, dto),
    onSuccess: () => router.push(`/tenant-users/${userId}`),
  });

  if (isLoading || !user) return <div className="p-6">Загрузка...</div>;

  const handleSave = (payload: any) => {
    mutation.mutate(payload);
  };


  const payloadFromSections = {
    ...accountPayload,
    ...profilePayload,
    ...phonesPayload,
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Редактирование пользователя</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Отмена
          </Button>
          <Button onClick={() => handleSave(payloadFromSections)}>
            Сохранить
          </Button>
        </div>
      </div>

      <Separator />


      <UserAccountSection user={user} onChange={setAccountPayload} />
      <UserProfileSection profile={user.profile} onChange={setProfilePayload} />
      <UserPhonesSection phones={user.phone_numbers} onChange={setPhonesPayload} />

    </div>
  );
}
