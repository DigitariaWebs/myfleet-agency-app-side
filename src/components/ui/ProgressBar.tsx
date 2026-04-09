import React, { useEffect } from 'react';
import { View, Text as RNText } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { fontFamilies } from '@/theme/typography';

export interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string; // override fill color, defaults to accent
  label?: string;
  showPercentage?: boolean;
  height?: number; // defaults to 6
  className?: string;
}

export function ProgressBar({
  progress,
  color,
  label,
  showPercentage = false,
  height = 6,
  className,
}: ProgressBarProps) {
  const theme = useTheme();
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const fillColor = color ?? theme.accent;

  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(clampedProgress, { duration: 600 });
  }, [clampedProgress, animatedWidth]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value * 100}%`,
  }));

  const showHeader = label != null || showPercentage;

  return (
    <View className={className}>
      {showHeader && (
        <View className="flex-row justify-between mb-2">
          {label != null && (
            <RNText
              style={{
                fontFamily: fontFamilies.medium,
                fontSize: 12,
                color: theme.textPrimary,
              }}
            >
              {label}
            </RNText>
          )}
          {showPercentage && (
            <RNText
              style={{
                fontFamily: fontFamilies.regular,
                fontSize: 12,
                color: theme.textSecondary,
              }}
            >
              {Math.round(clampedProgress * 100)}%
            </RNText>
          )}
        </View>
      )}

      <View
        style={{
          height,
          backgroundColor: theme.surfaceTertiary,
          borderRadius: 9999,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[
            {
              height,
              backgroundColor: fillColor,
              borderRadius: 9999,
            },
            fillStyle,
          ]}
        />
      </View>
    </View>
  );
}
