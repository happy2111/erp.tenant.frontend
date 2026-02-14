"use client"

import { ReactNode} from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarInset,
  SidebarProvider, SidebarRail,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { Separator } from "@radix-ui/react-separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs"
import ProtectedRoute from "@/components/auth/protected-route";
import {cn} from "@/lib/utils";
import * as React from "react";
import {
  ArrowLeftRight,
  Building,
  CalendarCheck, ChartLine, Cog, Contact,
  CreditCard, Cuboid, Euro, Landmark, Layers,
  LayoutTemplate, List,
  Package,
  Plus, Settings2,
  ShoppingCart, Tag, User, UserStar
} from "lucide-react"
import MineSidebarInsets from "@/components/MineSidebarInsets"

interface DashboardLayoutProps {
  children: ReactNode
}

const sidebarGroups = [
  {
    label: "Savdo va xarid",
    items: [
      {name: "POS", url: "/pos", icon: LayoutTemplate},
      {
        name: "Savdo",
        url: "/sales",
        icon: ShoppingCart,
      },
      {
        name: "Xarid",
        url: "/purchases",
        icon: CreditCard,
        actions: [
          { label: "Xarid qo'shish", url: "/purchases/create", icon: Plus },
        ],
      },
      {
        name: "Bo'lib to'lashlar",
        url: "/installments",
        icon: CalendarCheck,
        actions: [
          { label: "Installment qo'shish", url: "/installments/create", icon: Plus },
        ],
      },
    ],
  },
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
      {name: "Mahsulot namunasi", url: "/product-instances", icon: Cuboid,
        actions: [
          {
            label: "Mahsulot namunasi qo'shish",
            url: "/product-instances/create",
            icon: Plus,
          },
        ],
      },
      {name: "Kategoriyalar", url: "/categories", icon: List},
      {name: "Brandlar", url: "/products/brands", icon: Tag},
      {name: "Xarakteristikalar", url: "/attributes", icon: Settings2},
    ],
  },
  {
    label: "Moliyaviy",
    items: [
      {name: "Kassalar", url: "/kassas", icon: Landmark},
      {name: "kassa transferlari", url: "/kassa-transfers", icon: ArrowLeftRight},
      {name: "Valyutalar", url: "/currency", icon: Euro},
      {name: "valyuta kursi", url: "/currency-rates", icon: ChartLine},
    ],
  },
  {
    label: "Sozlamalar",
    items: [
      {
        name: "Foydalanuvchilar", url: "/tenant-users", icon: User,
        actions: [
          {
            label: "Foydalanuvchi qo'shish",
            url: "/tenant-users/create",
            icon: Plus,
          },
        ],
      },
      {name: "Sozlamalar", url: "/settings", icon: Cog},
    ],
  }
]


const DashboardLayoutComponent = ({ children }: DashboardLayoutProps) => {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex h-screen w-screen bg-sidebar">
          <AppSidebar groups={sidebarGroups}/>
          <MineSidebarInsets>
            {children}
          </MineSidebarInsets>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}

export default DashboardLayoutComponent
