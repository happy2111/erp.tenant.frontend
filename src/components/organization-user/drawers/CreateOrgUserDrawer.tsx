"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TenantUserService } from "@/services/tenant-user.service";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerDescription
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, UserPlus, Loader2, Check } from "lucide-react";
import { useDebounce } from "use-debounce";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (userId: string, email: string |null| undefined, firstName: string | null | undefined, lastName: string | null |undefined) => void;
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
      <DrawerContent className="max-h-[85vh] bg-background/80 backdrop-blur-2xl border-t border-border/50">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="space-y-4">
            <div className="space-y-1">
              <DrawerTitle className="text-2xl font-black tracking-tighter italic uppercase">
                Foydalanuvchi qidirish
              </DrawerTitle>
              <DrawerDescription className="text-xs uppercase tracking-widest opacity-60 font-medium">
                Tizim foydalanuvchilarini filtrlash
              </DrawerDescription>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Email, telefon yoki foydalanuvchi nomi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-12" // Использует твой обновленный стиль Input
              />
            </div>
          </DrawerHeader>

          <ScrollArea className="px-4 h-[400px]">
            <div className="space-y-2 pb-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                  <Loader2 className="animate-spin size-8 text-primary mb-3" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Qidirilmoqda...</span>
                </div>
              ) : data?.items?.length ? (
                data.items.map((user) => (
                  <div
                    key={user.id}
                    className={cn(
                      "group flex items-center justify-between p-4 rounded-2xl transition-all duration-300",
                      "bg-card/40 backdrop-blur-md border border-border/40 hover:border-primary/40 hover:bg-primary/5 cursor-pointer shadow-sm"
                    )}
                    onClick={() => onSelect(user.id, user.email, user.profile?.firstName, user.profile?.lastName)}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="size-11 border-2 border-background shadow-sm group-hover:scale-105 transition-transform">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {user.profile?.firstName?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-[15px] font-black tracking-tight group-hover:text-primary transition-colors">
                          {user.profile?.firstName} {user.profile?.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium opacity-70 italic">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-primary/10 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <UserPlus className="size-4 text-primary" />
                    </div>
                  </div>
                ))
              ) : debouncedSearch.length > 2 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in zoom-in duration-500">
                  <div className="size-20 bg-primary/5 rounded-[2rem] flex items-center justify-center mb-6 ring-1 ring-primary/10 border border-primary/5 shadow-inner">
                    <Search className="size-10 text-primary/20" />
                  </div>
                  <h3 className="text-lg font-black tracking-tighter mb-2 italic">TOPILMADI</h3>
                  <p className="text-xs text-muted-foreground max-w-[220px] mb-8 font-medium leading-relaxed opacity-70">
                    Bunday ma&apos;lumotga ega foydalanuvchi tizimda mavjud emas.
                  </p>

                  <Button
                    onClick={() => router.push("/tenant-users/create")}
                    className="rounded-xl shadow-xl shadow-primary/20 gap-3 h-12 px-8 font-bold uppercase text-[11px] tracking-[0.15em]"
                  >
                    <UserPlus className="size-4" />
                    Yangi yaratish
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-30 italic">
                  <p className="text-xs font-medium tracking-widest uppercase">
                    Qidiruvni boshlang...
                  </p>
                  <p className="text-[10px] mt-2">(kamida 3 ta belgi)</p>
                </div>
              )}
            </div>
          </ScrollArea>

          <DrawerFooter className="border-t border-border/40 pt-4 pb-8">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 rounded-xl border-border/50 bg-background/20 backdrop-blur-md hover:bg-background/40 font-bold uppercase text-[10px] tracking-widest transition-all"
            >
              Bekor qilish
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}