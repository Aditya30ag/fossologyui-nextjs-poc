import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  
  login: (token, user) => set({ 
    token, 
    user, 
    isAuthenticated: true, 
    isLoading: false 
  }),
  
  logout: () => {
    // This will handle clearing state properly, and the interceptor handles cookies
    set({ 
      token: null, 
      user: null, 
      isAuthenticated: false, 
      isLoading: false 
    });
  },
  
  setLoading: (isLoading) => set({ isLoading }),
}));
