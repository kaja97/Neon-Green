import axios from 'axios';
import { useAuthStore } from './stores/authStore';

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:8000/api/v1`;
  }
  return 'http://localhost:8000/api/v1';
}

const api = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshTokenPromise: Promise<void> | null = null;

api.interceptors.request.use(
  (config) => {
    // Dynamically set baseURL on every request (not at module load time)
    // This ensures it uses the browser's actual hostname, not SSR's "localhost"
    if (!config.baseURL) {
      config.baseURL = getBaseUrl();
    }
    const token = useAuthStore.getState().accessToken;
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Format 422 validation errors to be human-readable
    if (error.response?.status === 422 && error.response?.data?.error?.details) {
      const details = error.response.data.error.details;
      if (Array.isArray(details)) {
        const readableMessage = details.map((d: any) => {
          const field = d.field?.split(' → ').pop() || 'Field';
          return `${field}: ${d.message}`;
        }).join(' | ');
        error.response.data.error.message = readableMessage;
      }
    }

    const originalRequest = error.config;
    
    // Do not intercept 401s for login or refresh endpoints
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/refresh');
    
    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Several requests can expire together. Refresh once, then retry every
      // affected request with the same new access token.
      if (!refreshTokenPromise) {
        refreshTokenPromise = useAuthStore.getState().refreshToken().finally(() => {
          refreshTokenPromise = null;
        });
      }

      await refreshTokenPromise;
      const newToken = useAuthStore.getState().accessToken;
      if (!newToken) {
        throw new Error('Refresh completed without an access token');
      }

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    }
  }
);

export default api;
