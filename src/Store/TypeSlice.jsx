import { apiSlice } from "../api/apiSlice";
 

export const typeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTypes: builder.query({
      query: () => "/type/all",
      providesTags: ["Type"],
    }),
    getTypesNotNormal: builder.query({
      query: () => "/type/allNotNormal",
      providesTags: ["Type"],
    }),
    createType: builder.mutation({
      query: (typeData) => ({
        url: "/type/create",
        method: "POST",
        body: typeData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Type"],
    }),

    getFormulaireByTypeId: builder.query({
      query: (typeId) => `/type/${typeId}`,
      providesTags: ["Formulaire"],
    }),
    getFormulaireByTypeName: builder.query({
      query: (type) => `/type/name?type=${type}`,
      providesTags: ["Formulaire"],
    }),
    updateType: builder.mutation({
      query: ({ id, ...typeData }) => ({
        url: `/type/${id}`,
        method: "PUT",
        body: typeData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Type"],
    }),

    deleteType: builder.mutation({
      query: (id) => ({
        url: `/type/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Type"],
    }),

  }),
});

export const {
  useGetTypesQuery,
  useCreateTypeMutation,
  useGetFormulaireByTypeIdQuery,
  useUpdateTypeMutation,
  useDeleteTypeMutation,
  useGetFormulaireByTypeNameQuery,
  useGetTypesNotNormalQuery,
} = typeApiSlice;