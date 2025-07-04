import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';

import { syncNotifications,addNotification, markAsRead } from '../Store/notificationSlice';
import { useMarkNotificationAsReadMutation,  useApproveModificationMutation,
  useRejectRequestMutation,useApproveCancellationMutation ,useFetchNotificationByIdAndAllQuery
  } from '../Store/notificationQuerySlice';
import { connectWebSocket, disconnectWebSocket } from './NotificationService';
import { Button } from '../components/ui/button';
import { useRef, useMemo } from 'react';
import demandeSlice from '../Store/DemandeSlice';
import { demandeApiSlice } from "../Store/demandeApiSlice ";

function getActionType(type) {
  switch (type) {
    case "MODIFICATION_REQUEST": return "modify";
    case "CANCELLATION_REQUEST": return "cancel";
    case "REQUEST_REJECTED": return "reject";
    case "REQUEST_APPROVED": return "approve";
    default: return undefined;
  }
}



function getNotificationTitle(type) {
  const upperType = type?.toUpperCase();
  switch (upperType) {
    case "REQUEST_REJECTED": return "Demande Rejetée";
    case "REQUEST_APPROVED": return "Demande Approuvée";
    case "MODIFICATION_REQUEST": return "Demande de Modification";
    case "CANCELLATION_REQUEST": return "Demande d'Annulation";
    case "ADDITIONAL_INFO_REQUEST": return "Demande d'Information";
    case "DEMANDE_SUPPRESSION": return "Suppression de demande";
    case "DEMANDE_MODIFICATION": return "Modification de demande";
     
    case "REQUEST_ASSIGNED": return "Demande Assignée";
    case "REQUEST_NOTIFICATION": return "Notification de Demande";
    case "DEMANDE_START": return "Début de Demande";
    case "MODIFICATION_APPROVED": return "Modification Approuvée";
    case "CANCELLATION_APPROVED": return "Annulation Approuvée";
    case "MODIFICATION_REJECTED": return "Modification Rejetée";
    case "CANCELLATION_REJECTED": return "Annulation Rejetée";
    
    default: return type?.replace(/_/g, ' ') || "Notification";
  }
}

