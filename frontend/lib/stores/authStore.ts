import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:8000/api/v1`;
  }
  return 'http://localhost:8000/api/v1';
}

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  login: (user: User, accessToken: string) => void;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      
      login: (user, accessToken) => 
        set({ user, accessToken }),
        
      logout: async () => {
        const token = get().accessToken;

        // 1. Immediately reset memory state
        set({ user: null, accessToken: null });

        // 2. Immediately clear client persistence stores
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('auth-storage');
            sessionStorage.clear();
          } catch (e) {
            console.error('Storage clear error:', e);
          }
        }

        // 3. Best-effort notify backend to revoke refresh token and clear cookies
        try {
          await axios.post(
            `${getBaseUrl()}/auth/logout`,
            {},
            { 
              withCredentials: true,
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            }
          );
        } catch (error) {
          console.warn("Backend logout notification finished or skipped:", error);
        }
      },
        
      refreshToken: async () => {
        try {
          const res = await axios.post(
            `${getBaseUrl()}/auth/refresh`,
            {},
            { withCredentials: true }
          );
          set({ accessToken: res.data.data.access_token });
        } catch (error) {
          set({ user: null, accessToken: null });
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem('auth-storage');
            } catch (e) {
              console.error(e);
            }
          }
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
