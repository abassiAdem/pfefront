import { UserAvatar } from "../UserAvatar";
import { NotificationPanel } from "../notification/notificationPanel";
import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  useApproveCancellationMutation,
  useApproveModificationMutation,
  useRejectRequestMutation,
  useDeleteNotificationMutation,useMarkAllAsReadMutation,
} from "../../Store/notificationQuerySlice";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut } from "lucide-react"; 
import { useMemo } from "react";

import { immediateLogout, logoutUser } from '../../Store/auth2Slice'
export function NavbarSuperUser({ user }) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { isAuthenticated, roles } = useSelector((state) => state.auth);
 
  const navigate = useNavigate();
  const dispatch = useDispatch()
    const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const getUserRole = () => {
    if (!roles) return "Utilisateur";

    if (roles.realmRoles?.includes("employe") || roles.clientRoles?.includes("employe")) {
      return "Employé";
    } else if (roles.realmRoles?.includes("responsable") || roles.clientRoles?.includes("responsable")) {
      return "Responsable";
    } else if (roles.realmRoles?.includes("admin") || roles.clientRoles?.includes("admin")) {
      return "Administrateur";
    } else if (roles.realmRoles?.includes("realisateur") || roles.clientRoles?.includes("realisateur")) {
      return "Réalisateur";
    } else if (roles.realmRoles?.includes("chef") || roles.clientRoles?.includes("chef")) {
      return "Chef";
    }else if (roles.realmRoles?.includes("superuser") || roles.clientRoles?.includes("superuser")) {
      return "superuser";
    }
      return "Utilisateur"; 
  };

 
  const handleNavigation = (path) => {
    navigate(path);
  };

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
  return (
    <div className="w-full bg-[#003b7e] border-b border-gray-100 shadow-sm">
      <div className="w-full flex items-center justify-between h-16 px-6">
     
        <div className="flex items-center gap-8">
       
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
            
              <img 
                src="/biat2.png" 
                alt="Logo" 
                className="w-8 h-8 object-contain"
                onError={(e) => { 
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <span 
                className="text-white font-bold text-lg hidden"
                style={{ display: 'none' }}
              >
                LOGO
              </span>
            </div>
          </div>
 
          <nav className="flex items-center gap-6">
            <button
              onClick={() => handleNavigation('/superuser')}
              className="text-white hover:text-blue-200 transition-colors duration-200 font-medium text-sm px-3 py-2 rounded-md hover:bg-white/10"
            >
              Demandes
            </button>
            <button
              onClick={() => handleNavigation('/superuser/dashboard')}
              className="text-white hover:text-blue-200 transition-colors duration-200 font-medium text-sm px-3 py-2 rounded-md hover:bg-white/10"
            >
              Dashboard
            </button>
          </nav>
        </div>
 
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} role={getUserRole()} />
            <div className="flex flex-col items-start">
              <span className="font-medium text-sm text-white leading-tight">
                {getUserRole()}
              </span>
              {user?.email && (
                <span className="text-xs text-gray-300 leading-tight">{user.email}</span>
              )}
            </div>
          </div>
 
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white hover:text-red-200 transition-colors duration-200 font-medium text-sm px-3 py-2 rounded-md hover:bg-red-500/20 border border-transparent hover:border-red-300/30"
            title="Se déconnecter"
          >
            <LogOut size={16} />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );
}