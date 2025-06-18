import React from 'react'
import { useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import {Navbar} from '../../component/InterfaceUser/NavbarUser'

import ResponsableSidebar from '../../component/responsable/ResponsableSidebar'
function Responsable() {
    const { user } = useSelector((state) => state.auth);
    const toggleSidebar = () => {
      setSidebarCollapsed((prev) => !prev);
    };
      const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <ResponsableSidebar collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} user={user}/>
      <div className="flex flex-col flex-1">
        <Navbar user={user} />
        
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Responsable
