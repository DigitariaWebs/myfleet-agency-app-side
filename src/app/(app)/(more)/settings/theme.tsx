import React from 'react';
import { View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { ChevronLeft, Moon, Sun, Smartphone } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';

import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore, type ThemeMode } from '@/stores/useSettingsStore';

// ── Theme options ───────────────────────────────────────────────────────────

interface ThemeOption {
  mode: ThemeMode;
  label: string;
  icon: LucideIcon;
}

const THEME_OPTIONS: ThemeOption[] = [
  { mode: 'dark', label: 'Sombre', icon: Moon },
  { mode: 'light', label: 'Clair', icon: Sun },
  { mode: 'system', label: 'Système', icon: Smartphone },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function ThemeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const currentTheme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  const handleSelect = (mode: ThemeMode) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    useSettingsStore.getState().setTheme(mode);
  };

  return (
    <ScreenWrapper scroll>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="flex-row items-center pt-6 pb-4"
      >
        <Pressable
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          className="mr-3"
        >
          <ChevronLeft size={24} color={theme.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text variant="headlineLarge" className="flex-1">
          Thème
        </Text>
      </Animated.View>

      {/* Theme cards */}
      {THEME_OPTIONS.map((option, index) => {
        const isSelected = currentTheme === option.mode;
        const Icon = option.icon;

        return (
          <Animated.View
            key={option.mode}
            entering={FadeInDown.duration(400).delay(50 + index * 80)}
            className="mb-3"
          >
            <Pressable
              onPress={() => handleSelect(option.mode)}
              style={{
                backgroundColor: isSelected ? theme.accentSoft : theme.surface,
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? theme.accent : theme.border,
              }}
              className="rounded-2xl p-6 items-center"
            >
              <View
                style={{
                  backgroundColor: isSelected ? theme.accent : theme.surfaceTertiary,
                }}
                className="rounded-full p-4 mb-3"
              >
                <Icon
                  size={32}
                  color={isSelected ? '#0A0A0F' : theme.textSecondary}
                  strokeWidth={1.5}
                />
              </View>
              <Text
                variant="headlineSmall"
                color={isSelected ? theme.accent : theme.textPrimary}
              >
                {option.label}
              </Text>
              {isSelected && (
                <Text variant="bodySmall" color={theme.accent} className="mt-1">
                  Sélectionné
                </Text>
              )}
            </Pressable>
          </Animated.View>
        );
      })}
    </ScreenWrapper>
  );
}
