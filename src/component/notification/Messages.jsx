import React, { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { format } from "date-fns";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MessageSquare,
  Info,
  MailCheck,
  AlertTriangle,
  Search,
  Filter,
  Check,
  X,
  ArrowDown,
  ArrowUp,
  Trash2,
  CheckCheck,
  Mail,
  Bell,FileCheck,FilePlus,FileEdit,FileX,User, CheckCircle, FileText
} from "lucide-react";
const notificationMethodIcons = {
  EMAIL: <Mail className="h-4 w-4 text-purple-500" />,
  NOTIFICATION: <Bell className="h-4 w-4 text-blue-500" />,

};

const notificationIcons = {
  message: <MessageSquare className="h-5 w-5 text-blue-600" />,
  info: <Info className="h-5 w-5 text-indigo-600" />,
  success: <MailCheck className="h-5 w-5 text-emerald-600" />,
  error: <AlertTriangle className="h-5 w-5 text-rose-600" />,
  approval: <FileCheck className="h-5 w-5 text-amber-600" />,
  request: <FilePlus className="h-5 w-5 text-purple-600" />,
  modification: <FileEdit className="h-5 w-5 text-teal-600" />,
  cancellation: <FileX className="h-5 w-5 text-red-600" />,
};
function getNotificationTypeInfo(type) {
  const typeKey = type?.toUpperCase() || "NOTIFICATION";
  
  const titles = {
    "REQUEST_REJECTED": { title: "Demande rejetée", icon: "error" },
    "REQUEST_APPROVED": { title: "Demande approuvée", icon: "success" },
    "MODIFICATION_REQUEST": { title: "Demande de modification", icon: "modification" },
    "CANCELLATION_REQUEST": { title: "Demande d'annulation", icon: "cancellation" },
    "ADDITIONAL_INFO_REQUEST": { title: "Demande d'information", icon: "info" },
    "DEMANDE_SUPPRESSION": { title: "Suppression de demande", icon: "cancellation" },
    "DEMANDE_MODIFICATION": { title: "Modification de demande", icon: "modification" },
    "REQUEST_ASSIGNED": { title: "Demande attribuée", icon: "approval" },
    "REQUEST_NOTIFICATION": { title: "Notification de demande", icon: "message" },
    "DEMANDE_START": { title: "Début de demande", icon: "request" },
    "MODIFICATION_APPROVED": { title: "Modification approuvée", icon: "success" },
    "CANCELLATION_APPROVED": { title: "Annulation approuvée", icon: "success" },
    "MODIFICATION_REJECTED": { title: "Modification rejetée", icon: "error" },
    "CANCELLATION_REJECTED": { title: "Annulation rejetée", icon: "error" },
  };
  
  return titles[typeKey] || { 
    title: typeKey.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase()),
    icon: "info" 
  };
}



