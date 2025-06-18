import { SidebarProvider} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function LayoutDashboard({ children }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 ml-64">{children}</main>
      </div>
    </SidebarProvider>
  )
}
