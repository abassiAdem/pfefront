import { Link, useLocation } from "react-router-dom"
import { Settings,Mail, Users, FileText, Menu, LayoutDashboard, LogOut } from "lucide-react"
import { useDispatch } from "react-redux";
import { logoutUser } from "../../Store/auth2Slice";
import { useNavigate } from "react-router-dom";
import { immediateLogout } from "../../Store/auth2Slice";
import { useState } from "react";
import { Flame } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      await dispatch(logoutUser()).unwrap();
      
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);

      dispatch(immediateLogout());
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };
  const menuItems = [
    {
      title: "Tableau de bord",
      href: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Gestion des utilisateurs",
      href: "/dashboard/users",
      icon: Users,
      isActive: pathname === "/dashboard/users",
    },
    {
      title: "Types de demandes",
      href: "/dashboard/types",
      icon: FileText,
      isActive: pathname === "/dashboard/requests",
    },

    {
      title: "Email Configuration",
      href: "/dashboard/email-config",
      icon: Mail,
      isActive: pathname === "/dashboard/email-config",
    },
    {
      title: "Déconnexion",
      href: "#",
      icon: LogOut,
      onClick: handleLogout,
    },
  ]

  return (
    <Sidebar className="fixed left-0 top-0 h-screen w-64 border-r border-gray-200">
      <SidebarHeader className="bg-[#1A2233] border-b border-gray-700">
          <div className="flex my-3 items-center">
           <img  src="/biat2.png" alt="Logo" className="h-8 w-8 mr-2" />
            <h2 className="text-xl text-white font-bold">ResourceHub</h2>
          </div>
      </SidebarHeader>
      <SidebarContent className="bg-[#1A2233] h-full">
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
              {item.onClick ? (
                <SidebarMenuButton
                  onClick={item.onClick}
                  className="w-full px-4 py-2.5 text-white transition-colors duration-150 hover:bg-[#2563EB] hover:text-white"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton
                  asChild
                  className={`w-full px-4 py-2.5 text-white transition-colors duration-150 hover:bg-[#2563EB] hover:text-white
                    ${item.isActive ? "bg-[#2563EB] text-white" : ""}`}
                >
                  <Link to={item.href} className="flex items-center gap-3 text-white">
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
