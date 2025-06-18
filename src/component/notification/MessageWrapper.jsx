import React, { use, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import Messages from "./Messages";
import { useNotifications } from "../../Services/useNotifications";
import { useApproveModificationMutation,useFetchNotificationByIdAndAllQuery, useApproveCancellationMutation, useRejectRequestMutation,useDeleteNotificationMutation } from '../../Store/notificationQuerySlice';
import { selectAllNotifications, selectUnreadCount } from "../../Store/notificationSlice";
import demandeSlice from "../../Store/demandeSlice";
import { useDispatch } from "react-redux";
export default function MessageWrapper() {
  const { isAuthenticated, user, token, roles, loading, authError } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

    const [approveModification] = useApproveModificationMutation();
  const [approveCancellation] = useApproveCancellationMutation();
  const [rejectRequest] = useRejectRequestMutation();

  const notifications = useSelector(selectAllNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const [deleteNotification] = useDeleteNotificationMutation();
  const {

    handleMarkAsRead,
    handleMarkAllAsRead,
  } = useNotifications(user?.id, false); 
  
  const handleRemoveNotification = async (id) => {
    try {
      await deleteNotification(id);
      toast.success("Notification supprimée");
    } catch (error) {
      console.error("Error removing notification:", error);
      toast.error("Échec de la suppression de la notification");
    }
  };
  
  const handleApproveRequest = async ({ demandeId, responderId, userId, notificationId }) => {
    try {

      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) {
        console.error("Notification not found:", notificationId);
        toast.error("Notification introuvable");
        return;
      }
    
      
      const isModification = notification.type?.toUpperCase() === 'MODIFICATION_REQUEST';

      if (isModification) {
        await approveModification({
          demandeId,
          responderId,
          approbation: true,
          userId,
          message: 'Votre demande de modification a été acceptée'
        }).unwrap();
      } else {
        await approveCancellation({
          demandeId,
          responderId,
          approbation: true,
          userId,
          message: 'Votre demande d\'annulation a été acceptée'
        }).unwrap();
      }
      await handleMarkAsRead(notificationId);

      
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("Échec de l'approbation de la demande");
    }
  };
  
  const handleRejectRequest = async ({ demandeId, responderId, userId, notificationId }) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) {
      console.error("Notification not found:", notificationId);
      toast.error("Notification introuvable");
      return;
    }
   

    
    const isModification = notification.type?.toUpperCase() === 'MODIFICATION_REQUEST';
      try {
                  await rejectRequest({
                    demandeId: demandeId,
                    responderId: responderId,
                    approbation: false,
                    userId:userId,
                    message: `Votre demande ${isModification ? 'de modification' : 'd\'annulation'} a été refusée`,
                  }).unwrap();
                  
                  await handleMarkAsRead(notificationId);
                  

                } catch (error) {
                  console.error('Rejection error:', error);
                  toast.error('Échec du refus de la demande',error);
                }
  };
  
  if (!isAuthenticated || !user) {
    return null;
  }
  
  return (
    <Messages
      userId={user.id}
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
      onRemoveNotification={handleRemoveNotification}
      onApproveRequest={handleApproveRequest}
      onRejectRequest={handleRejectRequest}
      
    />
  );
}