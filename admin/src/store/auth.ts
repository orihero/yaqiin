import { create } from 'zustand';

interface User {
  id: string;
  username?: string;
  email?: string;
  role: string;
  status: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  hydrate: () => void;
}

export const LOCALSTORAGE_AUTH_KEY = 'admin_auth';

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  login: (token, user) => {
    set({ token, user, isAuthenticated: true });
    localStorage.setItem(LOCALSTORAGE_AUTH_KEY, JSON.stringify({ token, user }));
  },
  logout: () => {
    set({ token: null, user: null, isAuthenticated: false });
    localStorage.removeItem(LOCALSTORAGE_AUTH_KEY);
  },
  hydrate: () => {
    const data = localStorage.getItem(LOCALSTORAGE_AUTH_KEY);
    if (data) {
      const { token, user } = JSON.parse(data);
      set({ token, user, isAuthenticated: !!token });
    }
  },
}));

// Call hydrate on app load (can also be called in App.tsx)
useAuthStore.getState().hydrate(); 