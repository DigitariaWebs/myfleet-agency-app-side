/**
 * Design tokens — Light luxury + Purple accent palette.
 * Light theme is PRIMARY. Dark theme is secondary toggle.
 */

export interface ColorScale {
  readonly background: string;
  readonly backgroundPure: string;
  readonly surface: string;
  readonly surfaceSecondary: string;
  readonly surfaceTertiary: string;
  readonly border: string;
  readonly borderLight: string;

  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly textTertiary: string;
  readonly textInverse: string;

  readonly accent: string;
  readonly accentLight: string;
  readonly accentSoft: string;
  readonly accentGradientStart: string;
  readonly accentGradientEnd: string;

  readonly navBar: string;
  readonly navBarActive: string;
  readonly navBarInactive: string;

  readonly success: string;
  readonly successSoft: string;
  readonly warning: string;
  readonly warningSoft: string;
  readonly danger: string;
  readonly dangerSoft: string;
  readonly info: string;
  readonly infoSoft: string;

  readonly overlay: string;
}

export interface ColorPalette {
  readonly light: ColorScale;
  readonly dark: ColorScale;
}

const statusColors = {
  success: '#10B981',
  successSoft: '#10B98115',
  warning: '#F59E0B',
  warningSoft: '#F59E0B15',
  danger: '#EF4444',
  dangerSoft: '#EF444415',
  info: '#3B82F6',
  infoSoft: '#3B82F615',
} as const;

const accentColors = {
  accent: '#7C3AED',
  accentLight: '#8B5CF6',
  accentSoft: '#7C3AED15',
  accentGradientStart: '#7C3AED',
  accentGradientEnd: '#A855F7',
} as const;

export const colors: ColorPalette = {
  light: {
    background: '#F8F8FC',
    backgroundPure: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceSecondary: '#F2F1F6',
    surfaceTertiary: '#EAE9F0',
    border: '#E5E4EB',
    borderLight: '#F0EFF5',

    textPrimary: '#1A1A2E',
    textSecondary: '#6E6E82',
    textTertiary: '#9D9DAF',
    textInverse: '#FFFFFF',

    ...accentColors,

    navBar: '#1A1A2E',
    navBarActive: '#7C3AED',
    navBarInactive: '#6E6E82',

    ...statusColors,

    overlay: 'rgba(26, 26, 46, 0.5)',
  },

  dark: {
    background: '#0F0F1A',
    backgroundPure: '#1A1A2E',
    surface: '#1A1A2E',
    surfaceSecondary: '#252540',
    surfaceTertiary: '#2F2F4A',
    border: '#3A3A55',
    borderLight: '#2A2A45',

    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0B8',
    textTertiary: '#6E6E85',
    textInverse: '#1A1A2E',

    ...accentColors,

    navBar: '#1E1835',
    navBarActive: '#A78BFA',
    navBarInactive: '#7E7E95',

    ...statusColors,

    overlay: 'rgba(0, 0, 0, 0.65)',
  },
} as const;
