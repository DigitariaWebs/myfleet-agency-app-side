import React from 'react';
import { Pressable, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';

import { useTheme } from '@/hooks/useTheme';
import { shadows } from '@/theme/shadows';

export interface IconButtonProps {
  icon: LucideIcon;
  variant?: 'filled' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SIZE_CONFIG = {
  sm: { dimension: 32, iconSize: 16 },
  md: { dimension: 40, iconSize: 20 },
  lg: { dimension: 48, iconSize: 24 },
} as const;

export function IconButton({
  icon: Icon,
  variant = 'filled',
  size = 'md',
  color,
  onPress,
  disabled = false,
  className,
}: IconButtonProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sizeConfig = SIZE_CONFIG[size];

  const getVariantStyles = (): {
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    iconColor: string;
    shadow: ViewStyle;
  } => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: theme.accent,
          borderColor: 'transparent',
          borderWidth: 0,
          iconColor: color ?? '#FFFFFF',
          shadow: shadows.sm,
        };
      case 'outline':
        return {
          backgroundColor: theme.surface,
          borderColor: theme.accent,
          borderWidth: 1.5,
          iconColor: color ?? theme.accent,
          shadow: {},
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
          iconColor: color ?? theme.textSecondary,
          shadow: {},
        };
    }
  };

  const variantStyles = getVariantStyles();

  const containerStyle: ViewStyle = {
    width: sizeConfig.dimension,
    height: sizeConfig.dimension,
    borderRadius: sizeConfig.dimension / 2,
    backgroundColor: variantStyles.backgroundColor,
    borderColor: variantStyles.borderColor,
    borderWidth: variantStyles.borderWidth,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.5 : 1,
    ...variantStyles.shadow,
  };

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (disabled) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <AnimatedPressable
      style={[containerStyle, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      className={className}
    >
      <Icon size={sizeConfig.iconSize} color={variantStyles.iconColor} />
    </AnimatedPressable>
  );
}
