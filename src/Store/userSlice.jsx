import { apiSlice } from "../api/apiSlice"


export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    saveEmailConfig: builder.mutation({
      query: (emailConfig) => ({
        url: "/admin/email-config",
        method: "POST",
        body: emailConfig 
      }),
      invalidatesTags: ["EmailConfig"],
    }),

    createDepartement: builder.mutation({
      query: (data) => ({
        url: '/admin/departement',
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Departement'],
    }),

    updateUser:builder.mutation({
      query: (userData) => ({ 
        url: `/admin/update`,
        method: "PUT",
        body: JSON.stringify(userData),
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["User"],
    }),
    getPieChart: builder.query({
      query: () => "/dashboard/active-status",
      providesTags: ["User"],
    }
  ),
    getLineChart: builder.query({
      query: () => "/dashboard/activity/last-7-days",
      providesTags: ["User"],
    }
  ),
    getUsers: builder.query({
      query: () => "/admin/users",
      providesTags: ["User"],
    }
  ),
    getChefs: builder.query({
      query: () => "/admin/chefs",
      providesTags: ["User"],
    }),
    getResponsables: builder.query({
      query: () => "/admin/responsables",
      providesTags: ["User"],
    }),
    createUser: builder.mutation({
      query: (userData) => {
       
        return {
          url: "/admin/register",
          method: "POST",
          body: JSON.stringify(userData),
          headers: {
            "Content-Type": "application/json",
          },
        };
      },
      invalidatesTags: ["User"],
    }),

     getDepartements: builder.query({
      query: () => "/admin",
      providesTags: ["Departement"],
    }
  ),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/admin/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    
    
    getUsersForChef: builder.query({
      
      query: (chefId) =>`/admin/${chefId}/users` ,
      providesTags: ["User"],
    }),
    transformErrorResponse: (response, meta, arg) => {
      console.error("Full error response:", response);
      if (response.status === 409) {
        return {
          status: "CONFLICT",
          message: "Un utilisateur avec cet e-mail existe déjà",
        };
      }

      return {
        status: response.status,
        data: response.data || "Unknown error occurred",
      };
    },
  }),
});

export const {
  useGetUsersQuery,
  useGetChefsQuery,
  useGetResponsablesQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetUsersForChefQuery,
  useGetPieChartQuery,
  useGetLineChartQuery,
  useSaveEmailConfigMutation,
  useUpdateUserMutation,
  useCreateDepartementMutation,
  useGetDepartementsQuery,
} = usersApiSlice;