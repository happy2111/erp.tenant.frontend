"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TenantUserService } from "@/services/tenant-user.service";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, UserPlus, Loader2 } from "lucide-react";
import { useDebounce } from "use-debounce";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {useRouter} from "next/navigation";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (userId: string, email: string) => void;
}

export function CreateOrgUserDrawer({ open, onOpenChange, onSelect }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);

  const { data, isLoading } = useQuery({
    queryKey: ["tenant-users-search", debouncedSearch],
    queryFn: () => TenantUserService.getAllAdmin({ search: debouncedSearch, limit: 10 }),
    enabled: open && debouncedSearch.length > 2,
  });

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Foydalanuvchi qidirish</DrawerTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Elektron pochta, Telefon yoki foydalanuvchi nomini kiriting.."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-4 h-[400px]">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
          ) : data?.items?.length ? (
            <div className="space-y-2">
              {data.items.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => onSelect(user.id, user.email)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 border">
                      <AvatarFallback>{user.profile?.firstName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">
                        {user.profile?.firstName} {user.profile?.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                  <UserPlus className="size-4 text-primary" />
                </div>
              ))}
            </div>
          ) : debouncedSearch.length > 2 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in zoom-in duration-300">
              <div className="size-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <Search className="size-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-sm font-bold tracking-tight mb-1">
                Foydalanuvchi topilmadi
              </h3>
              <p className="text-[11px] text-muted-foreground max-w-[200px] mb-6">
                Bunday email yoki ism bilan foydalanuvchi tizimda mavjud emas.
              </p>

              <Button
                variant="default"
                className="rounded-xl shadow-lg shadow-primary/20 gap-2 h-9 px-6 text-xs font-bold uppercase tracking-wider"
                onClick={() => router.push("/tenant-users/create")}
              >
                <UserPlus className="size-4" />
                Yangi foydalanuvchi yaratish
              </Button>
            </div>          ) : (
            <div className="text-center py-10 text-muted-foreground text-sm italic">
              Butun ma&apos;lumotlar bazasini qidirish uchun yozishni boshlang (kamida 3 ta belgi)
            </div>
          )}
        </ScrollArea>
        <DrawerFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}