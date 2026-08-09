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
  logout: () => void;
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
        try {
          await axios.post(
            `${getBaseUrl()}/auth/logout`,
            {},
            { 
              withCredentials: true,
              headers: { Authorization: `Bearer ${get().accessToken}` }
            }
          );
        } catch (error) {
          console.error("Logout API failed", error);
        } finally {
          set({ user: null, accessToken: null });
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
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
