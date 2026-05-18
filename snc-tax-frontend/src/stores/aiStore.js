import { create } from 'zustand';
import api from '../services/api';

export const useAIStore = create((set, get) => ({
  messages: [],
  providers: [],
  activeProvider: null,
  loading: false,
  error: null,

  sendMessage: async (content) => {
    const userMsg = { role: 'user', content, timestamp: Date.now() };
    set((state) => ({
      messages: [...state.messages, userMsg],
      loading: true,
      error: null,
    }));

    try {
      const history = get().messages.map((m) => ({ role: m.role, content: m.content }));
      const { data } = await api.post('/ai/chat', { messages: history });

      const assistantMsg = {
        role: 'assistant',
        content: data.message,
        provider: data.provider,
        status: data.status,
        timestamp: Date.now(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMsg],
        loading: false,
      }));

      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      set({ loading: false, error: errorMsg });
      return { status: 'error', message: errorMsg };
    }
  },

  fetchProviders: async () => {
    try {
      const { data } = await api.get('/ai/providers');
      set({ providers: data.providers || [] });
      const active = data.providers?.find((p) => p.isDefault);
      if (active) set({ activeProvider: active.id });
    } catch (err) {
      console.error('Failed to fetch AI providers:', err.message);
    }
  },

  clearMessages: () => set({ messages: [], error: null }),
}));
