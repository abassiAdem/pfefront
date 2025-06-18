import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8787/api",
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
      
      if (csrfToken) {
        headers.set('X-XSRF-TOKEN', csrfToken);
      }
      
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      
      return headers;
    },
    responseHandler: async (response) => {
   
      if (response.status === 401) {
              }
      const result = await response.json();
      return result;
    }
  }),
  tagTypes: ["User", "Type","Formulaire","Demande","DemandeAgent","DemandeUrgence","EmailConfig"],
  endpoints: () => ({}),
});

export const apiSliceMiddleware = (store) => (next) => async (action) => {

  if (
    action.type?.startsWith('api/executeQuery/rejected') &&
    action.payload?.status === 401
  ) {

    try {

      await store.dispatch(refreshAuthToken()).unwrap();

      return next(action);
    } catch (error) {

      store.dispatch(logoutUser());
      return next(action);
    }
  }
  
  return next(action);
};