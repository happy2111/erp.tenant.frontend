"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot, Building,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal, User,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {ModeToggle} from "@/components/mode-toggle";

const data = {
  navMain: [
    {
      title: "Maxsulotlar",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Brandlar",
          url: "/products/brands",
        },
        {
          title: "Maxsulotlar",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Organizatsialar",
      url: "/organizations",
      icon: Building,
    },
    {
      name: "Xodimlar",
      url: "/organizations/users",
      icon: User,
    },
    {
      name: "Mijozlar",
      url: "/organizations/customers",
      icon: User,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle/>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
