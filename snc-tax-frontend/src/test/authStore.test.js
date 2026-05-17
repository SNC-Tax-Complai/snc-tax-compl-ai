import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../stores/authStore';

// Mock the api module
vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  });

  describe('login', () => {
    it('should set loading state during login', async () => {
      const { default: api } = await import('../services/api');
      api.post.mockResolvedValue({
        data: { token: 'test-token', user: { id: '1', email: 'test@test.com' } },
      });

      const loginPromise = useAuthStore.getState().login('test@test.com', 'password');

      // During login
      expect(useAuthStore.getState().loading).toBe(true);

      await loginPromise;

      // After login
      expect(useAuthStore.getState().loading).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user).toEqual({ id: '1', email: 'test@test.com' });
    });

    it('should store token on successful login', async () => {
      const { default: api } = await import('../services/api');
      api.post.mockResolvedValue({
        data: { token: 'jwt-token-123', user: { id: '1' } },
      });

      await useAuthStore.getState().login('test@test.com', 'password');

      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'jwt-token-123');
    });

    it('should set error on failed login', async () => {
      const { default: api } = await import('../services/api');
      api.post.mockRejectedValue({
        response: { data: { message: 'Invalid credentials' } },
      });

      await expect(
        useAuthStore.getState().login('test@test.com', 'wrong')
      ).rejects.toBeDefined();

      expect(useAuthStore.getState().error).toBe('Invalid credentials');
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear user and token', () => {
      useAuthStore.setState({
        user: { id: '1', email: 'test@test.com' },
        isAuthenticated: true,
      });

      useAuthStore.getState().logout();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('fetchUser', () => {
    it('should fetch and set user on success', async () => {
      const { default: api } = await import('../services/api');
      api.get.mockResolvedValue({
        data: { id: '1', email: 'test@test.com', name: 'Test User' },
      });

      await useAuthStore.getState().fetchUser();

      expect(useAuthStore.getState().user).toEqual({
        id: '1', email: 'test@test.com', name: 'Test User',
      });
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('should clear auth state on fetch failure', async () => {
      const { default: api } = await import('../services/api');
      api.get.mockRejectedValue(new Error('Unauthorized'));

      useAuthStore.setState({ isAuthenticated: true });
      await useAuthStore.getState().fetchUser();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useAuthStore.setState({ error: 'Some error' });
      useAuthStore.getState().clearError();
      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});
