import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import * as React from "react"
import { cn } from "@/lib/utils"

export function SidebarTrigger({ className }) {
    const { toggleSidebar } = useSidebar()
  
    return (
      <Button variant="ghost" size="sm" className={cn("h-8 w-8 p-0", className)} onClick={toggleSidebar}>
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    )
  }
  
  