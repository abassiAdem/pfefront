import { apiSlice } from "../api/apiSlice";
import { markAllAsRead } from "./notificationSlice";
export const  notificationQuerySlice = apiSlice.injectEndpoints({

  endpoints: (builder) => ({
    fetchAllUserNotificationsNoTEmail: builder.query({
      query: (userId) => `/notifications/all/notification/${userId}`,
      providesTags: ['Notification'],
    })
    ,markAllAsRead: builder.mutation({
      query: () => ({
        url: `/notifications/mark-all-read`,
        method: "PATCH",
        body: {},
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(markAllAsRead(data));
        } catch (error) {
          console.error("Failed to mark all notifications as read:", error);
        }
      },
    }),
    fetchNotifications: builder.query({
      query: (userId) => `/notifications/${userId}`,
    }),

    fetchNotificationByIdAndAll: builder.query({
      query: (userId) => `/notifications/all/${userId}`,
      providesTags: ['Notification'],
    }),


    requestModificationApproval: builder.mutation({
      query: (data) => ({
        url: `/notifications/request/modification`,
        method: "POST",
        body: data,
      }),
    }),

    approveModification: builder.mutation({
      query: (data) => ({
        url: `/notifications/approve/modification`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Notifications', id: 'LIST' },
        { type: 'Demande', id: arg.demandeId },
        { type: 'DemandeAgent', id: arg.userId }
      ]
    }),
    approveCancellation: builder.mutation({
      query: (data) => ({
        url: `/notifications/approve/cancellation`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Notifications', 'Demande', 'DemandeAgent']
    }),

    rejectRequest: builder.mutation({
      query: (data) => ({
        url: `/notifications/reject`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Notifications', 'Demande', 'DemandeAgent']
    }),

    requestCancellationApproval: builder.mutation({
      query: (data) => ({
        url: `/notifications/request/cancellation`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Notifications', 'Demande', 'DemandeAgent']
    }),

    markNotificationAsReadInformartion: builder.mutation({
      query: (data) => ({
        url: `/notifications/mark-read`,
        method: "POST",
        body: data,
      }),
    }),

    createInformationRequest: builder.mutation({
      query: (data) => ({
        url: `/notifications/create/information-request`,
        method: "POST",
        body: data,
      }),
    }),
    markNotificationAsRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),

      invalidatesTags: ['Notification'],
    }),
    fetchUnreadNotifications: builder.query({  
      query: () => '/notifications/unread',
      providesTags: ['Notification'],
    }),
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useFetchNotificationsQuery,
  useRequestModificationApprovalMutation,
  useApproveModificationMutation,
  useApproveCancellationMutation,
  useRejectRequestMutation,
  useRequestCancellationApprovalMutation,
  useCreateInformationRequestMutation,
  useMarkNotificationAsReadMutation,
  useFetchUnreadNotificationsQuery, 
  useDeleteNotificationMutation,
  useMarkAllAsReadMutation,
  useFetchNotificationByIdAndAllQuery,
  useFetchAllUserNotificationsNoTEmailQuery,
} = notificationQuerySlice;