import { apiSlice } from "../api/apiSlice";
import demandeSlice, { updateDemande } from "./DemandeSlice";
export const demandeApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

  
      completeDemande: builder.mutation({
        query: (id) => ({
          url: `/demandes/${id}/terminee`,
          method: "PUT",
        }),
        invalidatesTags: ["Demande"],
      }),
      deleteDemande: builder.mutation({
        query: (id) => ({
          url: `/demandes/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Demande"],

        onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
          try {
            await queryFulfilled;
  
            dispatch(demandeSlice.actions.deleteDemande(id));
          } catch (error) {
            console.error('Failed to delete demande:', error);
          }
        }
      }),
      updateDataDependence: builder.mutation({
        query: (dependenceId) => ({
          url: `/demandes/update-dependence/${dependenceId}`,
          method: "PUT",
        }),
        invalidatesTags: ["Demande"],
      }),
  
      adjustDateEstimee: builder.mutation({
        query: ({ demandeId, newEstimated }) => ({
          url: `/demandes/adjust-date-estimee/${demandeId}`,
          method: "PUT",
          params: { newEstimated },
        }),
        invalidatesTags: ["Demande"],
      }),
      


      setStatusRespons: builder.mutation({
        query: (id) => ({
          url: `/demandes/${id}/status/Attenteres`,
          method: "PUT",
          formData: true,
        }),
        invalidatesTags: ["Demande"],
      }),
      setStatusAnule: builder.mutation({
        query: (id) => ({
          url: `/demandes/${id}/status/anulle`,
          method: "PUT",
        }),
        invalidatesTags: ["Demande"],
      }),
  
      setStatusAffectee: builder.mutation({
        query: (id) => ({
          url: `/demandes/${id}/status/Affectee`,
          method: "PUT",
        }),
        invalidatesTags: ["Demande"],
      }),
      setStatusReject: builder.mutation({
        query: (id) => ({
          url: `/demandes/${id}/status/Reject`,
          method: "PUT",
        }),
        invalidatesTags: ["Demande"],
      }),
  
      setStatusAccept: builder.mutation({
        query: ({ id, idr }) => ({
          
          url: `/demandes/${id}/status/Accept/${idr}`,
          method: "PUT",
        }),
        invalidatesTags: ["Demande"],
      }),
  
      updateDemande: builder.mutation({
        query: ({ id, demandeDTO }) => ({
          url: `/demandes/${id}`,
          method: "PUT",
          body: demandeDTO,
        }),
        invalidatesTags: ["Demande"],
      }),
  
      
  
      updateInfoSup:builder.mutation({
        query: ({ demandeId, infoSup }) => ({
          url: `/demandes/InfoSup/${demandeId}`,
          method: "PUT",
          body: {infoSup},
        }),
        invalidatesTags: ["Demande"],
      }),
            UpdateUrgence: builder.mutation({
        query: ({ id, urgence }) => ({
          url: `/demandes/urgence/${id}`,
          method: "PUT",
          body: { urgence } 
        }),
        invalidatesTags: ["Demande"],
      }),
      getAllDemandesForChef: builder.query({
        query: (chefId) => `/demandes/chef/${chefId}`,
        providesTags: ["Demande"],
      }),
  
      getAllDemandesEnAttenteResponsable: builder.query({
        query: (responsableId) => `/demandes/en-attente-responsable/${responsableId}`,
        providesTags: ["Demande"],
      }),
  
      getDemandesFinalisees: builder.query({
        query: (responsableId) => `/demandes/finalise/${responsableId}`,
        providesTags: ["Demande"],
      }),
      getDemandesRealisateur: builder.query({
        query: (realisateurId) => `/demandes/realisateur/${realisateurId}`, 
        providesTags: ["Demande"],
      }),

      

      setStatusRejectResponsable: builder.mutation({
        query: ({ id, idr, message }) => {
          const requestId = Number(id);
          let userId = Number(idr);
          
          if (isNaN(requestId)) {
            throw new Error("Invalid request ID");
          }
          
          if (isNaN(userId)) {
            console.warn("Invalid user ID in request, using fallback");
            
          }
          return {
            url: `/demandes/${requestId}/status/Reject/responsable/${userId}`,
            method: "PUT",
            body: message,
          };
        },
        invalidatesTags: ["Demande"],
      }),
      affecterRealisateur: builder.mutation({
        query: ({ demandeId, realisateurId, dateAffectation,dureEstimee }) => ({
          url: `/demandes/${demandeId}/affecter-realisateur/${realisateurId}`,
          method: "PUT",
          body: {
            dateAffectation: dateAffectation ,
            dureEstimee:dureEstimee,
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }),
        invalidatesTags: ["Demande"],
      }),
      getDemandesFinaliseesRealisateur: builder.query({
        query: (realisateurId) => `/demandes/finalisees/${realisateurId}`,
        providesTags: ["Demande"],
      }),
      getDemandesFinalisesByAgent: builder.query({
        query: (agentId) => `/demandes/finalises/${agentId}`,
        providesTags: ["Demande"],
      }),
      getGantt: builder.query({
        query: (responsableId) => `/demandes/gantt/${responsableId}`,
        providesTags: ["Demande"],
    }),
    startDemande: builder.mutation({
      query: (id) => ({
        url: `/demandes/${id}/status/Cours`,
        method: "PUT",
        headers: {
          'Content-Type': 'text/plain' 
        }
      }),
      invalidatesTags: ["Demande"],
    }),
    getDemandesByMetier: builder.query({
      query: (params) => ({
        url: `/dashboard/percentage-by-metier/${params.userId}`,
        method: "GET",
        params: {
          ...(params.startDate && { startDate: params.startDate }),
          ...(params.endDate && { endDate: params.endDate }),
          ...(params.statuses && { statuses: params.statuses.join(',') })
        }
      }),
      providesTags: ["Demande"],
    }),
    getDemandesByType: builder.query({
      query: (params) => ({
        url: `/dashboard/percentage-by-type/${params.userId}`,
        method: "GET",
        params: {
          ...(params.startDate && { startDate: params.startDate }),
          ...(params.endDate && { endDate: params.endDate }),
          ...(params.statuses && { statuses: params.statuses.join(',') })
        }
      }),
      providesTags: ["Demande"],
    }),
    getAllDemandesByAgentChefId: builder.query({
      query: (chefId) => `demandes/chef/${chefId}/users`,
      providesTags: ["Demande","User"],
    }),
    getCard: builder.query({
      query: (agentId) =>`/demandes/count-by-status/${agentId}` ,
      providesTags: ["Demande"],
    }),
    
   
    getCardRes: builder.query({
      query: (responsableId) =>`/demandes/count-by-statusres/${responsableId}`,
      providesTags: ["Demande"],
    }),
    getDemandesByResponsable: builder.query({
      query: (responsableId) => `/demandes/responsable/${responsableId}`,
      providesTags: ["Demande", "DemandeAgent"],
    }),
    
    getAllDemandesForAgent: builder.query({
      query: (agentId) => `/demandes/agent/${agentId}`,
      providesTags: ["Demande", "DemandeAgent"],
    }),
    getRealisateurAvaib: builder.query({
      
      query: (responsableId) =>`/demandes/availability/${responsableId}` ,
      providesTags: ["Demande"],
    }),
    createDemande: builder.mutation({
      query: (demandeDTO) => ({
        url: "/demandes/create",
        method: "POST",
        body: demandeDTO,
      }),
      invalidatesTags: ["Demande"],
    }),

  getAllDemande: builder.query({
    query: () => {
      return { 
        url: "/demandes/ALL",
        method: 'GET' };
    },
    providesTags: ["Demande"],
  }),

getDemande: builder.query({
  query: (id) => {
    if (!id) { 
      return { url: '', method: 'GET', responseHandler: 'text' };
    }
    return { url: `/demandes/${id}`, method: 'GET' };
  },
  providesTags: ["Demande"],
})
  }),
});
  

  export const {
    useCreateDemandeMutation,
    useGetDemandeQuery,
    useCompleteDemandeMutation,
    useUpdateDataDependenceMutation,
    useAdjustDateEstimeeMutation,
    useSetStatusResponsMutation,
    useSetStatusAnuleMutation,
    useSetStatusRejectMutation,
    useSetStatusAcceptMutation,
    useUpdateDemandeMutation,
    useGetAllDemandesForAgentQuery,
    useGetAllDemandesForChefQuery,
    useGetAllDemandesEnAttenteResponsableQuery,
    useGetDemandesFinaliseesQuery,
    useAffecterRealisateurMutation,
    useDeleteDemandeMutation,
    useSetStatusRejectResponsableMutation,
    useGetDemandesFinaliseesRealisateurQuery,
    useGetGanttQuery,
    useStartDemandeMutation,
    useGetDemandesFinalisesByAgentQuery,
    useGetDemandesByMetierQuery,
    useGetAllDemandesByAgentChefIdQuery,
    useGetDemandesByTypeQuery,
    useGetCardQuery,
    useGetCardResQuery,
    useGetDemandesByResponsableQuery,
    useGetRealisateurAvaibQuery,
    useSetStatusAffecteeMutation,
    useUpdateUrgenceMutation,
    useUpdateInfoSupMutation,
    useGetAllDemandeQuery,
  } = demandeApiSlice;
