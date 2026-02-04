"use client"

import * as React from "react"
import {
  Boxes,
  Building, Contact, Euro, List, Package, Plus, Settings2, Tag, User, UserStar,
  Cuboid, Layers,
} from "lucide-react"

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
}

export interface SidebarGroup {
  label: string
  items: SidebarItem[]
}


const sidebarGroups = [
  {
    label: "Tashkilot",
    items: [
      {name: "Organizatsiyalar", url: "/organizations", icon: Building},
      {name: "Xodimlar", url: "/organizations/users", icon: Contact},
      {name: "Mijozlar", url: "/organizations/customers", icon: UserStar},
    ],
  },
  {
    label: "Mahsulotlar",
    items: [
      {
        name: "Mahsulotlar", url: "/products", icon: Package, actions: [
          {
            label: "Mahsulot qo'shish",
            url: "/products/create",
            icon: Plus,
          },
        ],
      },
      {
        name: "Mahsolot Variantlari",
        url: "/product-variants",
        icon: Layers,
        actions: [
          {
            label: "Mahsulot Variantlari qo'shish",
            url: "/product-variants/create",
            icon: Plus,
          }
        ]
      },
      {name: "Mahsulot namunasi", url: "/product-instances", icon: Cuboid},
      {name: "Kategoriyalar", url: "/categories", icon: List},
      {name: "Brandlar", url: "/products/brands", icon: Tag},
      {name: "Xarakteristikalar", url: "/attributes", icon: Settings2},
    ],
  },
  {
    label: "Moliyaviy",
    items: [
      {name: "Valyutalar", url: "/currency", icon: Euro},
    ],
  },
  {
    label: "Sozlamalar",
    items: [
      {
        name: "Foydalanuvchilar", url: "/tenant-users", icon: User, actions: [
          {
            label: "Foydalanuvchi qo'shish",
            url: "/tenant-users/create",
            icon: Plus,
          },
        ],
      },
      {name: "Sozlamalar", url: "/settings", icon: Settings2},
    ],
  }
]


export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {sidebarGroups.map((group) => (
          <NavProjects
            key={group.label}
            label={group.label}
            projects={group.items}
          />
        ))}
      </SidebarContent>
      {/*<SidebarContent>*/}
      {/*  <NavMain items={data.navMain} />*/}
      {/*  <NavProjects projects={data.projects} />*/}
      {/*</SidebarContent>*/}
      <SidebarFooter>
        <ModeToggle />
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
