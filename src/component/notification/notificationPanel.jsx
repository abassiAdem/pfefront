import { useEffect, useRef, useState } from "react";
import { 
  Check, 
  ChevronDown, 
  Info, 
  MailCheck, 
  MessageSquare, 
  Settings, 
  X ,Mail,
  UserPlus,
  UserCheck,
  UserMinus,
  UserX,Edit ,
  XCircle,
  User,
  UserCog,
} from "lucide-react";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertTriangle } from "lucide-react";
const notificationIcons = {
  message: <MessageSquare className="h-5 w-5 text-blue-500" />,
  info: <Info className="h-5 w-5 text-indigo-500" />,
  email: <Mail className="h-5 w-5 text-purple-500" />, 
  success: <MailCheck className="h-5 w-5 text-green-500" />,
  error: <AlertTriangle className="h-5 w-5 text-red-500" />,
  approval: <Info className="h-5 w-5 text-orange-500" />,
  modification_request: <Edit className="h-5 w-5 text-yellow-500" />,
  cancellation_request: <XCircle className="h-5 w-5 text-red-500" />,
};
export function NotificationPanel({ 
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemoveNotification,
  onApproveRequest,
  onRejectRequest,
  user
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadNotifications = useMemo(() => 
    notifications.filter(notification => !notification.read && notification.supervisorId== user?.id ),
    [notifications,user]
  );
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: fr
      }).replace("environ ", "");
    } catch (error) {
      console.error("Error formatting time:", error);
      return '';
    }
  };
  const handleAction = async (action, notification) => {
   
    try {
      const payload = {
        demandeId: notification.demande?.id,
        responderId: user?.id,
        userId: notification.requester?.id,
        notificationId: notification.id
      };

      if (action === 'approve') { 
        if(notification.type === 'cancellation_request') {
          await onApproveRequest(payload,"cancellation");
        }else if(notification.type === 'modification_request') {
          await onApproveRequest(payload,"modification");
        }

      } else {
        await onRejectRequest(payload);
      }
      
      if (!notification.read) {
        onMarkAsRead(notification.id);
      }
    } catch (error) {
      console.error(`${action} failed:`, error);
    }
  };

  const validNotifications = unreadNotifications.filter(n => n && n.id && !n.read);

  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            className="bg-[#003b7e] hover:bg-[#003b7e] transition-colors duration-200 relative" 
            size="icon"
            aria-label="Notifications"
          >
            <div className="p-2 rounded-lg bg-[#003b7e] text-gray-500 hover:text-brand-orange hover:border-brand-orange transition-colors relative group">
              {unreadNotifications.length > 0 && (
                <Badge variant="outline" className="ml-auto bg-orange-500 hover:text-white text-white">
                  {unreadNotifications.length}
                </Badge>
              )}
              <Bell size={15} className="text-current text-white group-hover:text-brand-orange transition-colors" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-[400px] p-0" align="end" onInteractOutside={() => setIsOpen(false)}>
          <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-medium">Notifications</span>

            </div>
            {validNotifications.length > 0 && (
              <Button
                onClick={onMarkAllAsRead}
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700"
              >
                Tout marquer comme lu
              </Button>
            )}
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <div className="max-h-[400px] overflow-y-auto">
            {validNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                <div className="rounded-full bg-gray-100 p-3 mb-2">
                  <Check className="h-6 w-6 text-gray-500" />
                </div>
                <p className="text-sm text-gray-500">Aucune notification</p>
              </div>
            ) : (
              <DropdownMenuGroup>
                {validNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start p-4 border-b ${
                      !notification.read ? "bg-blue-50/50" : "bg-white"
                    } hover:bg-gray-50 transition-colors relative`}
                  >
                    <div className={`absolute top-0 left-0 h-full w-1 bg-blue-500`}></div>
                    
                    <div className="flex-shrink-0 pt-0.5 pl-3">
                      {notificationIcons[notification.type] || notificationIcons.info}

                    </div>
                    
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title || 'Notification'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-500">
                              {formatTime(notification.timestamp)}
                            </p>
                            <Badge 
                              variant="outline" 
                              className={`text-xs px-1.5 py-0 bg-blue-50 text-blue-600 border-blue-200`}
                            >

                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {notification.methode === 'notification' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-gray-400 hover:text-gray-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveNotification(notification.id);
                              }}
                              aria-label="Supprimer la notification"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {notification.demandeTitle && (
                        <div className="mt-1 text-xs text-gray-600">
                          <span className="font-medium">Demande:</span> {notification.demandeTitle}
                        </div>
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>

                      {notification.reason && (
                        <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
                          <span className="font-medium">Raison:</span> {notification.reason}
                        </div>
                      )}

                      {(notification.isActionable) && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            className="px-3 h-8 text-xs bg-green-500 hover:bg-green-600"
                            onClick={() => handleAction('approve', notification)}
                          >
                            Accepter
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="px-3 h-8 text-xs"
                            onClick={() => handleAction('reject', notification)}
                          >
                            Refuser
                          </Button>
                        </div>
                      )}

                      {!notification.read && !notification.isActionable && notification.methode === 'notification' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-2 h-8 px-3 text-xs text-blue-600 hover:text-blue-700"
                          onClick={() => onMarkAsRead(notification.id)}
                        >
                          Marquer comme lu
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </DropdownMenuGroup>
            )}
          </div>
          

        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}