

import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Calendar,
  CheckSquare,
  ClipboardList,
  Clock,
  Inbox,
  Layers,
  LogOut,
  GanttChart,
  Home,
  ChevronDown,MessageSquare,Plus 
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../Store/auth2Slice";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux'
import {selectUnreadNotifications} from '../../Store/notificationSlice'
import { useEffect } from 'react'
export  default function ResponsableSidebar({ className, collapsed = false, onToggleCollapse }) {

  const location = useLocation();
  const notifications = useSelector(selectUnreadNotifications)
  const unreadCount = notifications.length;
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [openCategories, setOpenCategories] = useState({
    dashboard: true,
    demandes: true,
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
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

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={cn(
        "flex h-screen flex-col dark:bg-gray-950 dark:border-gray-800 transition-all duration-300",
        collapsed ? "w-30" : "w-[22rem]",
        className
      )}
    >
      <div className="flex h-16 bg-[#003b7e] items-center border-b dark:border-gray-800 px-4">
        <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center  ">
           <img src="/biat2.png" alt="Logo" className="h-8 w-8" />
          </div>
          {!collapsed && <span className="text-lg font-semibold text-white  dark:text-blue-400">ResourceHub</span>}
        </div>
        <Button size="sm" className="ml-auto bg-transparent hover:bg-transparent text-white" onClick={onToggleCollapse}>
          {collapsed ? "→" : "←"}
        </Button>
      </div>

      <div className="flex-1 border-r   bg-white  overflow-auto py-2">
        <nav className="space-y-1 px-2">
          <NavItem to="/responsable" icon={Home} label="Accueil" isActive={isActive("/responsable")} collapsed={collapsed} />
       
          <Separator className="my-3" />
          <CollapsibleSection title="TABLEAU DE BORD" isOpen={openCategories.dashboard} toggle={() => toggleCategory("dashboard")} collapsed={collapsed}>
            <NavItem to="/responsable/dashboard" icon={BarChart3} label="Dashboard" isActive={isActive("/responsable/dashboard")} collapsed={collapsed} />
            <NavItem to="/responsable/gantt" icon={GanttChart} label="Diagramme de Gantt" isActive={isActive("/responsable/gantt")} collapsed={collapsed} />
          </CollapsibleSection>
          <Separator className="my-3" />
          <CollapsibleSection title="DEMANDES" isOpen={openCategories.demandes} toggle={() => toggleCategory("demandes")} collapsed={collapsed}>
          <NavItem to="/responsable/create" icon={Plus} label="Nouvelle demande" isActive={isActive("/responsable/create")} collapsed={collapsed}/>
            <NavItem to="/responsable/service/en-cours" icon={Clock} label="Demandes en cours" isActive={isActive("/responsable/service/en-cours")} collapsed={collapsed} />
            <NavItem to="/responsable/service/traitees" icon={CheckSquare} label="Demandes traitées" isActive={isActive("/responsable/service/traitees")} collapsed={collapsed} />
            <NavItem to="/responsable/messages" icon={MessageSquare} label="Messages" isActive={isActive("/responsable/messages")} collapsed={collapsed} badge={unreadCount} />
          </CollapsibleSection>
        </nav>
      </div>

      <div className="mt-auto border-t dark:border-gray-800 p-4">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            "text-blue-600 hover:bg-blue-50 hover:text-blue-700",
            collapsed && "justify-center px-2",
            isLoggingOut && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md text-blue-600">
            <LogOut className="h-4 w-4" />
          </div>
          {!collapsed && <span>{isLoggingOut ? "Déconnexion..." : "Déconnexion"}</span>}
        </button>
      </div>
    </div>
  );
}

function NavItem({ to, icon: Icon, label, isActive, collapsed, badge }) {
  return (
    <NavLink to={to} className={cn("group flex items-center gap-3 px-3 py-2", isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900")}
    >
      <Icon className="h-4 w-4" />
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
    </NavLink>
  );
}

function CollapsibleSection({ title, isOpen, toggle, collapsed, children }) {
  return collapsed ? null : (
    <Collapsible open={isOpen} onOpenChange={toggle}>
      <CollapsibleTrigger asChild>
        <Button  className="w-full  bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700 justify-between px-2 py-1.5 text-xs font-medium">
          <span>{title}</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1">{children}</CollapsibleContent>
    </Collapsible>
  );
}
/*    */