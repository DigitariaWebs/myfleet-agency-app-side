import { Platform } from 'react-native';

/**
 * Social authentication service.
 * Currently simulated — integrates with expo-apple-authentication and expo-auth-session
 * when backend is connected.
 */

export type SocialProvider = 'apple' | 'google' | 'facebook';

export interface SocialAuthResult {
  provider: SocialProvider;
  email: string;
  name: string;
  photoUrl?: string;
  providerId: string;
  idToken?: string;
}

/** Apple Sign-In — only available on iOS */
export async function signInWithApple(): Promise<SocialAuthResult> {
  if (Platform.OS !== 'ios') {
    throw new Error('Apple Sign-In is only available on iOS');
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Simulated response
  return {
    provider: 'apple',
    email: 'user@icloud.com',
    name: 'Apple User',
    providerId: 'apple-001',
    idToken: 'mock-apple-id-token',
  };
}

/** Google Sign-In */
export async function signInWithGoogle(): Promise<SocialAuthResult> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    provider: 'google',
    email: 'user@gmail.com',
    name: 'Google User',
    photoUrl: 'https://ui-avatars.com/api/?name=Google+User&size=128',
    providerId: 'google-001',
    idToken: 'mock-google-id-token',
  };
}

/** Facebook Login */
export async function signInWithFacebook(): Promise<SocialAuthResult> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    provider: 'facebook',
    email: 'user@facebook.com',
    name: 'Facebook User',
    photoUrl: 'https://ui-avatars.com/api/?name=Facebook+User&size=128',
    providerId: 'facebook-001',
  };
}

/** Check if Apple Sign-In is available (iOS only) */
export function isAppleSignInAvailable(): boolean {
  return Platform.OS === 'ios';
}
