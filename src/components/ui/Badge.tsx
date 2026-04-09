import React from 'react';
import { View, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import type { ColorScale } from '@/theme/colors';
import { Text } from './Text';

export interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const DOT_SIZES = { sm: 6, md: 8, lg: 10 } as const;

function getVariantColors(
  variant: NonNullable<BadgeProps['variant']>,
  theme: ColorScale,
): { text: string; background: string } {
  switch (variant) {
    case 'success':
      return { text: theme.success, background: theme.successSoft };
    case 'warning':
      return { text: theme.warning, background: theme.warningSoft };
    case 'danger':
      return { text: theme.danger, background: theme.dangerSoft };
    case 'info':
      return { text: theme.info, background: theme.infoSoft };
    case 'neutral':
      return { text: theme.textSecondary, background: theme.surfaceSecondary };
    case 'accent':
      return { text: theme.accent, background: theme.accentSoft };
  }
}

export function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  className,
}: BadgeProps) {
  const theme = useTheme();
  const colors = getVariantColors(variant, theme);

  if (dot) {
    const dotSize = DOT_SIZES[size];
    const dotStyle: ViewStyle = {
      width: dotSize,
      height: dotSize,
      borderRadius: dotSize / 2,
      backgroundColor: colors.text,
    };

    return <View style={dotStyle} className={className} />;
  }

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  const containerStyle: ViewStyle = {
    backgroundColor: colors.background,
    borderRadius: 9999,
    paddingHorizontal: isLarge ? 12 : isSmall ? 8 : 10,
    paddingVertical: isLarge ? 6 : isSmall ? 2 : 4,
    alignSelf: 'flex-start',
  };

  const fontSize = isLarge ? 14 : isSmall ? 10 : 12;

  return (
    <View style={containerStyle} className={className}>
      <Text
        variant={isLarge ? 'bodySmall' : 'labelSmall'}
        color={colors.text}
        style={{ fontSize }}
      >
        {children}
      </Text>
    </View>
  );
}
