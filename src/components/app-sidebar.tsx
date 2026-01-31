"use client"

import * as React from "react"
import {
  Building, Contact, Currency, Euro, List, Settings2,
  SquareTerminal, Tag, User, UserStar,
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
    // {
    //   title: "Maxsulotlar",
    //   url: "/products",
    //   icon: SquareTerminal,
    //   isActive: true,
    //   items: [
    //     {
    //       title: "Brandlar",
    //       url: "/products/brands",
    //     },
    //     {
    //       title: "Maxsulotlar",
    //       url: "#",
    //     },
    //   ],
    // },
  ],
  projects: [
    {
      name: "Organizatsialar",
      url: "/organizations",
      icon: Building,
    },
    {
      name: "Foydalanuvchilar",
      url: "/tenant-users",
      icon: User,
    },
    {
      name: "Xodimlar",
      url: "/organizations/users",
      icon: Contact,
    },
    {
      name: "Mijozlar",
      url: "/organizations/customers",
      icon: UserStar,
    },
    {
      name: "Valyutalar",
      url: "/currency",
      icon: Euro,
    },
    {
      name: "Brandlar",
      url: "/products/brands",
      icon: Tag
    },
    {
      name: "Attributlar",
      url: "/attributes",
      icon: Settings2
    }
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
