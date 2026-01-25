"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  User,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import { useTenantAuthStore } from "@/store/tenant-auth.store" // Проверь путь к стору
import { useRouter } from "next/navigation"

export function NavUser() {
  const { isMobile } = useSidebar()
  const router = useRouter()

  // Берем данные и флаги из нового стора
  const { user, logout, isLoading, isInitialized } = useTenantAuthStore()

  // 1. Находим основной номер телефона из массива
  const primaryPhone = user?.phoneNumbers?.find((p) => p.isPrimary) || user?.phoneNumbers?.[0]

  const handleLogout = async () => {
    try {
      await logout()
      router.replace("/login") // replace лучше push для выхода
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  // 2. Отображаем скелетон/заглушку, пока идет инициализация
  if (!isInitialized || isLoading || !user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled className="opacity-50">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg">
                <User className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight animate-pulse">
              <div className="h-4 w-24 bg-muted rounded mb-1" />
              <div className="h-3 w-32 bg-muted rounded" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // 3. Формируем инициалы (Platform Owner -> PO)
  const getInitials = () => {
    const first = user.firstName?.[0] || ""
    const last = user.lastName?.[0] || ""
    return (first + last).toUpperCase() || "U"
  }

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {/* Если на бэкенде появится поле avatar/image, подставь его сюда */}
                <AvatarImage src={(user as any).avatar} alt={fullName} />
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{fullName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {primaryPhone?.phone || "Telefon kiritilmagan"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{fullName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.role} • {primaryPhone?.phone}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            {/*<DropdownMenuSeparator />*/}



            {/*<DropdownMenuGroup>*/}
            {/*  <DropdownMenuItem>*/}
            {/*    <BadgeCheck className="mr-2 h-4 w-4" />*/}
            {/*    <span>Profil sozlamalari</span>*/}
            {/*  </DropdownMenuItem>*/}
            {/*  <DropdownMenuItem>*/}
            {/*    <Bell className="mr-2 h-4 w-4" />*/}
            {/*    <span>Bildirishnomalar</span>*/}
            {/*  </DropdownMenuItem>*/}
            {/*</DropdownMenuGroup>*/}

            {/*<DropdownMenuSeparator />*/}

            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Chiqish</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}