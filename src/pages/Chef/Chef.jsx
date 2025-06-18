import React, { useEffect, useState,useRef, use} from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, Outlet } from "react-router-dom";
import { Sidebar } from "./SidebarChef";
import { Navbar } from "../../component/InterfaceUser/NavbarUser";
import { connectWebSocket, disconnectWebSocket } from "../../Services/NotificationService";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import {
  useApproveModificationMutation,
  useRejectRequestMutation,
  useMarkNotificationAsReadMutation,

} from "../../Store/notificationQuerySlice";
import { NotificationType } from "../../Store/api";
import { syncNotifications, markAsRead } from "../../Store/notificationSlice";
import { createSelector } from '@reduxjs/toolkit';
import {useNotifications} from "../../Services/useNotifications";
import { useMemo } from "react";

export default function Chef() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };


  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />
      <div className="flex flex-col flex-1">
        <Navbar user={user}  />
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


