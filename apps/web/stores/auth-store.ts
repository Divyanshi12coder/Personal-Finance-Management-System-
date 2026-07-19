import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  currency: string;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  setSession: (accessToken: string, user: AuthUser) => void;
  clearSession: () => void;
}

/**
 * Access tokens are short-lived (15m) and kept only in memory (this store),
 * never in localStorage — mitigates XSS token theft. The refresh token
 * lives in an httpOnly cookie the JS layer never touches directly.
 */
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setSession: (accessToken, user) => set({ accessToken, user }),
  clearSession: () => set({ accessToken: null, user: null }),
}));
