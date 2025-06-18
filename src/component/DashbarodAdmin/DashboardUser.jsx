import { AppSidebar } from "./AppSidebar"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { UserTable } from "./UserTable"
import { Outlet } from "react-router-dom"

export default function DashboardUser() {

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 ml-4">
          <Outlet/>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
