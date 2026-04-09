import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  type LucideIcon,
} from 'lucide-react-native';
import { create } from 'zustand';

import { useTheme } from '@/hooks/useTheme';
import { fontFamilies } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import type { ColorScale } from '@/theme/colors';

// ── Types ────────────────────────────────────────────────────────────────────

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastState {
  toasts: ToastMessage[];
  show: (toast: Omit<ToastMessage, 'id'>) => void;
  dismiss: (id: string) => void;
}

// ── Zustand Store ────────────────────────────────────────────────────────────

let toastCounter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  show: (toast) => {
    const id = `toast-${Date.now()}-${++toastCounter}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
  },

  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<
  ToastVariant,
  { icon: LucideIcon; colorKey: keyof ColorScale }
> = {
  success: { icon: CheckCircle, colorKey: 'success' },
  error: { icon: XCircle, colorKey: 'danger' },
  warning: { icon: AlertTriangle, colorKey: 'warning' },
  info: { icon: Info, colorKey: 'info' },
};

const DISMISS_THRESHOLD = -50;
const DEFAULT_DURATION = 3000;

// ── Single Toast Item ────────────────────────────────────────────────────────

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const theme = useTheme();
  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);
  const contextY = useSharedValue(0);

  const config = VARIANT_CONFIG[toast.variant];
  const Icon = config.icon;
  const barColor = theme[config.colorKey];

  const dismiss = useCallback(() => {
    onDismiss(toast.id);
  }, [onDismiss, toast.id]);

  // Animate in on mount
  useEffect(() => {
    translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 200 });
  }, [translateY, opacity]);

  // Auto-dismiss after duration
  useEffect(() => {
    const duration = toast.duration ?? DEFAULT_DURATION;
    const timer = setTimeout(() => {
      // Animate out, then remove
      translateY.value = withTiming(-80, { duration: 250 });
      opacity.value = withTiming(0, { duration: 250 }, (finished) => {
        if (finished) {
          runOnJS(dismiss)();
        }
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, translateY, opacity, dismiss]);

  // Swipe-up-to-dismiss gesture
  const panGesture = Gesture.Pan()
    .onStart(() => {
      contextY.value = translateY.value;
    })
    .onUpdate((event) => {
      // Only allow swiping up (negative translationY)
      const newY = contextY.value + event.translationY;
      translateY.value = Math.min(newY, 0);
    })
    .onEnd((event) => {
      if (event.translationY < DISMISS_THRESHOLD) {
        // Swipe past threshold — dismiss
        translateY.value = withTiming(-80, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 }, (finished) => {
          if (finished) {
            runOnJS(dismiss)();
          }
        });
      } else {
        // Snap back
        translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          {
            backgroundColor: theme.surface,
            borderRadius: 16,
            flexDirection: 'row',
            overflow: 'hidden',
            marginBottom: 8,
            marginHorizontal: 16,
            ...shadows.md,
          },
          animatedStyle,
        ]}
      >
        {/* Left color bar */}
        <View style={{ width: 4, backgroundColor: barColor }} />

        {/* Content */}
        <View className="flex-row items-center flex-1 px-3 py-3">
          <Icon size={20} color={barColor} strokeWidth={2} />

          <View className="ml-3 flex-1">
            <Animated.Text
              style={{
                fontFamily: fontFamilies.semiBold,
                fontSize: 14,
                color: theme.textPrimary,
              }}
              numberOfLines={1}
            >
              {toast.title}
            </Animated.Text>

            {toast.message ? (
              <Animated.Text
                style={{
                  fontFamily: fontFamilies.regular,
                  fontSize: 12,
                  color: theme.textSecondary,
                  marginTop: 2,
                }}
                numberOfLines={2}
              >
                {toast.message}
              </Animated.Text>
            ) : null}
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

// ── Toast Container (renders the toast list) ─────────────────────────────────

function ToastContainer() {
  const insets = useSafeAreaInsets();
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: insets.top + 8,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
      pointerEvents="box-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </View>
  );
}

// ── Public exports ───────────────────────────────────────────────────────────

/** Place this component in your root layout to render toasts. */
export function ToastProvider() {
  return <ToastContainer />;
}

/** Direct component export (identical to ToastProvider). */
export const Toast = ToastContainer;
