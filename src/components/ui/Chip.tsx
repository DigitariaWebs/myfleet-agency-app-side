import React, { useCallback } from 'react';
import { Pressable, Text, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';

import { useTheme } from '@/hooks/useTheme';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  leftIcon?: LucideIcon;
  className?: string;
}

export interface ChipGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function Chip({
  label,
  selected = false,
  onPress,
  leftIcon: LeftIcon,
  className = '',
}: ChipProps) {
  const theme = useTheme();

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  }, [onPress]);

  const backgroundColor = selected ? theme.accent : theme.surfaceSecondary;
  const textColor = selected ? '#FFFFFF' : theme.textSecondary;
  const borderColor = selected ? 'transparent' : theme.borderLight;
  const borderWidth = selected ? 0 : 1;

  return (
    <Pressable
      onPress={handlePress}
      className={`rounded-full flex-row items-center px-3.5 py-1.5 ${className}`}
      style={{
        backgroundColor,
        borderWidth,
        borderColor,
      }}
    >
      {LeftIcon ? (
        <LeftIcon
          size={14}
          color={textColor}
          style={{ marginRight: 6 }}
        />
      ) : null}
      <Text
        style={{
          fontFamily: 'Poppins_500Medium',
          fontSize: 13,
          color: textColor,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function ChipGroup({ children, className = '' }: ChipGroupProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={className}
      contentContainerStyle={{ gap: 8 }}
    >
      {children}
    </ScrollView>
  );
}
