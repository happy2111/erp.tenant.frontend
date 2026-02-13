"use client"

import { ReactNode} from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import ProtectedRoute from "@/components/auth/protected-route";
import {
  CalendarCheck,
  LayoutTemplate,
} from "lucide-react";
import MineSidebarInsets from "@/components/MineSidebarInsets";
import * as React from "react";

interface DashboardLayoutProps {
  children: ReactNode
}


const sidebarGroups = [
  {
    label: "Sozlamalar",
    items: [
      {name: "Asosiy", url: "/settings", icon: LayoutTemplate},
      {name: "Installments", url: "/settings/installments", icon: CalendarCheck},
    ],
  },
]

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
