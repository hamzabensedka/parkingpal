import { create } from 'zustand';
import type { AdminUser, AdminPermissions } from '@/types';
import { adminApi } from '@/lib/api/admin.api';

interface AuthState {
  admin: AdminUser | null;
  permissions: AdminPermissions | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  permissions: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    const result = await adminApi.login(email, password);

    localStorage.setItem('admin_access_token', result.tokens.accessToken);
    localStorage.setItem('admin_refresh_token', result.tokens.refreshToken);

    // Fetch full profile with permissions
    const profile = await adminApi.getProfile();

    set({
      admin: profile.user,
      permissions: profile.permissions,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    set({
      admin: null,
      permissions: null,
      isAuthenticated: false,
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('admin_access_token');

    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const profile = await adminApi.getProfile();
      set({
        admin: profile.user,
        permissions: profile.permissions,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      set({
        admin: null,
        permissions: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
