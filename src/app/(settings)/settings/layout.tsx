"use client"

import { ReactNode} from "react"
import {AppSidebar, SidebarGroup} from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import ProtectedRoute from "@/components/auth/protected-route";
import MineSidebarInsets from "@/components/MineSidebarInsets";
import * as React from "react";

interface DashboardLayoutProps {
  children: ReactNode
}

import {Home, LayoutTemplate, CalendarCheck, ArrowBigLeft} from "lucide-react";

const sidebarGroups: SidebarGroup[] = [
  {
    label: "Asosiy", // Группа общего меню
    items: [
      {
        name: "Bosh Menu",
        url: '/pos',
        icon: ArrowBigLeft,
      },
    ],
  },
  {
    label: "Sozlamalar",
    items: [
      {
        name: "Asosiy sozlamalar",
        url: '/settings',
        icon: Home,
      },
      {
        name: "Rassrochka",
        url: '/settings/installments',
        icon: CalendarCheck,
      },
    ],
  },
];

const SettingsLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex h-screen w-screen bg-sidebar">
          <AppSidebar groups={sidebarGroups} />
          <MineSidebarInsets>
            {children}
          </MineSidebarInsets>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}

export default SettingsLayout
