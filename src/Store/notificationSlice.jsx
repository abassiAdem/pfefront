import { createSlice, isAction } from '@reduxjs/toolkit';
import { notificationQuerySlice } from './notificationQuerySlice';
import { demandeApiSlice } from './demandeApiSlice ';
const initialState = {
  notifications: [],
  unreadCount: 0
};

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload.id);
      
      if (index === -1) {
        // New notification
        const newNotification = {
          ...action.payload,
          timestamp: action.payload.timestamp || new Date().toISOString(),
          read: action.payload.read !== undefined ? action.payload.read : false,
        };
        
        state.notifications = [newNotification, ...state.notifications];
        
        if (!newNotification.read) {
          state.unreadCount += 1;
        }
      } else {
        // Update existing notification while preserving read status
        const existingNotification = state.notifications[index];

        state.notifications[index] = {
          ...action.payload,

          read: existingNotification.read || action.payload.read,
        };
      }
    },

    removeNotification: (state, action) => {
      const notificationToRemove = state.notifications.find(n => n.id === action.payload);
      if (notificationToRemove && !notificationToRemove.read) {
        state.unreadCount -= 1;
      }
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },

    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
    },

    markAllAsRead: (state) => {
      state.notifications = state.notifications.map(notification => ({
        ...notification,
        read: true
      }));
      state.unreadCount = 0;
    },

    approveRequest: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && notification.type === "approval") {
        if (!notification.read) {
          state.unreadCount -= 1;
        }
        notification.read = true;
        const successTitle = notification.actionType === "modify" ? "Modification approuvée" : "Suppression approuvée";
        const successMessage = `La demande de ${notification.actionType === "modify" ? "modification" : "suppression"} pour "${notification.demandeTitle}" a été approuvée`;
        state.notifications = [{
          type: "success",
          title: successTitle,
          message: successMessage,
          timestamp: new Date().toISOString(),
          read: false
        }, ...state.notifications];
        state.unreadCount += 1;
      }
    },

    rejectRequest: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && notification.type === "approval") {
        if (!notification.read) {
          state.unreadCount -= 1;
        }
        notification.read = true;
        const infoTitle = notification.actionType === "modify" ? "Modification rejetée" : "Suppression rejetée";
        const infoMessage = `La demande de ${notification.actionType === "modify" ? "modification" : "suppression"} pour "${notification.demandeTitle}" a été rejetée`;
        state.notifications = [{
          type: "info",
          title: infoTitle,
          message: infoMessage,
          timestamp: new Date().toISOString(),
          read: false
        }, ...state.notifications];
        state.unreadCount += 1;
      }
    },

    syncNotifications: (state, action) => {
      state.notifications = action.payload.map(notification => ({
        ...notification,
        id: notification.id.toString() 
      }));
      state.unreadCount = action.payload.filter(notification => !notification.isRead).length;
    },

  },
  extraReducers: (builder) => {
 
    builder.addMatcher(
      notificationQuerySlice.endpoints.fetchNotificationByIdAndAll.matchFulfilled,
      (state, { payload }) => {
        state.notifications = payload.map(notification => ({
          id: notification.id.toString(),
          type: notification.type.toLowerCase(),
          title: notification.type.replace('_', ' '),
          message: notification.message,
          timestamp: notification.createdAt, 
          read:  Boolean(notification.read ?? notification.isRead ?? false),
          demandeId: notification.demande?.id,
          demandeTitle: notification.demande?.title,
          reason: notification.motif,
          userId: notification.requesterId, 
          demandeurName: notification.requesterName, 
          supervisorId: notification.responderId,   
          isActionable: notification.actionable || false,
          methode: notification.methode,
        }));
        state.unreadCount = payload.filter(notification => !notification.isRead).length;
      }
    );

    
    builder.addMatcher(
      notificationQuerySlice.endpoints.markNotificationAsRead.matchFulfilled,
      (state, { payload }) => {
        const notification = state.notifications.find(n => n.id === payload.id.toString());
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount -= 1;
        }
      }
    );
    
    builder.addMatcher(
      notificationQuerySlice.endpoints.markNotificationAsReadInformartion.matchFulfilled,
      (state, { payload }) => {
        const notification = state.notifications.find(n => n.id === payload.id.toString());
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount -= 1;
        }
      }
    );
    
    builder.addMatcher(
      notificationQuerySlice.endpoints.deleteNotification.matchFulfilled,
      (state, { meta }) => {
        const deletedId = meta.arg.originalArgs.toString();
        const notificationToRemove = state.notifications.find(n => n.id === deletedId);
        if (notificationToRemove && !notificationToRemove.read) {
          state.unreadCount -= 1;
        }
        state.notifications = state.notifications.filter(n => n.id !== deletedId);
      }
    );
 
    builder.addMatcher(
      notificationQuerySlice.endpoints.approveModification.matchFulfilled,
      (state, { payload }) => {
        const originalNotification = state.notifications.find(
          n => n.demandeId === payload.demande?.id && n.type === "approval" && n.actionType === "modify"
        );
        if (originalNotification && !originalNotification.read) {
          originalNotification.read = true;
          state.unreadCount -= 1;
        }
        
        const newNotification = {
          id: payload.id.toString(),
          type: "success",
          title: "Modification approuvée",
          message: payload.message || `La demande de modification pour "${payload.demande?.title}" a été approuvée`,
          timestamp: payload.createdAt,
          read: false,
          demandeId: payload.demande?.id,
          
          demandeTitle: payload.demande?.title
        };
        state.notifications = [newNotification, ...state.notifications];
        state.unreadCount += 1;
      }
    );
    
    builder.addMatcher(
      notificationQuerySlice.endpoints.approveCancellation.matchFulfilled,
      (state, { payload }) => {
        const originalNotification = state.notifications.find(
          n => n.demandeId === payload.demande?.id && n.type === "approval" && n.actionType === "cancel"
        );
        if (originalNotification && !originalNotification.read) {
          originalNotification.read = true;
          state.unreadCount -= 1;
        }
        
        const newNotification = {
          id: payload.id.toString(),
          type: "success",
          title: "Suppression approuvée",
          message: payload.message || `La demande de suppression pour "${payload.demande?.title}" a été approuvée`,
          timestamp: payload.createdAt,
          read: false,
          demandeId: payload.demande?.id,
          demandeTitle: payload.demande?.title
        };
        state.notifications = [newNotification, ...state.notifications];
        state.unreadCount += 1;
      }
    );
    
    builder.addMatcher(
      notificationQuerySlice.endpoints.rejectRequest.matchFulfilled,
      (state, { payload }) => {
        let actionType = payload.actionType;
        
        if (!actionType) {
          const originalNotification = state.notifications.find(
            n => n.demandeId === payload.demande?.id && n.type === "approval"
          );
          actionType = originalNotification?.actionType;
        }
        
        const originalNotification = state.notifications.find(
          n => n.demandeId === payload.demande?.id && n.type === "approval"
        );
        if (originalNotification && !originalNotification.read) {
          originalNotification.read = true;
          state.unreadCount -= 1;
        }
        
        const title = actionType === "modify" ? "Modification rejetée" : "Suppression rejetée";
        const message = payload.message || 
          `La demande de ${actionType === "modify" ? "modification" : "suppression"} pour "${payload.demande?.title}" a été rejetée`;
        
        const newNotification = {
          id: payload.id.toString(),
          type: "info",
          title,
          message,
          timestamp: payload.createdAt,
          read: false,
          demandeId: payload.demande?.id,
          demandeTitle: payload.demande?.title
        };
        state.notifications = [newNotification, ...state.notifications];
        state.unreadCount += 1;
      }
    );
    
    builder.addMatcher(
      notificationQuerySlice.endpoints.createInformationRequest.matchFulfilled,
      (state, { payload }) => {
        const newNotification = {
          id: payload.id.toString(),
          type: "info",
          title: "Demande d'information",
          message: payload.message,
          timestamp: payload.createdAt,
          read: false,
          demandeId: payload.demande?.id,
          demandeTitle: payload.demande?.title,
          userId: payload.requester?.id
        };
        state.notifications = [newNotification, ...state.notifications];
        state.unreadCount += 1;
      }
    );
  }
});

