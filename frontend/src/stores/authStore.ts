import { create } from 'zustand';
import { getAuthMe, logout, type AuthUser } from '../api/authApi';
import type { AuthState } from '../features/auth/types';

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading', user: null, csrfToken: null,
  hydrate: async () => { try { const result = await getAuthMe(); set({ status: result.authenticated ? 'authenticated' : 'unauthenticated', user: result.user, csrfToken: result.csrfToken || null }); } catch { set({ status: 'error', user: null, csrfToken: null }); } },
  setAuthenticated: (user: AuthUser, csrfToken = '') => set({ status: 'authenticated', user, csrfToken: csrfToken || null }),
  signOut: async () => { await logout(); set({ status: 'unauthenticated', user: null, csrfToken: null }); },
}));
