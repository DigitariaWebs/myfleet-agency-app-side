import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  signInWithApple,
  signInWithGoogle,
  signInWithFacebook,
  type SocialProvider,
} from '@/services/auth/socialAuth';

// ── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'employee' | 'client';
export type AuthProvider = 'email' | 'apple' | 'google' | 'facebook';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agencyId: string;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authProvider: AuthProvider;
  socialProfile?: {
    providerId: string;
    photoUrl?: string;
  };
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  loginWithSocial: (provider: SocialProvider) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

// ── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      authProvider: 'email',
      socialProfile: undefined,

      login: async (email: string, _password: string) => {
        set({ isLoading: true });

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Mock: emails containing "admin" get admin role, others get employee
        const isAdmin = email.toLowerCase().includes('admin');
        const role: UserRole = isAdmin ? 'admin' : 'employee';
        const name = isAdmin ? 'Admin User' : 'Agent Fleet';

        const user: AuthUser = {
          id: `user-${Date.now()}`,
          name,
          email,
          role,
          agencyId: 'agency-001',
        };

        set({ user, isAuthenticated: true, isLoading: false, authProvider: 'email' });
      },

      loginWithSocial: async (provider: SocialProvider) => {
        set({ isLoading: true });

        try {
          let result;
          switch (provider) {
            case 'apple':
              result = await signInWithApple();
              break;
            case 'google':
              result = await signInWithGoogle();
              break;
            case 'facebook':
              result = await signInWithFacebook();
              break;
          }

          const user: AuthUser = {
            id: `user-${provider}-${Date.now()}`,
            name: result.name,
            email: result.email,
            role: 'employee',
            agencyId: 'agency-001',
            avatar: result.photoUrl,
          };

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            authProvider: provider,
            socialProfile: {
              providerId: result.providerId,
              photoUrl: result.photoUrl,
            },
          });
        } catch {
          set({ isLoading: false });
          throw new Error(`${provider} sign-in failed`);
        }
      },

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          authProvider: 'email',
          socialProfile: undefined,
        }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'my-fleet-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        authProvider: state.authProvider,
        socialProfile: state.socialProfile,
      }),
    },
  ),
);
