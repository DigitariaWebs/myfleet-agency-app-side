import React from 'react';
import { View, Pressable, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Shield, ShieldCheck } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/hooks/useTheme';

// ── Types ─────────────────────────────────────────────────────────────────────

interface InsuranceSelectorProps {
  selectedTier: 'basic' | 'all_inclusive';
  onSelect: (tier: 'basic' | 'all_inclusive') => void;
  rentalDays: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function InsuranceSelector({
  selectedTier,
  onSelect,
  rentalDays,
}: InsuranceSelectorProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const handleSelect = (tier: 'basic' | 'all_inclusive') => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(tier);
  };

  // ── Shared styles ────────────────────────────────────────────────

  const getCardStyle = (isSelected: boolean): ViewStyle => ({
    backgroundColor: theme.surface,
    borderWidth: isSelected ? 2 : 1,
    borderColor: isSelected ? theme.accent : theme.border,
    borderRadius: 16,
    padding: 16,
  });

  const radioDotOuter: ViewStyle = {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const radioDotOuterActive: ViewStyle = {
    ...radioDotOuter,
    borderColor: theme.accent,
  };

  const radioDotInner: ViewStyle = {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.accent,
  };

  // ── Render ───────────────────────────────────────────────────────

  const isBasicSelected = selectedTier === 'basic';
  const isAllInclusiveSelected = selectedTier === 'all_inclusive';
  const allInclusiveTotal = 25 * rentalDays;

  return (
    <View>
      {/* Basic Insurance */}
      <Pressable
        onPress={() => handleSelect('basic')}
        style={getCardStyle(isBasicSelected)}
        className="mb-3"
      >
        <View className="flex-row items-center">
          {/* Radio */}
          <View style={isBasicSelected ? radioDotOuterActive : radioDotOuter}>
            {isBasicSelected && <View style={radioDotInner} />}
          </View>

          {/* Icon */}
          <View className="ml-3">
            <Shield size={24} color={theme.textTertiary} strokeWidth={1.8} />
          </View>

          {/* Content */}
          <View className="flex-1 ml-3">
            <View className="flex-row items-center">
              <Text variant="titleMedium" className="flex-1">
                {t('insurance.basicTitle', { defaultValue: 'Basic Insurance' })}
              </Text>
              <Badge variant="success" size="sm">
                {t('insurance.included', { defaultValue: 'Included' })}
              </Badge>
            </View>
          </View>
        </View>

        <Text
          variant="bodySmall"
          color={theme.textSecondary}
          className="mt-2 ml-[58px]"
        >
          {t('insurance.basicDescription', {
            defaultValue: 'Covers third-party liability. Excess: CHF 1,500',
          })}
        </Text>
      </Pressable>

      {/* All-Inclusive Insurance */}
      <View>
        <Text
          variant="labelSmall"
          color={theme.accent}
          className="mb-1 ml-2"
          style={{ letterSpacing: 1.2 }}
        >
          {t('insurance.recommended', { defaultValue: 'RECOMMENDED' })}
        </Text>

        <Pressable
          onPress={() => handleSelect('all_inclusive')}
          style={getCardStyle(isAllInclusiveSelected)}
        >
          <View className="flex-row items-center">
            {/* Radio */}
            <View
              style={
                isAllInclusiveSelected ? radioDotOuterActive : radioDotOuter
              }
            >
              {isAllInclusiveSelected && <View style={radioDotInner} />}
            </View>

            {/* Icon */}
            <View className="ml-3">
              <ShieldCheck size={24} color={theme.accent} strokeWidth={1.8} />
            </View>

            {/* Content */}
            <View className="flex-1 ml-3">
              <View className="flex-row items-center">
                <Text variant="titleMedium" className="flex-1">
                  {t('insurance.allInclusiveTitle', {
                    defaultValue: 'All-Inclusive',
                  })}
                </Text>
                <Badge variant="accent" size="sm">
                  {t('insurance.allInclusivePrice', {
                    defaultValue: '+CHF 25/day',
                  })}
                </Badge>
              </View>
            </View>
          </View>

          <Text
            variant="bodySmall"
            color={theme.textSecondary}
            className="mt-2 ml-[58px]"
          >
            {t('insurance.allInclusiveDescription', {
              defaultValue:
                'Zero excess. Covers all damages including glass, tires, and personal effects.',
            })}
          </Text>

          {isAllInclusiveSelected && rentalDays > 0 && (
            <View
              className="mt-3 ml-[58px]"
              style={{
                backgroundColor: theme.accentSoft,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
                alignSelf: 'flex-start',
              }}
            >
              <Text variant="labelSmall" color={theme.accent}>
                {t('insurance.total', {
                  defaultValue: 'Total: CHF {{amount}}',
                  amount: allInclusiveTotal,
                })}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}
