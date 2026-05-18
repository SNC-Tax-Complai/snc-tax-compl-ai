import { create } from 'zustand';
import api from '../services/api';

export const useSettingsStore = create((set, get) => ({
  // AI Settings
  catalog: null,
  preferences: null,
  providerConfigs: [],
  loading: false,
  saving: false,
  error: null,
  testResult: null,

  fetchCatalog: async () => {
    try {
      const { data } = await api.get('/ai-settings/catalog');
      set({ catalog: data });
    } catch (err) {
      console.error('Failed to fetch catalog:', err.message);
    }
  },

  fetchSettings: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/ai-settings');
      set({ preferences: data.preferences, providerConfigs: data.providerConfigs, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  savePreferences: async (prefs) => {
    set({ saving: true });
    try {
      const { data } = await api.put('/ai-settings/preferences', prefs);
      set({ preferences: data.preferences, saving: false });
      return true;
    } catch (err) {
      set({ error: err.message, saving: false });
      return false;
    }
  },

  saveProviderConfig: async (providerId, config) => {
    set({ saving: true });
    try {
      const { data } = await api.put(`/ai-settings/provider/${providerId}`, config);
      set((state) => {
        const existing = state.providerConfigs.filter(c => c.provider !== providerId);
        return { providerConfigs: [...existing, data.config], saving: false };
      });
      return true;
    } catch (err) {
      set({ error: err.message, saving: false });
      return false;
    }
  },

  removeProviderConfig: async (providerId) => {
    try {
      await api.delete(`/ai-settings/provider/${providerId}`);
      set((state) => ({
        providerConfigs: state.providerConfigs.filter(c => c.provider !== providerId),
      }));
      return true;
    } catch (err) {
      set({ error: err.message });
      return false;
    }
  },

  testProvider: async (providerId) => {
    set({ testResult: { providerId, status: 'testing' } });
    try {
      const { data } = await api.post('/ai-settings/test', { providerId });
      set({ testResult: { providerId, ...data } });
      return data;
    } catch (err) {
      set({ testResult: { providerId, status: 'error', message: err.message } });
      return { status: 'error', message: err.message };
    }
  },

  clearError: () => set({ error: null }),
}));