export const notificationMiddleware = (store) => (next) => (action) => {
   
 
  const result = next(action);

  const triggerNotificationTypes = new Set([
    'modification_approved',
    'cancellation_approved',
    'request_rejected'
  ]);
  if (
    notificationQuerySlice.endpoints.approveModification.matchFulfilled(action) ||
    notificationQuerySlice.endpoints.approveCancellation.matchFulfilled(action) ||
    notificationQuerySlice.endpoints.rejectRequest.matchFulfilled(action)
  ) { 
    store.dispatch(demandeApiSlice.util.invalidateTags(['Demande', 'DemandeAgent']));
    return result;
  }

  if (action.type === 'notifications/addNotification') {
    const notificationType = action.payload?.type?.toLowerCase();
    if (notificationType && triggerNotificationTypes.has(notificationType)) { 
      store.dispatch(demandeApiSlice.util.invalidateTags(['Demande', 'DemandeAgent']));
    }
  }

  return result;
};
export const selectUnreadNotifications = (state) => 
  state.notifications.notifications.filter(notification => !notification.read);

export const selectUnreadCount = (state) => state.notifications.unreadCount;

export const selectAllNotifications = (state) => state.notifications.notifications;

export const { 
  addNotification,
  removeNotification,
  markAsRead,
  markAllAsRead,
  approveRequest,
  rejectRequest,
  syncNotifications,

} = notificationSlice.actions;

export default notificationSlice.reducer;