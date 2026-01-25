"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Building, Loader2, Check } from "lucide-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useOrganizationStore } from "@/store/organizations.store"
import { useTenantAuthStore } from "@/store/tenant-auth.store"
import { cn } from "@/lib/utils"
import {Organization} from "@/schemas/organization.schema";

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const router = useRouter()

  // Данные из стора организаций
  const { organizations, isLoading: isListLoading, fetchOrganizations } = useOrganizationStore()

  // Данные и методы из стора авторизации
  const {
    currentOrganizationId,
    selectOrganization,
    user
  } = useTenantAuthStore()

  const [isSwitching, setIsSwitching] = React.useState(false)

  useEffect(() => {
    fetchOrganizations()
  }, [fetchOrganizations])

  // Находим текущую активную организацию в списке
  const activeOrg = organizations.find(org => org.id === currentOrganizationId)

  const handleSwitch = async (org: Organization) => {
    const orgUserId = org?.org_users?.[0]?.id;

    if (!orgUserId) {
      toast.error("Foydalanuvchi ma'lumotlari topilmadi");
      return;
    }

    // 2. Если мы уже в этой организации, ничего не делаем
    // (Здесь нужно сравнивать с текущим активным orgUserId из AuthStore)
    // Но для простоты можно сравнивать org.id с currentOrganizationId
    if (org.id === currentOrganizationId) return;

    setIsSwitching(true);
    try {
      // 3. Вызываем свитч, передавая именно orgUserId
      const success = await selectOrganization(orgUserId);

      if (success) {
        toast.success(`${org.name}ga o'tildi`);
        // Делаем жесткую перезагрузку или router.refresh,
        // чтобы все компоненты перекачали данные с новым apiKey
        window.location.reload();
      }
    } catch (error) {
      toast.error("Almashtirishda xatolik yuz berdi");
    } finally {
      setIsSwitching(false);
    }
  };

  // Состояние загрузки
  if (isListLoading && organizations.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted animate-pulse">
              <Building className="size-4 text-muted-foreground" />
            </div>
            <div className="grid flex-1 gap-1">
              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
              <div className="h-2 w-16 bg-muted animate-pulse rounded" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                {isSwitching ? <Loader2 className="size-4 animate-spin" /> : <Building className="size-4" />}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeOrg?.name || "Tashkilot tanlanmagan"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {/*role && position*/}
                  {activeOrg?.org_users?.[0]?.role || "EMPLOYEE"} * {activeOrg?.org_users?.[0]?.position || "Xodim"}



                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Tashkilotlarim
            </DropdownMenuLabel>
            {organizations.map((org) => {
              const isSelected = org.id === currentOrganizationId;
              const userRelation = org?.org_users?.[0];

              return (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => handleSwitch(org)} // Передаем весь объект орг
                  className="gap-2 p-2 cursor-pointer"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <Building className="size-4" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className={cn("font-medium", isSelected && "text-primary")}>
                      {org.name}
                    </span>
                                <span className="text-[10px] text-muted-foreground uppercase">
                      {userRelation?.role}
                    </span>
                  </div>
                  {isSelected && <Check className="size-4 text-primary" />}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2 cursor-pointer"
              onClick={() => router.push("/dashboard/organizations/new")}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Yangi tashkilot</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}