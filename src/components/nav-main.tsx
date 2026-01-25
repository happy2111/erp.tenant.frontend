"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import Link from "next/link";


export function NavMain({ items }: { items: any[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-3 mb-2 text-[10px] uppercase tracking-[0.15em] opacity-60">
        Platform
      </SidebarGroupLabel>
      <SidebarMenu className="gap-1"> {/* Добавлен зазор между пунктами */}
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={item.title}
                  className="h-11 px-3 transition-all duration-300 hover:bg-sidebar-accent/50 data-[state=open]:bg-sidebar-accent/30"
                >
                  {item.icon && (
                    <item.icon className="size-5 transition-transform duration-300 group-hover/collapsible:scale-110" />
                  )}
                  <span className="font-medium ml-1 text-[14px]">{item.title}</span>
                  <ChevronRight className="ml-auto size-4 opacity-50 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent className="animate-in fade-in slide-in-from-top-1 duration-300">
                <SidebarMenuSub className="ml-4 mt-1 border-l border-sidebar-border/30 px-2 gap-1">
                  {item.items?.map((subItem: any) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild className="h-9 px-4 rounded-lg transition-colors hover:text-primary">
                        <Link href={subItem.url}>
                          <span className="text-[13px]">{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}