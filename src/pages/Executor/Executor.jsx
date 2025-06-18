import React, { useState, useEffect } from "react"
import { useSelector,useDispatch } from "react-redux"
import { useLocation, Outlet } from "react-router-dom"
import {Sidebar} from "../../component/executor/SidebarExecutor"
import {Navbar} from "../../component/InterfaceUser/NavbarUser"
import { toast } from "sonner"

function Executor() {
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
    const dispatch = useDispatch();
    const toggleSidebar = () => {
        setSidebarCollapsed((prev) => !prev);
      };
    const { isAuthenticated, user,token,roles, loading, error: authError } = useSelector((state) => state.auth);
  return (
    <div className="flex h-screen w-screen overflow-hidden">

      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={toggleSidebar} 
      />
      <div className="flex flex-col flex-1">
        <Navbar 
          user={user} />
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Executor
