import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
  avatar?: string;
  company: string;
  department: string;
  lastLogin: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  clearError: () => void;
}

const MOCK_USERS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@ais.demo',
    password: 'admin123',
    role: 'admin' as const,
    company: 'RetailCo Analytics',
    department: 'Data Science',
    lastLogin: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'analyst@ais.demo',
    password: 'analyst123',
    role: 'analyst' as const,
    company: 'RetailCo Analytics',
    department: 'Business Intelligence',
    lastLogin: new Date().toISOString(),
  },
];

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const found = MOCK_USERS.find(u => u.email === email && u.password === password);
        if (found) {
          const { password: _, ...user } = found;
          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        } else {
          set({ error: 'Invalid email or password.', isLoading: false });
          return false;
        }
      },

      register: async (name: string, email: string, _password: string) => {
        set({ isLoading: true, error: null });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newUser: User = {
          id: Date.now().toString(),
          name,
          email,
          role: 'analyst',
          company: 'My Company',
          department: 'Analytics',
          lastLogin: new Date().toISOString(),
        };
        set({ user: newUser, isAuthenticated: true, isLoading: false });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },

      updateProfile: (updates) => {
        set(state => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'ais-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
