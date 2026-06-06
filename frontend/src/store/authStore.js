import { create } from 'zustand';
import { authApi } from '../api/auth';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('vb_user') || 'null'),
  token: localStorage.getItem('vb_token'),
  loading: false,
  error: null,

  setSession: (user, token) => {
    localStorage.setItem('vb_token', token);
    localStorage.setItem('vb_user', JSON.stringify(user));
    set({ user, token, error: null });
  },

  clearSession: () => {
    localStorage.removeItem('vb_token');
    localStorage.removeItem('vb_user');
    set({ user: null, token: null, error: null });
  },

  logout: () => {
    localStorage.removeItem('vb_token');
    localStorage.removeItem('vb_user');
    set({ user: null, token: null, error: null });
  },

  fetchMe: async () => {
    try {
      const { data } = await authApi.getMe();
      localStorage.setItem('vb_user', JSON.stringify(data));
      set({ user: data });
      return data;
    } catch {
      set({ user: null, token: null });
      localStorage.removeItem('vb_token');
      localStorage.removeItem('vb_user');
      return null;
    }
  },
}));
