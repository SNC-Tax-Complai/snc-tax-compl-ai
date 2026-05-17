import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useComplianceStore } from '../stores/complianceStore';

// Mock the api module
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('useComplianceStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useComplianceStore.setState({
      dashboardData: null,
      moduleData: null,
      requirementDetail: null,
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
    });
  });

  describe('fetchDashboardData', () => {
    it('should fetch and set dashboard data', async () => {
      const { default: api } = await import('../services/api');
      const mockData = {
        complianceScore: 92,
        pendingFilings: 2,
        dueThisMonth: 1,
        allUpToDate: 15,
      };
      api.get.mockResolvedValue({ data: mockData });

      await useComplianceStore.getState().fetchDashboardData();

      expect(useComplianceStore.getState().dashboardData).toEqual(mockData);
      expect(useComplianceStore.getState().loading).toBe(false);
    });

    it('should use fallback data on API failure', async () => {
      const { default: api } = await import('../services/api');
      api.get.mockRejectedValue(new Error('Network Error'));

      await useComplianceStore.getState().fetchDashboardData();

      const state = useComplianceStore.getState();
      expect(state.dashboardData).toBeDefined();
      expect(state.dashboardData.complianceScore).toBe(87);
      expect(state.loading).toBe(false);
    });
  });

  describe('fetchModuleData', () => {
    it('should fetch module-specific data', async () => {
      const { default: api } = await import('../services/api');
      const mockData = {
        module: 'income_tax',
        requirements: [{ id: '1', name: 'ITR14' }],
      };
      api.get.mockResolvedValue({ data: mockData });

      await useComplianceStore.getState().fetchModuleData('income_tax');

      expect(api.get).toHaveBeenCalledWith('/compliance/income_tax');
      expect(useComplianceStore.getState().moduleData).toEqual(mockData);
    });

    it('should throw on failure', async () => {
      const { default: api } = await import('../services/api');
      api.get.mockRejectedValue(new Error('Not found'));

      await expect(
        useComplianceStore.getState().fetchModuleData('nonexistent')
      ).rejects.toThrow('Not found');
    });
  });

  describe('notifications', () => {
    it('should fetch notifications and set unread count', async () => {
      const { default: api } = await import('../services/api');
      api.get.mockResolvedValue({
        data: {
          notifications: [
            { id: '1', title: 'Overdue', is_read: false },
            { id: '2', title: 'Reminder', is_read: true },
          ],
          unreadCount: 1,
        },
      });

      await useComplianceStore.getState().fetchNotifications();

      expect(useComplianceStore.getState().notifications).toHaveLength(2);
      expect(useComplianceStore.getState().unreadCount).toBe(1);
    });

    it('should mark notification as read', async () => {
      const { default: api } = await import('../services/api');
      api.put.mockResolvedValue({});

      useComplianceStore.setState({
        notifications: [
          { id: '1', title: 'Alert', is_read: false },
          { id: '2', title: 'Info', is_read: false },
        ],
        unreadCount: 2,
      });

      await useComplianceStore.getState().markNotificationRead('1');

      const state = useComplianceStore.getState();
      expect(state.notifications[0].is_read).toBe(true);
      expect(state.unreadCount).toBe(1);
    });
  });

  describe('clearModuleData', () => {
    it('should clear module and requirement data', () => {
      useComplianceStore.setState({
        moduleData: { module: 'vat' },
        requirementDetail: { id: '1' },
      });

      useComplianceStore.getState().clearModuleData();

      expect(useComplianceStore.getState().moduleData).toBeNull();
      expect(useComplianceStore.getState().requirementDetail).toBeNull();
    });
  });

  describe('generateReport', () => {
    it('should request report generation', async () => {
      const { default: api } = await import('../services/api');
      api.get.mockResolvedValue({
        data: { report: { score: 87, modules: [] } },
      });

      const result = await useComplianceStore.getState().generateReport();

      expect(api.get).toHaveBeenCalledWith('/compliance/report/generate');
      expect(result).toHaveProperty('report');
    });
  });
});
