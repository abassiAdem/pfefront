

import React, { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import {
  Layers,
  Home,
  Plus,
  FileText,
  PieChart,
  Users,
  MessageSquare,
  LogOut,
  ChevronDown,
  UserCheck,
  History,
  ClipboardList,
  UserPlus,
  Calendar,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { logoutUser, immediateLogout } from "../../Store/auth2Slice"
import { useSelector } from 'react-redux'
import {selectUnreadNotifications} from '../../Store/notificationSlice'
import { useEffect } from 'react'
export function Sidebar({
  className,
  collapsed = false,
  onToggleCollapse,

}) {
  const notifications = useSelector(selectUnreadNotifications)
  const unreadCount = notifications.length;
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [openCategories, setOpenCategories] = React.useState({
    resources: true,
    management: true,
    team: true,
  })
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
    }))
  }

  const isActive = (path) => location.pathname === path
  const isActiveStartsWith = (path) => location.pathname.startsWith(path)
  const handlecreate=() => {
    navigate("/chef/create")
   }
  return (
    <div
      className={cn(
        "flex h-screen flex-col bg-white transition-all duration-300",
        collapsed ? "w-30" : "w-[22rem]",
        className,
      )}
    >
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

      <div className="flex-1   border-r overflow-auto py-2">
        <nav className="space-y-1 px-2">
          <div className="space-y-1">
            <NavItem href="/chef" icon={Home} label="Tableau de bord" isActive={isActive("/chef")} collapsed={collapsed} />

            <Button
              variant="outline"
              size="sm"
              onClick={handlecreate}
              className={cn(
                "mt-2 w-full gap-2 border-dashed border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700",
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="mb-2 flex justify-center">
                      <FileText className="h-5 w-5 text-gray-500" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>RESSOURCES</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Collapsible open={openCategories.resources} onOpenChange={() => toggleCategory("resources")}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-transparent"
                  >
                    <span>RESSOURCES</span>
                    <ChevronDown
                      className={cn("h-4 w-4 transition-transform", openCategories.resources && "rotate-180")}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1">

                  <Collapsible className="pl-2" defaultOpen>
                    <CollapsibleTrigger asChild>
                      <div
                        className={cn(
                          "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                          isActiveStartsWith("/chef/services")
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-md",
                            isActiveStartsWith("/chef/services")
                              ? "bg-blue-100 text-blue-700"
                              : "text-gray-500 group-hover:text-gray-700",
                          )}
                        >
                          <ClipboardList className="h-4 w-4" />
                        </div>
                        <span className="flex-1">Services</span>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="ml-8 space-y-1 mt-1">
                      <Link
                        to="/chef/services"
                        className={cn(
                          "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive("/chef/services/my")
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                        )}
                      >
                        Mes services
                      </Link>
                      <Link
                        to="/chef/services/team"
                        className={cn(
                          "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive("/chef/services/team")
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                        )}
                      >
                        Services de l'équipe
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>

                  <NavItem
                    href="/chef/historique"
                    icon={History}
                    label="Historique"
                    isActive={isActive("/chef/historique")}
                    collapsed={collapsed}
                  />

                </CollapsibleContent>
              </Collapsible>
            )}
          </div>

          <Separator className="my-3" />
          <div>
            <Collapsible open={openCategories.team} onOpenChange={() => toggleCategory("team")}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-transparent"
                >
                  <span>GESTION D'ÉQUIPE</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", openCategories.team && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
                <NavItem
                  href="/chef/equipe"
                  icon={Users}
                  label="Membres de l'équipe"
                  isActive={isActive("/chef/equipe")}
                  collapsed={collapsed}
                  tooltip="Voir tous les membres"
                />
              </CollapsibleContent>
            </Collapsible>
          </div>

          <Separator className="my-3" />

          <div>
            {collapsed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="mb-2 flex justify-center">
                      <MessageSquare className="h-5 w-5 text-gray-500" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>COMMUNICATION</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Collapsible open={openCategories.management} onOpenChange={() => toggleCategory("management")}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-transparent"
                  >
                    <span>COMMUNICATION</span>
                    <ChevronDown
                      className={cn("h-4 w-4 transition-transform", openCategories.management && "rotate-180")}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1">
                  <NavItem
                    href="/chef/messages"
                    icon={MessageSquare}
                    label="Messages"
                    isActive={isActive("/chef/messages")}
                    collapsed={collapsed}
                    badge={unreadCount}
                    tooltip="Communication avec l'équipe"
                  />
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
            "flex w-full bg-white border-blue-50 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            "text-blue-600 hover:bg-blue-50 hover:text-blue-700",
            collapsed && "justify-center px-2",
          )}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md text-blue-600">
            <LogOut className="h-4 w-4" />
          </div>
          {!collapsed && <span>{isLoggingOut ? "Déconnexion..." : "Se déconnecter"}</span>}
        </button>
      </div>
    </div>
  )
}


function NavItem({ href, icon: Icon, label, isActive, collapsed, badge, tooltip }) {
  const content = (
    <Link
      to={href}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
        collapsed && "justify-center px-2",
      )}
    >
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-md",
          isActive ? "bg-blue-100 text-blue-700" : "text-gray-500 group-hover:text-gray-700",
        )}
      >
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
  )

  if (collapsed && tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right">
            <p>{tooltip || label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return content
}



