"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Building } from "lucide-react"
import { useEffect, useState } from "react"

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
import { useOrganizationStore } from "@/store/organization.store"
import { useRouter } from "next/navigation"

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const router = useRouter()

  const {
    organizations,
    currentOrganization,
    loading,
    fetchUserOrganizations,
    setCurrentOrganization
  } = useOrganizationStore()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchUserOrganizations()
  }, [fetchUserOrganizations])

  // Handle organization selection
  const handleSelectOrganization = (org: typeof organizations[0]) => {
    setCurrentOrganization(org)
    // You might want to store the selected org ID in localStorage or context
    localStorage.setItem("selected_organization_id", org.id)

    // Optional: Refresh the page or update context
    // router.refresh()
  }

  // Handle create new organization
  const handleCreateNew = () => {
    router.push("/organizations/new")
  }

  // Show loading state
  if (loading && organizations.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <Building className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Yuklanmoqda...</span>
              <span className="truncate text-xs">Tashkilotlar</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const activeOrg = currentOrganization || organizations[0]

  if (!mounted || organizations.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            onClick={handleCreateNew}
            className="cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <Plus className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Tashkilot qo'shing</span>
              <span className="truncate text-xs">Boshlash uchun</span>
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
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Building className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeOrg?.name || "Tashkilot"}</span>
                <span className="truncate text-xs">
                  {activeOrg?.org_users?.[0]?.role === "OWNER" ? "Egasi" :
                    activeOrg?.org_users?.[0]?.role === "ADMIN" ? "Admin" :
                      activeOrg?.org_users?.[0]?.role === "MANAGER" ? "Menejer" : "Xodim"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Mening Tashkilotlarim ({organizations.length})
            </DropdownMenuLabel>

            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleSelectOrganization(org)}
                className="gap-2 p-2 cursor-pointer"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <Building className="size-3.5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{org.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {org.org_users?.[0]?.role === "OWNER" ? "Egasi" :
                      org.org_users?.[0]?.role === "ADMIN" ? "Admin" :
                        org.org_users?.[0]?.role === "MANAGER" ? "Menejer" : "Xodim"}
                  </div>
                </div>
                {activeOrg?.id === org.id && (
                  <div className="size-2 rounded-full bg-primary" />
                )}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="gap-2 p-2 cursor-pointer"
              onClick={handleCreateNew}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Yangi tashkilot
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}