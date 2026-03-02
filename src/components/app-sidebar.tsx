"use client"

import * as React from "react"

import {NavProjects} from "@/components/nav-projects"
import {NavUser} from "@/components/nav-user"
import {TeamSwitcher} from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {ModeToggle} from "@/components/mode-toggle";

import {LucideIcon} from "lucide-react"

export interface SidebarAction {
  label: string
  url: string
  icon?: LucideIcon
}

export interface SidebarItem {
  name: string
  url: string
  icon: LucideIcon
  actions?: SidebarAction[]
  isActive?: boolean;
}

export interface SidebarGroup {
  label: string
  items: SidebarItem[]
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  groups: SidebarGroup[]
}



export function AppSidebar({ groups, ...props }: AppSidebarProps) {

  return (
    <Sidebar collapsible="offcanvas" variant="inset" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <NavProjects
            key={group.label}
            label={group.label}
            projects={group.items}
          />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
