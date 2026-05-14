import { create } from 'zustand';
import api from '../services/api';

export const useComplianceStore = create((set) => ({
  data: null,
  loading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/compliance/dashboard');
      set({
        data: {
          complianceScore: data.complianceScore || 87,
          complianceTrend: data.complianceTrend || 7,
          previousScore: data.previousScore || 80,
          pendingFilings: data.pendingFilings || 3,
          pendingTrend: data.pendingTrend || -15,
          dueThisMonth: data.dueThisMonth || 2,
          actionRequired: data.actionRequired || true,
          allUpToDate: data.allUpToDate || 14,
          upToDateTrend: data.upToDateTrend || 2,
        },
        loading: false,
        error: null,
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchComplianceStatus: async (module) => {
    try {
      const { data } = await api.get(`/compliance/${module}`);
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateComplianceStatus: async (requirementId, status) => {
    try {
      const { data } = await api.put(`/compliance/${requirementId}`, { status });
      set({ error: null });
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
}));
