import React, { useState, useEffect } from "react"
import { useSelector,useDispatch } from "react-redux"
import { useLocation, Outlet } from "react-router-dom"
import {Sidebar} from "../../component/executor/SidebarExecutor"
import {Navbar} from "../../component/InterfaceUser/NavbarUser"
import { toast } from "sonner"
import { NavbarSuperUser } from "../../component/superuser/NavbarSuperUser"
function Superuser() { 

 
    const { isAuthenticated, user,token,roles, loading, error: authError } = useSelector((state) => state.auth);
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="flex flex-col flex-1">
        <NavbarSuperUser 
          user={user} />
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Superuser