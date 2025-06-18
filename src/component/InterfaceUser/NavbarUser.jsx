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
import { Bell } from "lucide-react";
import {useNotifications} from "../../Services/useNotifications";
import { useMemo } from "react";

export function Navbar({ user }) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { isAuthenticated, roles } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [processedNotificationIds, setProcessedNotificationIds] = useState(new Set());
  const [approveModification] = useApproveModificationMutation();
  const [approveCancellation] = useApproveCancellationMutation();
  const [rejectRequest] = useRejectRequestMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [MarkAllAsRead] = useMarkAllAsReadMutation();
  const { notifications, unreadCount, handleMarkAsRead } = useNotifications(user?.id);
  const processedNotifications = useMemo(() => 
    notifications.map(notification => ({
      ...notification,
      //isRead: notification.read,
      createdAt: notification.timestamp,
      requester: { id: notification.userId },
      demande: { id: notification.demandeId },
    })),
    [notifications]
  );
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
  const handleMarkAllAsRead = async () => {
    try {
      await MarkAllAsRead(user?.id);
      setProcessedNotificationIds(new Set());
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      setProcessedNotificationIds(prev => {
        const newSet = new Set(prev);
        newSet.add(id);
        return newSet;
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };
  const handleApproveAction = async (data, type) => { 
    if (type === "modification") { 
      try {
        const result = await approveModification(data); 
        setProcessedNotificationIds(prev => new Set([...prev, data.id]));
      } catch (error) {
        console.error("Approval failed:", error);
      }
    } else if (type === "cancellation") { 
      try {
        const result = await approveCancellation(data); 
        setProcessedNotificationIds(prev => new Set([...prev, data.id]));
      } catch (error) {
        console.error("Approval failed:", error);
      }
    } else {
      console.log("Unknown approval type:", type);
    }
  };

  const handleRejectRequest = async (data) => {
    try {
      await rejectRequest(data);
      setProcessedNotificationIds(prev => new Set([...prev, data.id]));
    } catch (error) {
      console.error("Rejection failed:", error);
    }
  };

  const toggleNotificationPanel = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  return (
    <div className="w-full bg-[#003b7e] border-b border-gray-100 shadow-sm">
      <div className="w-full flex items-center justify-between h-16 px-6">
        <div className="relative w-64"></div>

        <div className="flex items-center gap-4">

          <NotificationPanel
            notifications={processedNotifications}
            unreadCount={unreadCount}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onRemoveNotification={handleDeleteNotification}
            onApproveRequest={handleApproveAction}
            onRejectRequest={handleRejectRequest}
            user={user}
          />


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
        </div>
      </div>
    </div>
  );
}