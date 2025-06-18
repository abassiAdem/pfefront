
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Layers, Home, Plus, FileText, PieChart, Users, MessageSquare, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { immediateLogout, logoutUser } from '../../Store/auth2Slice'
import { useSelector } from 'react-redux'
import {selectUnreadNotifications} from '../../Store/notificationSlice'
import { useEffect } from 'react'
export function Sidebar({ className, collapsed = false, onToggleCollapse }) {
  const location = useLocation();
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const notifications = useSelector(selectUnreadNotifications)
  const unreadCount = notifications.length;
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [openCategories, setOpenCategories] = React.useState({
    resources: true,
    management: true,
  });
  
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
  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };
 const handlecreate=() => {
  navigate("/employe/create")
 }
  const isActive = (path) => location.pathname === path;

  return (
    <div className={cn("flex h-screen flex-col  bg-white transition-all duration-300", collapsed ? "w-30" : "w-[22rem]", className)}>
      <div className="flex h-16 bg-[#003b7e] items-center border-b px-4">
        <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center  ">
           <img src="/biat2.png" alt="Logo" className="h-8 w-8" />
          </div>
          {!collapsed && <span className="text-lg font-semibold text-white">ResourceHub</span>}
        </div>
        <Button 
          
          size="sm" 
          className="ml-auto bg-transparent hover:bg-transparent text-white"
          onClick={onToggleCollapse}
        >
          {collapsed ? "→" : "←"}
        </Button>
      </div>

      <div className="flex-1 border-r overflow-auto py-2">
        <nav className="space-y-1 px-2">
          <div className="space-y-1">
            <NavItem href="/employe" icon={Home} label="Tableau de bord" isActive={isActive("/employe")} collapsed={collapsed} />

            <Button
              variant="outline"
              size="sm"
              onClick={handlecreate}
              className={cn(
                "mt-2 w-full h-[35px] gap-2 border-dashed border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700",
                collapsed ? "justify-center px-2" : "justify-start",
              )}
            >
              <Plus className="h-4 w-4" />
              {!collapsed && <span>Nouvelle demande</span>}
            </Button>
          </div>
          <Separator className="my-3" />
          <div>
            {collapsed ? (
              <div className="mb-2 flex justify-center">
                <FileText className="h-5 w-5 text-gray-500" />
              </div>
            ) : (
              <Collapsible open={openCategories.resources} onOpenChange={() => toggleCategory("resources")}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-transparent">
                    <span>RESOURCES</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", openCategories.resources && "rotate-180")} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1">
                  <NavItem href="/employe" icon={Layers} label="Services" isActive={isActive("/employe")} collapsed={collapsed} />
                  <NavItem href="/employe/historique" icon={FileText} label="Historique des demandes" isActive={isActive("/employe/historique")} collapsed={collapsed}  />
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
          <Separator className="my-3" />
          <div>
            {collapsed ? (
              <div className="mb-2 flex justify-center">
                <Users className="h-5 w-5 text-gray-500" />
              </div>
            ) : (
              <Collapsible open={openCategories.management} onOpenChange={() => toggleCategory("management")}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-transparent">
                    <span>GESTION</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", openCategories.management && "rotate-180")} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1">
             
                  <NavItem href="/employe/messages" icon={MessageSquare} label="Messages" isActive={isActive("/employe/messages")} collapsed={collapsed}badge={unreadCount}/>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={cn(
        "flex w-full bg-white border-blue-50 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium  transition-colors",
        "text-blue-600 hover:bg-blue-50 hover:text-light-700",
        collapsed && "justify-center px-2",
      )}
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-md text-blue-600">
        <LogOut className="h-4 w-4" />
      </div>
      {!collapsed && <span>{isLoggingOut ? "Déconnexion..." : "Déconnecter"}</span>}
    </button>
  </div>
    </div>
  );
}

function NavItem({ href, icon: Icon, label, isActive, collapsed, badge }) {
  return (
    <Link to={href} className={cn("group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors", isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-blue-100 hover:text-blue-700", collapsed && "justify-center px-2")}
    >
      <div className={cn("flex h-6 w-6 items-center justify-center rounded-md", isActive ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-blue-100 hover:text-blue-700")}>
        <Icon className="h-4 w-4" />
      </div>
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge && (
            <Badge variant="outline" className="ml-auto bg-blue-50 text-blue-700">
              {badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  );
}