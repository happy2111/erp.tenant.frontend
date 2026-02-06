"use client"

import { ReactNode} from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
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

interface DashboardLayoutProps {
  children: ReactNode
}

const DashboardLayoutComponent = ({ children }: DashboardLayoutProps) => {
  const router = useRouter()

  const breadcrumbs = useBreadcrumbs()


  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex h-screen w-screen bg-sidebar">
          <AppSidebar />
          <SidebarInset className="sm:border sm:rounded-2xl sm:m-4 sm:overflow-y-scroll">
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1 scale-125" />
                <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />

                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs.map((item, index) => (
                      <BreadcrumbItem key={item.href} className={cn("hidden sm:block" ,index === 0 ? "hidden md:block" : "") }>
                        {index !== breadcrumbs.length - 1 ? (
                          <>
                            <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink> {"/"}
                          </>
                        ) : (
                          <BreadcrumbPage className={"max-w-[200px] truncate"}>{item.label}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>

              </div>
            </header>

            <div className="flex-1 flex flex-col bg-background">

                <main className="flex-1 overflow-auto p-4">
                  {children}
                </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}

export default DashboardLayoutComponent
