import React, { useState, useCallback, useEffect } from 'react';
import { TextInput, View, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Search, X } from 'lucide-react-native';

import { useTheme } from '@/hooks/useTheme';
import { useDebounce } from '@/hooks/useDebounce';
import { shadows } from '@/theme/shadows';

// ── Types ────────────────────────────────────────────────────────────────────

export interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const AnimatedView = Animated.createAnimatedComponent(View);

// ── Component ────────────────────────────────────────────────────────────────

export function SearchBar({
  value: controlledValue,
  onChangeText,
  onSearch,
  placeholder = 'Search...',
  className = '',
}: SearchBarProps) {
  const theme = useTheme();
  const [internalValue, setInternalValue] = useState(controlledValue ?? '');
  const focusProgress = useSharedValue(0);

  const currentValue = controlledValue ?? internalValue;
  const debouncedValue = useDebounce(currentValue, 300);

  useEffect(() => {
    onSearch?.(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleChangeText = useCallback(
    (text: string) => {
      setInternalValue(text);
      onChangeText?.(text);
    },
    [onChangeText],
  );

  const handleClear = useCallback(() => {
    setInternalValue('');
    onChangeText?.('');
  }, [onChangeText]);

  const handleFocus = useCallback(() => {
    focusProgress.value = withTiming(1, { duration: 200 });
  }, [focusProgress]);

  const handleBlur = useCallback(() => {
    focusProgress.value = withTiming(0, { duration: 200 });
  }, [focusProgress]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const focused = focusProgress.value > 0.5;

    return {
      borderWidth: focused ? 1 : 0,
      borderColor: theme.accent,
      ...(focused
        ? {
            shadowColor: shadows.md.shadowColor,
            shadowOffset: shadows.md.shadowOffset,
            shadowOpacity: shadows.md.shadowOpacity,
            shadowRadius: shadows.md.shadowRadius,
            elevation: shadows.md.elevation,
          }
        : {
            shadowColor: 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0,
            shadowRadius: 0,
            elevation: 0,
          }),
    };
  });

  return (
    <AnimatedView
      className={className}
      style={[
        animatedContainerStyle,
        {
          backgroundColor: theme.surfaceSecondary,
          borderRadius: 9999,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          height: 48,
        },
      ]}
    >
      <Search
        size={18}
        color={theme.textTertiary}
        style={{ marginRight: 10 }}
      />

      <TextInput
        value={currentValue}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType="search"
        style={{
          flex: 1,
          fontFamily: 'Poppins_400Regular',
          fontSize: 14,
          color: theme.textPrimary,
          paddingVertical: 0,
        }}
      />

      {currentValue.length > 0 ? (
        <Pressable onPress={handleClear} hitSlop={8}>
          <X size={18} color={theme.textTertiary} />
        </Pressable>
      ) : null}
    </AnimatedView>
  );
}
