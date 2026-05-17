import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      set({
        user: data.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({
        loading: false,
        error: errorMessage,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', {
        email: userData.email,
        password: userData.password,
        fullName: `${userData.firstName} ${userData.lastName}`,
        companyName: userData.companyName,
      });

      localStorage.setItem('token', data.token);
      set({
        user: data.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      set({
        loading: false,
        error: errorMessage,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false, error: null });
  },

  fetchUser: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data, isAuthenticated: true, error: null });
    } catch (error) {
      localStorage.removeItem('token');
      set({
        isAuthenticated: false,
        user: null,
        error: 'Session expired',
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
