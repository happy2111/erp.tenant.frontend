import {
  MoreHorizontal,
  Plus,
  type LucideIcon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {SidebarItem} from "@/components/app-sidebar";
import {
  SidebarGroup,
  SidebarGroupLabel, SidebarMenu,
  SidebarMenuAction, SidebarMenuButton, SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import Link from "next/link";

export function NavProjects({
                              label,
                              projects,
                            }: {
  label: string
  projects: SidebarItem[]
}) {
  const { isMobile, setOpenMobile } = useSidebar()


  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="px-3 mb-2 text-[10px] uppercase tracking-[0.15em] opacity-60">
        {label}
      </SidebarGroupLabel>

      <SidebarMenu className="gap-2">
        {projects.map((item) => (
          <SidebarMenuItem key={item.name} className="relative group/item">
            {/* Основной пункт */}
            <SidebarMenuButton
              asChild
              className="h-12 px-3 rounded-xl transition-all hover:bg-sidebar-accent hover:translate-x-1"
            >
              <Link
                href={item.url}
                className="flex items-center"
                onClick={() => {
                  if (isMobile) setOpenMobile(false)
                }}
              >
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center mr-2">
                  <item.icon className="size-4 text-primary" />
                </div>
                <span className="font-semibold text-[14px]">
                  {item.name}
                </span>
              </Link>
            </SidebarMenuButton>


            {/* Actions dropdown */}
            {item.actions?.length && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction
                    showOnHover
                    className="top-1.5 right-2 size-8 rounded-lg hover:bg-background/80"
                  >
                    <MoreHorizontal className="size-4" />
                  </SidebarMenuAction>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  side={isMobile ? "bottom" : "right"}
                  align="start"
                  className="w-56 rounded-xl bg-popover/80 backdrop-blur-xl border-border/50 shadow-xl p-2"
                >
                  {item.actions.map((action) => (
                    <DropdownMenuItem
                      key={action.label}
                      asChild
                      className="h-10 rounded-lg cursor-pointer focus:bg-primary/10"
                    >
                      <Link
                        href={action.url}
                        className="flex items-center gap-3 w-full"
                        onClick={() => {
                          if (isMobile) setOpenMobile(false)
                        }}
                      >
                        {action.icon && (
                          <div className="size-6 rounded-md bg-primary/20 flex items-center justify-center">
                            <action.icon className="size-3 text-primary" />
                          </div>
                        )}
                        <span className="text-sm font-medium">
                          {action.label}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
