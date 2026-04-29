import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginWithEmail } from '@/services/authService';
import {
  signInWithApple,
  signInWithGoogle,
  signInWithFacebook,
  type SocialProvider,
} from '@/services/authService';

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
  accessToken?: string;
  refreshToken?: string;
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
      accessToken: undefined,
      refreshToken: undefined,
      socialProfile: undefined,

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          const result = await loginWithEmail(email.trim().toLowerCase(), password);
          const user: AuthUser = {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
            agencyId: result.user.agencyId,
            avatar: result.user.avatar,
          };

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            authProvider: 'email',
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
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
            accessToken: undefined,
            refreshToken: undefined,
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
          accessToken: undefined,
          refreshToken: undefined,
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
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        socialProfile: state.socialProfile,
      }),
    },
  ),
);
