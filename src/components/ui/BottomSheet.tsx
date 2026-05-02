import React, { useCallback, useEffect } from 'react';
import { Dimensions, Modal, Pressable, View } from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/hooks/useTheme';
import { fontFamilies } from '@/theme/typography';
import { shadows } from '@/theme/shadows';

// ── Types ────────────────────────────────────────────────────────────────────

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  snapPoints?: number[];
  initialSnap?: number;
  title?: string;
  children: React.ReactNode;
}

// ── Constants ────────────────────────────────────────────────────────────────

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const CLOSE_THRESHOLD = 100;
const SPRING_CONFIG = { damping: 20, stiffness: 200 };

// ── Component ────────────────────────────────────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BottomSheet({
  visible,
  onClose,
  snapPoints = [50],
  initialSnap = 0,
  title,
  children,
}: BottomSheetProps) {
  const theme = useTheme();

  const snapIndex = Math.min(initialSnap, snapPoints.length - 1);
  const sheetHeight = (snapPoints[snapIndex] / 100) * SCREEN_HEIGHT;

  // translateY: 0 = fully open, sheetHeight = fully closed (off-screen below)
  const translateY = useSharedValue(sheetHeight);
  const contextY = useSharedValue(0);
  const isActive = useSharedValue(false);

  const fireClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Animate open / close when `visible` changes
  useEffect(() => {
    if (visible) {
      isActive.value = true;
      translateY.value = withSpring(0, SPRING_CONFIG);
    } else {
      translateY.value = withSpring(sheetHeight, SPRING_CONFIG, (finished) => {
        if (finished) {
          isActive.value = false;
        }
      });
    }
  }, [visible, sheetHeight, translateY, isActive]);

  const animateClose = useCallback(() => {
    translateY.value = withSpring(sheetHeight, SPRING_CONFIG, (finished) => {
      if (finished) {
        isActive.value = false;
        runOnJS(fireClose)();
      }
    });
  }, [translateY, sheetHeight, isActive, fireClose]);

  // ── Gesture ──────────────────────────────────────────────────────────────

  const panGesture = Gesture.Pan()
    .onStart(() => {
      contextY.value = translateY.value;
    })
    .onUpdate((event) => {
      // Only allow dragging down (positive translationY) or slightly up to rubber-band
      const newY = contextY.value + event.translationY;
      translateY.value = Math.max(newY, -20); // slight rubber-band upward
    })
    .onEnd((event) => {
      if (event.translationY > CLOSE_THRESHOLD) {
        // Drag past threshold — close
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        translateY.value = withSpring(sheetHeight, SPRING_CONFIG, (finished) => {
          if (finished) {
            isActive.value = false;
            runOnJS(fireClose)();
          }
        });
      } else {
        // Snap back to open
        translateY.value = withSpring(0, SPRING_CONFIG);
      }
    });

  // ── Animated styles ──────────────────────────────────────────────────────

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, sheetHeight], [1, 0]),
    pointerEvents: isActive.value ? ('auto' as const) : ('none' as const),
  }));

  const handleBackdropPress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateClose();
  }, [animateClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={animateClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <AnimatedPressable
        onPress={handleBackdropPress}
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.overlay,
          },
          backdropAnimatedStyle,
        ]}
      />

      {/* Sheet */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: sheetHeight,
              backgroundColor: theme.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              ...shadows.lg,
            },
            sheetAnimatedStyle,
          ]}
        >
          {/* Drag Handle */}
          <View className="items-center pt-3">
            <View
              style={{ backgroundColor: theme.surfaceTertiary }}
              className="w-10 h-1 rounded-full"
            />
          </View>

          {/* Title */}
          {title ? (
            <View className="mt-3 items-center">
              <Animated.Text
                style={{
                  fontFamily: fontFamilies.semiBold,
                  fontSize: 18,
                  color: theme.textPrimary,
                }}
              >
                {title}
              </Animated.Text>
            </View>
          ) : null}

          {/* Content */}
          <View className="flex-1 mt-3">{children}</View>
        </Animated.View>
      </GestureDetector>
    </Modal>
  );
}
