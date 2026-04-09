import React from 'react';
import { View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore, type Locale } from '@/stores/useSettingsStore';
import i18n from '@/i18n';

// ── Language options ────────────────────────────────────────────────────────

interface LanguageOption {
  code: Locale;
  label: string;
  flag: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'fr', label: 'Français', flag: 'FR' },
  { code: 'en', label: 'English', flag: 'EN' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function LanguageScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const currentLocale = useSettingsStore((s) => s.locale);

  const handleSelect = (code: Locale) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    i18n.changeLanguage(code);
    useSettingsStore.getState().setLocale(code);
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
          Langue
        </Text>
      </Animated.View>

      {/* Language cards */}
      {LANGUAGE_OPTIONS.map((option, index) => {
        const isSelected = currentLocale === option.code;

        return (
          <Animated.View
            key={option.code}
            entering={FadeInDown.duration(400).delay(50 + index * 80)}
            className="mb-3"
          >
            <Pressable
              onPress={() => handleSelect(option.code)}
              style={{
                backgroundColor: isSelected ? theme.accentSoft : theme.surface,
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? theme.accent : theme.border,
              }}
              className="rounded-2xl p-6 flex-row items-center"
            >
              <View
                style={{
                  backgroundColor: isSelected ? theme.accent : theme.surfaceTertiary,
                  width: 56,
                  height: 56,
                }}
                className="rounded-full items-center justify-center mr-4"
              >
                <Text
                  variant="headlineSmall"
                  color={isSelected ? '#0A0A0F' : theme.textSecondary}
                >
                  {option.flag}
                </Text>
              </View>
              <View className="flex-1">
                <Text
                  variant="headlineSmall"
                  color={isSelected ? theme.accent : theme.textPrimary}
                >
                  {option.label}
                </Text>
                {isSelected && (
                  <Text variant="bodySmall" color={theme.accent} className="mt-0.5">
                    Sélectionné
                  </Text>
                )}
              </View>
            </Pressable>
          </Animated.View>
        );
      })}
    </ScreenWrapper>
  );
}
