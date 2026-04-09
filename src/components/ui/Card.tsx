import React, { useCallback } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/hooks/useTheme';
import { shadows } from '@/theme/shadows';

// ── Types ────────────────────────────────────────────────────────────────────

export interface CardProps {
  variant?: 'default' | 'elevated' | 'glass' | 'accent';
  pressable?: boolean;
  onPress?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const paddingMap: Record<NonNullable<CardProps['padding']>, number> = {
  none: 0,
  sm: 12,
  md: 16,
  lg: 24,
};

// ── Component ────────────────────────────────────────────────────────────────

export function Card({
  variant = 'default',
  pressable = false,
  onPress,
  padding = 'md',
  children,
  className = '',
}: CardProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handlePress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  }, [onPress]);

  const isGradient = variant === 'accent';

  // -- Non-gradient variant styles ------------------------------------------

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: theme.surface,
          borderRadius: 20,
          ...shadows.md,
        };
      case 'glass':
        return {
          backgroundColor: theme.surfaceSecondary,
          borderWidth: 1,
          borderColor: theme.borderLight,
          borderRadius: 20,
        };
      case 'accent':
        return {
          borderRadius: 20,
          ...shadows.accent,
        };
      case 'default':
      default:
        return {
          backgroundColor: theme.surface,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 20,
          ...shadows.sm,
        };
    }
  };

  const variantStyle = getVariantStyle();

  // -- Accent gradient card -------------------------------------------------

  if (isGradient) {
    const wrapperStyle: ViewStyle = {
      borderRadius: 20,
      overflow: 'hidden',
      ...shadows.accent,
    };

    const content = (
      <LinearGradient
        colors={[theme.accentGradientStart, theme.accentGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 20,
          padding: paddingMap[padding],
          overflow: 'hidden',
        }}
      >
        {children}
      </LinearGradient>
    );

    if (pressable) {
      return (
        <AnimatedPressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[wrapperStyle, animatedStyle]}
          className={className}
        >
          {content}
        </AnimatedPressable>
      );
    }

    return (
      <View style={wrapperStyle} className={className}>
        {content}
      </View>
    );
  }

  // -- Standard cards -------------------------------------------------------

  const baseStyle: ViewStyle = {
    padding: paddingMap[padding],
    overflow: 'hidden',
    ...variantStyle,
  };

  if (pressable) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[baseStyle, animatedStyle]}
        className={className}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View style={baseStyle} className={className}>
      {children}
    </View>
  );
}
