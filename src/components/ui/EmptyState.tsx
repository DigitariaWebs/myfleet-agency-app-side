import React from 'react';
import { View, Pressable, Text as RNText } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { useTheme } from '@/hooks/useTheme';
import { fontFamilies } from '@/theme/typography';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View className={`flex items-center justify-center ${className ?? ''}`}>
      {Icon && (
        <View className="mb-4">
          <Icon size={64} color={theme.textTertiary} strokeWidth={1} />
        </View>
      )}

      <RNText
        style={{
          fontFamily: fontFamilies.semiBold,
          fontSize: 18,
          color: theme.textPrimary,
          textAlign: 'center',
        }}
      >
        {title}
      </RNText>

      {subtitle != null && (
        <RNText
          style={{
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            color: theme.textSecondary,
            textAlign: 'center',
          }}
          className="mt-2"
        >
          {subtitle}
        </RNText>
      )}

      {actionLabel != null && onAction != null && (
        <Pressable
          onPress={onAction}
          style={{ backgroundColor: theme.accent, borderRadius: 9999 }}
          className="mt-6 px-6 py-3"
        >
          <RNText
            style={{
              fontFamily: fontFamilies.semiBold,
              fontSize: 14,
              color: '#FFFFFF',
              textAlign: 'center',
            }}
          >
            {actionLabel}
          </RNText>
        </Pressable>
      )}
    </View>
  );
}
