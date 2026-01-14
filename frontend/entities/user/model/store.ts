import { create } from 'zustand';
import { User, UserState } from './types';

interface UserStore extends UserState {
  setUser: (user: User, token: string) => void;
  clearUser: () => void;
  updateUser: (user: Partial<User>) => void;
}

/**
 * Zustand store для управления состоянием пользователя
 */
export const useUserStore = create<UserStore>((set) => ({
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
  setUser: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    }
    set({
      user,
      token,
      isAuthenticated: true,
    });
  },
  clearUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
  updateUser: (updates) =>
    set((state) => {
      const updatedUser = state.user ? { ...state.user, ...updates } : null;
      if (updatedUser && typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      return {
        user: updatedUser,
      };
    }),
}));
