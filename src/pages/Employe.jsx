
import React, { useState, useEffect } from "react"
import { useSelector,useDispatch } from "react-redux"
import { useLocation, Outlet } from "react-router-dom"
import {Sidebar} from "../component/InterfaceUser/SidebarUser"
import {Navbar} from "../component/InterfaceUser/NavbarUser"

import {
  useApproveModificationMutation,
  useRejectRequestMutation,
  useMarkNotificationAsReadMutation,
 
} from "../Store/notificationQuerySlice";
import { connectWebSocket, disconnectWebSocket } from '../Services/NotificationService'
import { syncNotifications, markAsRead } from "../Store/notificationSlice";
import {useNotifications} from "../Services/useNotifications";
export  function Employe() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const { user } = useSelector((state) => state.auth);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };
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
  );
}


