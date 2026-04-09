import React, { useEffect } from 'react';
import { View, Text as RNText } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Car } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/hooks/useTheme';
import { fontFamilies } from '@/theme/typography';

export interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + pulse.value * 0.7,
    transform: [{ scale: 0.95 + pulse.value * 0.1 }],
  }));

  const displayMessage = message ?? t('common.loading');

  return (
    <View
      style={{ backgroundColor: theme.background }}
      className="flex-1 items-center justify-center"
    >
      <Animated.View style={animatedStyle}>
        <Car size={48} color={theme.accent} />
      </Animated.View>

      <RNText
        style={{
          fontFamily: fontFamilies.regular,
          fontSize: 14,
          color: theme.textSecondary,
        }}
        className="mt-4"
      >
        {displayMessage}
      </RNText>
    </View>
  );
}