const Messages = ({ 
  userId,
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemoveNotification,
  onApproveRequest,
  onRejectRequest
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  const [sortOrder, setSortOrder] = useState('newest');
  const [sortBy, setSortBy] = useState('date');
 
  const handleAction = async (action, notification) => {
    try {
      const payload = {
        demandeId: notification.demandeId,
        responderId: userId,
        userId: notification.userId,
        notificationId: notification.id
      };

      if (action === 'approve') {
        await onApproveRequest(payload);
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

  const handleSelect = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(notifId => notifId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const filteredNotifications = getFilteredNotifications();
    
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(notif => notif.id));
    }
  };

  const handleDeleteSelected = () => {
    selectedNotifications.forEach(id => onRemoveNotification(id));
    setSelectedNotifications([]);
    toast.info(`${selectedNotifications.length} notification(s) supprimée(s)`);
  };

  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    if (activeTab === "unread") {
      filtered = filtered.filter(n => !n.read);
    } else if (activeTab === "read") {
      filtered = filtered.filter(n => n.read);
    } 

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(term) || 
        n.message.toLowerCase().includes(term) ||
        (n.requesterName && n.requesterName.toLowerCase().includes(term)) ||
        (n.demandeTitle && n.demandeTitle.toLowerCase().includes(term)) ||
        (n.methode && n.methode.toLowerCase().includes(term))
      );
    }
    

    if (sortBy === 'date') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        if (sortOrder === 'newest') {
          return dateB - dateA;
        } else {
          return dateA - dateB;
        }
      });
    } else if (sortBy === 'type') {
      filtered.sort((a, b) => {
        if (a.type === b.type) {

          const dateA = new Date(a.timestamp).getTime();
          const dateB = new Date(b.timestamp).getTime();
          return sortOrder === 'newest' 
            ? dateB - dateA
            : dateA - dateB;
        }
        return a.type.localeCompare(b.type);
      });
    }
    
    return filtered;
  }, [notifications, activeTab, searchTerm, sortOrder, sortBy]);

  const formatDate = (date) => {
    return format(new Date(date), "dd MMM yyyy, HH:mm", { locale: fr });
  };
  const getFilteredNotifications = () => {
    return notifications
      .filter(notif => {
        if (activeTab === "all") return true;
        if (activeTab === "unread") return !notif.read;
        if (activeTab === "read") return notif.read;
        if (activeTab === "actionable") return notif.isActionable;
        return true;
      })
      .filter(notif => 
        notif.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        notif.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
  };

  const handleSortChange = (order) => {
    setSortOrder(order);

  };


  const handleSortByChange = (sortByValue) => {
    setSortBy(sortByValue);

  };
  const readCountList = notifications.filter(notif => notif.read).length;
  const unreadCountList = notifications.filter(notif => !notif.read).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Notifications</h1>
            <p className="text-gray-600">Gérez vos messages et demandes</p>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedNotifications.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Supprimer ({selectedNotifications.length})</span>
              </Button>
            )}
            
            {unreadCountList > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkAllAsRead}
                className="flex items-center gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                <span>Tout marquer comme lu</span>
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-white">
            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher des notifications..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                <TabsList className="grid w-full md:w-auto grid-cols-3 border-none shadow-none bg-transparent">
                    <TabsTrigger value="all"className="relative hover:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400 data-[state=active]:text-blue-500 data-[state=active]:shadow-none">
                      Tout
                      <Badge  className="ml-1 bg-white hover:bg-white text-orange-500">
                        {notifications.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="unread"className="relative hover:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400 data-[state=active]:text-blue-500 data-[state=active]:shadow-none">
                      Non lu
                      {unreadCountList > 0 && (
                        <Badge  className="ml-1 bg-white hover:bg-white text-orange-400">
                          {unreadCountList}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="read"className="relative hover:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400 data-[state=active]:text-blue-500 data-[state=active]:shadow-none">
                      Lu
                      {readCountList > 0 && (
                        <Badge   className="ml-1 bg-white hover:bg-white  text-orange-400">
                          {readCountList}
                        </Badge>
                      )}
                    </TabsTrigger>
                    
                  </TabsList>
                </Tabs>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="px-2">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white">
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => handleSortChange('newest')} className="flex items-center justify-between">
                        Les plus récents
                        {sortOrder === 'newest' && sortBy === 'date' && <Check className="h-4 w-4 ml-2" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSortChange('oldest')} className="flex items-center justify-between">
                        Les plus anciens
                        {sortOrder === 'oldest' && sortBy === 'date' && <Check className="h-4 w-4 ml-2" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSortByChange('type')} className="flex items-center justify-between">
                        Par type
                        {sortBy === 'type' && <Check className="h-4 w-4 ml-2" />}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          
          <div className="divide-y">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="rounded-full bg-gray-100 p-3 mb-3">
                  <Check className="h-6 w-6 text-gray-500" />
                </div>
                <p className="font-medium text-gray-700">Aucune notification</p>
                <p className="text-sm text-gray-500 mt-1">
                  {searchTerm 
                    ? "Essayez de modifier vos critères de recherche" 
                    : "Vous n'avez aucune notification dans cette catégorie"}
                </p>
              </div>
            ) : (
              <>
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="w-12 py-3 pl-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                            checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                            onChange={handleSelectAll}
                          />
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSortByChange(sortBy === 'type' ? 'date' : 'type')}>
                          Type
                          {sortBy === 'type' && <Check className="h-3 w-3" />}
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notification</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSortChange(sortOrder === 'newest' ? 'oldest' : 'newest')}>
                          Date
                          {sortOrder === 'newest' ? (
                            <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ArrowUp className="h-3 w-3" />
                          )}
                        </div>
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                  {filteredNotifications.map((notification) => {

  const typeInfo = getNotificationTypeInfo(notification.type?.toUpperCase());
  const isUnread = !notification.read;
  
  return (
    <tr 
      key={notification.id} 
      className={`transition-all hover:bg-gray-50 border-l-2 ${
        isUnread 
          ? 'bg-blue-50/40 border-l-blue-500' 
          : 'border-l-transparent'
      }`}
    >
      <td className="py-4 pl-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 focus:ring-offset-0"
            checked={selectedNotifications.includes(notification.id)}
            onChange={() => handleSelect(notification.id)}
          />
        </div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <div className="flex flex-col items-center justify-center">
          <div className={`rounded-full p-1.5 ${
            isUnread ? 'bg-white shadow-sm' : 'bg-gray-50'
          }`}>
            {notificationIcons[typeInfo.icon] || notificationIcons.info}
          </div>
          {isUnread && (
            <span className="w-2 h-2 rounded-full bg-blue-500 mt-1"></span>
          )}
        </div>
      </td>
      <td className="px-3 py-4">
        <div className="max-w-md">
          <div className="mb-1.5">
            <span className={`text-xs font-medium py-0.5 px-2 rounded-full ${
              notification.isActionable 
                ? 'bg-amber-100 text-amber-800' 
                : isUnread 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600'
            }`}>
              {typeInfo.title}
            </span>
          </div>
          <div className={`${isUnread ? 'font-medium' : ''}`}>
            <p className="text-sm font-medium text-gray-900 line-clamp-1">
              {notification.demandeTitle}
            </p>
            <p className="text-sm text-gray-600 line-clamp-1 mt-0.5">
              {notification.message}
            </p>
          </div>
          {notification.requesterName && (
            <p className="text-xs text-gray-500 mt-1.5 flex items-center">
              <User className="h-3 w-3 mr-1 text-gray-400" />
              <span className="font-medium text-gray-600">De:</span>
              <span className="ml-1">{notification.requesterName}</span>
            </p>
          )}
          
          {notification.reason && (
            <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
              <span className="font-medium text-gray-700">Raison: </span>
              <span className="break-words">{notification.reason}</span>
            </div>
          )}
          
          {notification.isActionable && (
            <div className="flex gap-2 mt-2.5">
              <Button
                size="sm"
                disabled={notification.read}
                className={`h-7 px-3 text-xs font-medium transition-all ${
                  notification.read 
                    ? 'bg-gray-100 text-gray-400' 
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow'
                }`}
                onClick={() => handleAction('approve', notification)}
              >
                <Check className="mr-1.5 h-3 w-3" />
                Accepter
              </Button>
              <Button
                size="sm"
                disabled={notification.read}
                className={`h-7 px-3 text-xs font-medium transition-all ${
                  notification.read 
                    ? 'bg-gray-100 text-gray-400' 
                    : 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm hover:shadow'
                }`}
                onClick={() => handleAction('reject', notification)}
              >
                <X className="mr-1.5 h-3 w-3" />
                Refuser
              </Button>
            </div>
          )}
        </div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <div className="flex flex-col items-start">
          <p className={`text-xs ${isUnread ? 'font-medium text-gray-700' : 'text-gray-500'}`}>
            {formatDate(notification.timestamp)}
          </p>
          
          <p className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(new Date(notification.timestamp), { 
              addSuffix: true,
              locale: fr 
            })}
          </p>
        </div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-right">
        <div className="flex justify-end gap-2">
          {isUnread && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-3 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              onClick={() => onMarkAsRead(notification.id)}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
              Marquer lu
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-full"
            onClick={() => onRemoveNotification(notification.id)}
            title="Supprimer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
})}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;