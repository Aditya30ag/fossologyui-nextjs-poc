import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import Cookies from 'js-cookie';

// Create a generic Axios instance
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || '/api',
  timeout: 10000,
});

// Request Interceptor: Attach Token automatically
apiClient.interceptors.request.use(
  (config) => {
    // If the token is managed by js-cookie or zustand
    const token = Cookies.get('token') || useAuthStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling & Token Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 401 Unauthorized globally handles expired tokens
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Here we would implement token refresh logic
        const response = await axios.post('/api/auth/refresh', {}, {
          withCredentials: true // sending http-only refresh cookie
        });
        
        const newAccessToken = response.data.accessToken;
        Cookies.set('token', newAccessToken); // Alternatively update Zustand
        
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        // If refresh fails, log the user out via Zustand
        useAuthStore.getState().logout();
        Cookies.remove('token');
        if (typeof window !== 'undefined') {
           window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    // Global toast trigger can be added here for 403, 500, etc.
    return Promise.reject(error);
  }
);
