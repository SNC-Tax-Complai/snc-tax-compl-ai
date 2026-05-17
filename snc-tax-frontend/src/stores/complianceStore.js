import { create } from 'zustand';
import api from '../services/api';

export const useComplianceStore = create((set, get) => ({
  dashboardData: null,
  moduleData: null,
  requirementDetail: null,
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/compliance/dashboard');
      set({ dashboardData: data, loading: false });
      return data;
    } catch (error) {
      // Return fallback data for development
      const fallback = {
        complianceScore: 87,
        complianceTrend: 7,
        previousScore: 80,
        pendingFilings: 3,
        pendingTrend: -15,
        dueThisMonth: 2,
        actionRequired: true,
        allUpToDate: 14,
        upToDateTrend: 2,
      };
      set({ dashboardData: fallback, loading: false, error: error.message });
      return fallback;
    }
  },

  fetchModuleData: async (module) => {
    set({ loading: true, error: null, moduleData: null });
    try {
      const { data } = await api.get(`/compliance/${module}`);
      set({ moduleData: data, loading: false });
      return data;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  fetchRequirementDetail: async (requirementId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(`/compliance/requirement/${requirementId}`);
      set({ requirementDetail: data, loading: false });
      return data;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  updateComplianceStatus: async (statusId, updateData) => {
    try {
      const { data } = await api.put(`/compliance/${statusId}`, updateData);
      // Refresh dashboard data after status change
      get().fetchDashboardData();
      return data;
    } catch (error) {
      throw error;
    }
  },

  uploadDocument: async (statusId, file, metadata) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (metadata?.category) formData.append('category', metadata.category);
      if (metadata?.description) formData.append('description', metadata.description);

      const { data } = await api.post(`/compliance/${statusId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    } catch (error) {
      throw error;
    }
  },

  fetchNotifications: async () => {
    try {
      const { data } = await api.get('/notifications');
      set({
        notifications: data.notifications || [],
        unreadCount: data.unreadCount || 0,
      });
      return data;
    } catch (error) {
      set({ notifications: [], unreadCount: 0 });
    }
  },

  markNotificationRead: async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      const notifications = get().notifications.map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n
      );
      const unreadCount = notifications.filter((n) => !n.is_read).length;
      set({ notifications, unreadCount });
    } catch (error) {
      console.error('Failed to mark notification read:', error);
    }
  },

  generateReport: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/compliance/report/generate');
      set({ loading: false });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  clearModuleData: () => set({ moduleData: null, requirementDetail: null }),
}));