export function useNotifications(userId, showToasts = true) {
  const dispatch = useDispatch();
  const [markNotificationAsRead] = useMarkNotificationAsReadMutation();
  const [approveModification] = useApproveModificationMutation();
  const [rejectRequest] = useRejectRequestMutation();
  const [approveCancellation] = useApproveCancellationMutation();
  const processedIds = useRef({
    api: new Set(),
    ws: new Set()
  })

  const displayedToastIds = useRef(new Set());

  const [isInitialized, setIsInitialized] = useState(false);
  
  const {data: apiNotifications = [], isLoading} = useFetchNotificationByIdAndAllQuery(userId);
  
  const allNotifications = useSelector(state => state.notifications.notifications);
  

  const validNotifications = allNotifications.filter(n => n.demandeId != null);

// 4️⃣ (Optional) watch when validNotifications becomes non‑empty
useEffect(() => {
  if (validNotifications.length > 0) {
    console.log("Valid notifications with demandeId:", validNotifications);
  }
}, [validNotifications]);

  const notifications = useMemo(() => 
    validNotifications.filter(n => !n.supervisorId || n.supervisorId === userId  ), 
    [validNotifications, userId]
  );

  useEffect(() => {
  if (!userId || isLoading || !apiNotifications.length) return;

  // only consider notifications that actually have a demandeId
  const readyNotifs = apiNotifications.filter(n => n.demandeId != null);

  const newFromApi = readyNotifs.filter(n =>
    !processedIds.current.api.has(n.id)
  );

  newFromApi.forEach(notification => {
    processedIds.current.api.add(notification.id);
    dispatch(addNotification(formatNotification(notification)));
  });
}, [userId, isLoading, apiNotifications, dispatch]);



  useEffect(() => {
    if (!userId) return;

    const onWsMessage = (message) => {
      try {
        const notification = JSON.parse(message.body);
        const notificationId = notification.id.toString();
        if (processedIds.current.ws.has(notificationId)) { 
          return;
        }

        processedIds.current.ws.add(notificationId);

        const formattedNotification = formatNotification(notification);

        
        dispatch(addNotification(formattedNotification));

        if (notification.demande && [
          'MODIFICATION_APPROVED',
          'CANCELLATION_APPROVED',
          'MODIFICATION_REJECTED',
          'CANCELLATION_REJECTED'
        ].includes(notification.type)) {
          dispatch(demandeApiSlice.util.invalidateTags(['DemandeAgent']));
        }
      } catch (error) {
        console.error("Error processing WS notification:", error);
      }
    };

    connectWebSocket(userId, onWsMessage);
    return () => disconnectWebSocket();
  }, [userId, dispatch]);
   
  const unreadCount = useMemo(() =>
    notifications.filter(n => !n.read).length,
    [notifications]
  );
  useEffect(() => {
    if (!showToasts ) return;
    
   
    const currentNotifications = [...notifications];
   
    const notificationsToProcess = currentNotifications.filter(n => 
      n.supervisorId === userId &&
      !n.read && 
      
      !displayedToastIds.current.has(n.id) &&
      !n.read 
    );
    
    if (notificationsToProcess.length === 0) return;
    
   

    const actionableNotifications = notificationsToProcess.filter(n => 
      n.isActionable && 
      ['MODIFICATION_REQUEST', 'CANCELLATION_REQUEST'].includes(n.type?.toUpperCase())
    );
    
  
    const regularNotifications = notificationsToProcess.filter(n => 
      !actionableNotifications.some(an => an.id === n.id)
    );
  
  
    actionableNotifications.forEach(notification => {
      displayedToastIds.current.add(notification.id);
      const isModification = notification.type?.toUpperCase() === 'MODIFICATION_REQUEST';
      const toastId = `action-toast-${notification.id}`;

      if (document.getElementById(toastId)) { 
        return;
      } 
      toast(
        <div className="flex flex-col items-start">
        <div className="flex flex-col gap-2">
          {notification.title && (
            <h4 className="font-medium text-sm text-foreground leading-tight">
              {getNotificationTitle(notification.type)} 
            </h4>
          )}
          
          <div className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-normal">Pour la demande: </span>
            <span className="font-medium text-foreground/90">
              {notification.demandeTitle}
            </span>
          </div>
           <div className="text-sm text-muted-foreground mt-1">
             Motif : {notification.reason || 'Aucune raison fournie'}
            </div>
        </div>

          <div className="flex h-full space-x-2 mt-2">
            <Button
              className="bg-green-500 text-white"
              onClick={async () => {
                try {
                  if (isModification) {
                    await approveModification({
                      demandeId: notification.demandeId,
                      responderId: userId,
                      approbation: true,
                      userId: notification.userId,
                      message: 'Votre demande de modification a été acceptée'
                    }).unwrap();
                  } else {
                    
                    await approveCancellation({
                      demandeId: notification.demandeId,
                      responderId: userId,
                      approbation: true,
                      userId: notification.userId,
                      message: 'Votre demande d\'annulation a été acceptée'
                    }).unwrap();
                  }
                  
                  await markNotificationAsRead(notification.id).unwrap();
                  dispatch(markAsRead(notification.id));

                  dispatch(demandeSlice.actions.updateDemande({
                    id: notification.demandeId,
                    ...(isModification
                      ? { approbationModification: true }
                      : { approbationAnnulation: true }),
                    statut: isModification
                      ? 'MODIFICATION_APPROVED'
                      : 'CANCELLATION_APPROVED'
                  }));
                  
                  toast.dismiss(toastId);
                } catch (error) {
                  console.error('Approval error:', error);
                  toast.dismiss(toastId);
                }
              }}
            >
              Accepter
            </Button>
            <Button
              className="bg-red-500 text-white"
              onClick={async () => {
                try {
                  await rejectRequest({
                    demandeId: notification.demandeId,
                    responderId: userId,
                    approbation: false,
                    userId: notification.userId,
                    message: `Votre demande ${isModification ? 'de modification' : 'd\'annulation'} a été refusée`,
                  }).unwrap();
                  
                  await markNotificationAsRead(notification.id).unwrap();
                  dispatch(markAsRead(notification.id));
                  
                  toast.dismiss(toastId);
                } catch (error) {
                  console.error('Rejection error:', error);
                  toast.dismiss(toastId);
                }
              }}
            >
              Refuser
            </Button>
          </div>
        </div>,
        { 
          duration: 0, 
          closeButton: true,
          className: "pl-2 pr-2",
          id: toastId
        }
      );
    });

    regularNotifications.forEach(notification => {
      displayedToastIds.current.add(notification.id);
      const toastId = `regular-toast-${notification.id}`; 
      if (document.getElementById(toastId)) {
        
        return;
      }
      
      toast(
        <div className="flex flex-col gap-2">
          {notification.title && (
            <h4 className="font-medium text-sm text-foreground leading-tight">
              {getNotificationTitle(notification.type)} 
            </h4>
          )}
          
          <div className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-normal">Pour la demande: </span>
            <span className="font-medium text-foreground/90">
              {notification.demandeTitle}
            </span>
          </div>
          
          {notification.message && (
            <p className="text-sm text-foreground mt-1.5 leading-snug">
              {notification.message}
            </p>
          )}
        </div>,
        {
          action: {
            label: <span style={{ color: "blue", fontWeight: "bold" }}>Lu</span>,
            onClick: () => handleMarkAsRead(notification.id)
          },
          duration: 3000,
          closeButton: true,
          id: toastId
        }
      );
    });
  }, [notifications, userId, showToasts, isInitialized, approveModification, rejectRequest, markNotificationAsRead, dispatch, approveCancellation]);
  

  useEffect(() => {
    return () => {
      displayedToastIds.current.clear();
    };
  }, []);
  

  const handleMarkAsRead = async (id) => {
    try {
      dispatch(markAsRead(id));
      await markNotificationAsRead(id).unwrap();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter(n => !n.read)
          .map(n => handleMarkAsRead(n.id))
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleRejectRequest = async (payload) => {
    try {
      const notification = notifications.find(n => n.id === payload.notificationId);
      const isModification = notification?.type?.toUpperCase() === 'MODIFICATION_REQUEST';
      

      await rejectRequest({
        demandeId: notification.demandeId,
        responderId: userId,
        approbation: false,
        userId: notification.userId,
        message: `Votre demande ${isModification ? 'de modification' : 'd\'annulation'} a été refusée`,
      }).unwrap();
      
      await markNotificationAsRead(notification.id).unwrap();
      dispatch(markAsRead(notification.id));
      dispatch(demandeSlice.actions.updateDemande({
        id: payload.demandeId,
        ...(isModification
          ? { approbationModification: false }
          : { approbationAnnulation: false })
      }));
      
      return true;
    } catch (error) {
      console.error('Rejection error:', error);
      throw error;
    }
  };


  const handleApproveRequest = async (payload) => {
    try {
      const notification = notifications.find(n => n.id === payload.notificationId);
      const isModification = notification?.type?.toUpperCase() === 'MODIFICATION_REQUEST';
      


        if (isModification) {
          await approveModification({
            demandeId: notification.demandeId,
            responderId: userId,
            approbation: true,
            userId: notification.userId,
            message: 'Votre demande de modification a été acceptée'
          }).unwrap();
        } else {
          await approveCancellation({
            demandeId: notification.demandeId,
            responderId: userId,
            approbation: true,
            userId: notification.userId,
            message: 'Votre demande d\'annulation a été acceptée'
          }).unwrap();
        }
        
        await markNotificationAsRead(payload.notificationId).unwrap();
        dispatch(markAsRead(payload.notificationId));

        dispatch(demandeSlice.actions.updateDemande({
          id: notification.demandeId,
          ...(isModification
            ? { approbationModification: true }
            : { approbationAnnulation: true }),
          statut: isModification
            ? 'MODIFICATION_APPROVED'
            : 'CANCELLATION_APPROVED'
        }));
        

      return true;
    } catch (error) {
      console.error('Approval error:', error);
      throw error;
    }
    

  };
    
  const formatNotification = (notification) => { 
    const requesterId = notification.requesterId || (notification.requester?.id || null);
    const responderId = notification.responderId || (notification.responder?.id || null);

    const demandeId = notification.demande?.id || notification.demandeId;
      const demandeTitle = notification.demande?.title || notification.demandeTitle || notification.demande?.demandeTitle || "Demande sans titre";
    
    let readStatus;
    if (notification.read !== undefined) {
      readStatus = notification.read;

    } else if (notification.isRead !== undefined) {
      readStatus = notification.isRead;
 
    } else {
      readStatus = false; 
    }

    return {
      id: notification.id.toString(),
      type: notification.type?.toLowerCase() || "info",
      title: getNotificationTitle(notification.type),
      message: notification.message,
      timestamp: notification.createdAt ? 
      new Date(notification.createdAt).toISOString() : 
      new Date().toISOString(),
      read:readStatus,
      requesterName: notification.requesterName ,                
      demandeId:demandeId,
      demandeTitle:demandeTitle,
      userId:requesterId, 
      supervisorId: responderId,
      reason: notification.motif || notification.reason || "",
      statut: notification.statut,
      actionType: getActionType(notification.type),
      isActionable: notification.actionable === true || 
        ['MODIFICATION_REQUEST', 'CANCELLATION_REQUEST'].includes(notification.type?.toUpperCase()),
      approbation: notification.approbation,
      methode: notification.methode,
    };
  };
  return {
    notifications,
    unreadCount,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleApproveRequest,
    handleRejectRequest,
    isLoading
  };
}
