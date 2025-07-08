import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth2Slice';
import { apiSlice } from "../api/apiSlice";
import notificationReducer from './notificationSlice';
import demandeReducer from './DemandeSlice';
import { notificationQuerySlice } from './notificationQuerySlice';
import { demandeApiSlice } from './demandeApiSlice ';
import { refreshAuthToken } from './auth2Slice';  

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
    demandes: demandeReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [notificationQuerySlice.reducerPath]: notificationQuerySlice.reducer,
    [demandeApiSlice.reducerPath]: demandeApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      apiSlice.middleware,
      notificationQuerySlice.middleware,
      demandeApiSlice.middleware
    ),
  devTools: process.env.NODE_ENV !== 'production',
});
 
let refreshTokenTimeout;
let previousToken = null; 

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
       
      if (timeUntilRefresh > 0) {
        refreshTokenTimeout = setTimeout(() => {
          store.dispatch(refreshAuthToken());
        }, timeUntilRefresh);
      }
    } catch (error) {
      console.error('Error scheduling token refresh:', error);
    }
  }
};

store.subscribe(() => {
  const state = store.getState();
  const currentToken = state.auth.token;
   
  if (currentToken !== previousToken) {
    previousToken = currentToken;
    if (currentToken) {
      scheduleTokenRefresh(store);
    }
  }
});

scheduleTokenRefresh(store);

export default store;
