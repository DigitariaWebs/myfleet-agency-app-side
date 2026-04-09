import React from 'react';
import { View, Text as RNText } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { fontFamilies } from '@/theme/typography';

export interface DividerProps {
  direction?: 'horizontal' | 'vertical';
  label?: string;
  className?: string;
}

export function Divider({
  direction = 'horizontal',
  label,
  className,
}: DividerProps) {
  const theme = useTheme();

  if (direction === 'vertical') {
    return (
      <View
        style={{ width: 1, backgroundColor: theme.border }}
        className={`self-stretch ${className ?? ''}`}
      />
    );
  }

  if (label) {
    return (
      <View className={`flex-row items-center ${className ?? ''}`}>
        <View
          style={{ backgroundColor: theme.border }}
          className="flex-1 h-px"
        />
        <RNText
          style={{
            fontFamily: fontFamilies.regular,
            fontSize: 12,
            color: theme.textTertiary,
          }}
          className="px-3"
        >
          {label}
        </RNText>
        <View
          style={{ backgroundColor: theme.border }}
          className="flex-1 h-px"
        />
      </View>
    );
  }

  return (
    <View
      style={{ backgroundColor: theme.border }}
      className={`w-full h-px ${className ?? ''}`}
    />
  );
}
