"use client"

import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  type LucideIcon, Plus,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link";
export function NavProjects({ projects }: { projects: any[] }) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="px-3 mb-2 text-[10px] uppercase tracking-[0.15em] opacity-60">
        Tashkilotlar
      </SidebarGroupLabel>
      <SidebarMenu className="gap-2">
        {projects.map((item) => (
          <SidebarMenuItem key={item.name} className="relative group/item">
            <SidebarMenuButton
              asChild
              className="h-12 px-3 rounded-xl transition-all duration-300 hover:bg-sidebar-accent hover:translate-x-1"
            >
              <Link href={item.url} className="flex items-center">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center mr-2 group-hover/item:bg-primary/20 transition-colors">
                  <item.icon className="size-4 text-primary" />
                </div>
                <span className="font-semibold text-[14px]">{item.name}</span>
              </Link>
            </SidebarMenuButton>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction
                  showOnHover
                  className="top-1.5 right-2 size-8 rounded-lg hover:bg-background/80 backdrop-blur-sm"
                >
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              {/* DropdownContent тоже должен быть стеклянным */}
              <DropdownMenuContent
                className="w-56 p-2 rounded-xl bg-popover/80 backdrop-blur-xl border-border/50 shadow-xl"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer focus:bg-primary/10">
                  <Link href='/organizations/new' className="flex items-center gap-3 w-full">
                    <div className="size-6 rounded-md bg-primary/20 flex items-center justify-center">
                      <Plus className="size-3 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Yangi tashkilot</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}