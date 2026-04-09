import { useColorScheme } from 'react-native';

import { colors, type ColorScale } from '@/theme/colors';
import { useSettingsStore } from '@/stores/useSettingsStore';

/**
 * Returns the active color palette. Light theme is primary.
 * When set to 'system', follows device preference (defaults to light).
 */
export function useTheme(): ColorScale {
  const themeMode = useSettingsStore((s) => s.theme);
  const systemScheme = useColorScheme();

  if (themeMode === 'dark') return colors.dark;
  if (themeMode === 'light') return colors.light;

  // 'system' — follow device, default to light
  return systemScheme === 'dark' ? colors.dark : colors.light;
}
