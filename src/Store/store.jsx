import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth2Slice'; 
import { apiSlice, apiSliceMiddleware } from "../api/apiSlice";
import notificationReducer from './notificationSlice';
import demandeReducer from './DemandeSlice';
import {notificationQuerySlice} from './notificationQuerySlice';
import { demandeApiSlice } from './demandeApiSlice ';
import { notificationMiddleware } from './notificationSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
    [notificationQuerySlice.reducerPath]: notificationQuerySlice.reducer,
    [demandeApiSlice.reducerPath]: demandeApiSlice.reducer,
    demandes: demandeReducer,
    [apiSlice.reducerPath]: apiSlice.reducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware).concat(notificationQuerySlice.middleware).concat(demandeApiSlice.middleware).concat(notificationMiddleware),

  devTools: process.env.NODE_ENV !== 'production', 
});


import { refreshAuthToken } from './auth2Slice';



let refreshTokenTimeout;

const scheduleTokenRefresh = (store) => {
  if (refreshTokenTimeout) {
    clearTimeout(refreshTokenTimeout);
  }
  
  const state = store.getState();
  const token = state.auth.token;
  
  if (token) {
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = tokenData.exp * 1000;
      const now = Date.now();
      
      const timeUntilExpiration = expiresAt - now;
      const refreshBuffer = Math.min(300000, timeUntilExpiration * 0.1);
      const timeUntilRefresh = timeUntilExpiration - refreshBuffer;
      
      refreshTokenTimeout = setTimeout(() => {
        store.dispatch(refreshAuthToken());
      }, timeUntilRefresh);
    } catch (error) {
      console.error('Error scheduling token refresh:', error);
    }
  }
};
store.subscribe(() => {
  const state = store.getState();
  const tokenChanged = state.auth.token !== store.getState().auth.token;
  
  if (tokenChanged && state.auth.token) {
    scheduleTokenRefresh(store);
  }
});


scheduleTokenRefresh(store);

export default store;