import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = 'http://localhost:8787/api/auth'; 

const initialState = {
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  user: null,
  roles: {
    realmRoles: [],
    clientRoles: []
  },
  realisateurs: [],
  isActive: false,
  loading: false,
  error: null,
};

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      const refreshToken = sessionStorage.getItem("refreshToken");
      if (!token) {
        return { 
          isAuthenticated: false, 
          token: null, 
          refreshToken: null, 
          isActive: false,
          user: null,
          roles: { realmRoles: [], clientRoles: [] }
        };
      }

      if (!token) {
        return { isAuthenticated: false, token: null, refreshToken: null, isActive: false };
      }

      try {
     
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
         
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("refreshToken");
          return { isAuthenticated: false, token: null, refreshToken: null, isActive: false };
        }

            let userd = null;
              let isActiveuserd = false;

              try { 
                const userInfo = await axios.get(`${API_BASE_URL}/userinfo`, {
                  headers: { Authorization: `Bearer ${token}` },
                  timeout: 5000,
                  validateStatus: () => true  
                }).catch(() => null);

                if (userInfo?.data) {
                  userd = userInfo.data;
                }
              } catch (e) {
                console.warn("User info fetch failed silently");
              }

        return {
          isAuthenticated: true,
          token,
          refreshToken,
          user:userd,
          isActive: isActiveuserd,
          roles: {
            realmRoles: decodedToken.realm_access?.roles || [],
            clientRoles: decodedToken.resource_access?.["pfe-rest-api"]?.roles || [],
          },
        };
      } catch (tokenError) {
        console.error("Token validation failed:", tokenError);
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("refreshToken");
        return { isAuthenticated: false, token: null, refreshToken: null, isActive: false };
      }
    } catch (error) {
      return rejectWithValue("Failed to initialize authentication");
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {

      const response = await axios.post(`${API_BASE_URL}/login`, {
        username,
        password
      });

      const { access_token, refresh_token, user } = response.data;

      if (!access_token) {
        return rejectWithValue('No access token received');
      }


      const decodedToken = jwtDecode(access_token);
      const realmRoles = decodedToken.realm_access?.roles || [];
      const clientRoles = decodedToken.resource_access?.["pfe-rest-api"]?.roles || [];

      sessionStorage.setItem("token", access_token);
      sessionStorage.setItem("refreshToken", refresh_token);

      return {
        token: access_token,
        refreshToken: refresh_token,
        user,
        roles: { realmRoles, clientRoles }
      };
    } catch (error) {
      console.error("Login error:", error);
      return rejectWithValue(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Login failed'
      );
    }
  }
);


export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { refreshToken, token } = getState().auth;
      
      if ( token) {
        const params = new URLSearchParams();
        params.append('refreshToken', refreshToken);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
          await axios.post(`${API_BASE_URL}/logout`, params, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Bearer ${token}`
            },
            signal: controller.signal
          });
          clearTimeout(timeoutId);
        } catch (apiError) {
          console.warn("Backend logout failed:", apiError);

        }
      }

      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      
      return true;
    } catch (error) {
      console.error("Logout error:", error);

      return true;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    immediateLogout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.roles = { realmRoles: [], clientRoles: [] };
      state.isActive = false;
      state.loading = false;
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
    },
    setActiveStatus: (state, action) => {
      state.isActive = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
 
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.roles = action.payload.roles;
        state.isActive = action.payload.isActive || true; 
        
        sessionStorage.setItem('token', action.payload.token);
        sessionStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isActive = false;
      })

      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.roles = action.payload.roles || { realmRoles: [], clientRoles: [] };
        state.isActive = action.payload.isActive || false;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload || "Authentication initialization failed";
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.roles = { realmRoles: [], clientRoles: [] };
        state.isActive = false;
      })

      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.isAuthenticated = false;
        state.isActive = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.user = null;
        state.roles = { realmRoles: [], clientRoles: [] };
        state.isActive = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.user = null;
        state.roles = { realmRoles: [], clientRoles: [] };
        state.isActive = false;
        state.loading = false;
      })

      .addCase(refreshAuthToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.roles = action.payload.roles;
      })
  },
});

export const { clearAuthError, immediateLogout, setActiveStatus } = authSlice.actions;
export const selectRealisateurs = (state) => state.auth.realisateurs;
export const selectHasRole = (state, allowedRoles) => {
  const { roles } = state.auth;
  return allowedRoles.some(role => 
    roles.realmRoles.includes(role) || 
    roles.clientRoles.includes(role)
  );
};
export default authSlice.reducer;
export const refreshAuthToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { refreshToken } = getState().auth;
      
      if (!refreshToken) {
        return rejectWithValue('No refresh token available');
      }
      
      const response = await axios.post(`${API_BASE_URL}/refresh`, {
        refreshToken
      });
      
      const { access_token, refresh_token } = response.data;
            sessionStorage.setItem('token', access_token);
      sessionStorage.setItem('refreshToken', refresh_token);
      
      const decodedToken = jwtDecode(access_token);
      const realmRoles = decodedToken.realm_access?.roles || [];
      const clientRoles = decodedToken.resource_access?.["pfe-rest-api"]?.roles || [];
      
      return {
        token: access_token,
        refreshToken: refresh_token,
        roles: {
          realmRoles,
          clientRoles
        }
      };
    } catch (error) {
      
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      return rejectWithValue('Token refresh failed');
    }
  }
);