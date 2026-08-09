import axios from 'axios';
import { useAuthStore } from './stores/authStore';

export function getChatBaseUrl() {
  if (process.env.NEXT_PUBLIC_CHAT_API_URL) {
    return process.env.NEXT_PUBLIC_CHAT_API_URL;
  }
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:8001/api/v1/chat`;
  }
  return 'http://localhost:8001/api/v1/chat';
}

export function getChatWsUrl() {
  if (process.env.NEXT_PUBLIC_CHAT_WS_URL) {
    return process.env.NEXT_PUBLIC_CHAT_WS_URL;
  }
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.hostname}:8001/ws/chat`;
  }
  return 'ws://localhost:8001/ws/chat';
}

const chatApi = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

chatApi.interceptors.request.use(
  (config) => {
    if (!config.baseURL) {
      config.baseURL = getChatBaseUrl();
    }
    const token = useAuthStore.getState().accessToken;
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

chatApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If it's a 401, we let the main API's authStore handle the refresh via standard api.ts calls
    // Usually the main api.ts handles refresh, we just throw the error here
    return Promise.reject(error);
  }
);

export default chatApi;
