import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { PenLine } from 'lucide-react-native';

import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Point {
  x: number;
  y: number;
}

export interface SignaturePadProps {
  onSignatureChange?: (hasSignature: boolean) => void;
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
  height?: number;
  label?: string;
}

export interface SignaturePadRef {
  clear: () => void;
  toBase64: () => string;
  isEmpty: () => boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert an array of points into a smooth SVG path string using
 * quadratic bezier interpolation between midpoints.
 */
function pointsToSvgPath(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const p = points[0];
    return `M ${p.x} ${p.y} L ${p.x} ${p.y}`;
  }
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  // Start at first point
  let d = `M ${points[0].x} ${points[0].y}`;

  // Use quadratic bezier through midpoints for smoothness
  for (let i = 1; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;
    d += ` Q ${current.x} ${current.y} ${midX} ${midY}`;
  }

  // Final segment to the last point
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;

  return d;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  function SignaturePad(
    {
      onSignatureChange,
      strokeColor,
      strokeWidth = 2.5,
      backgroundColor,
      height = 150,
      label = 'Client Signature',
    },
    ref,
  ) {
    const theme = useTheme();

    const resolvedStrokeColor = strokeColor ?? theme.textPrimary;
    const resolvedBgColor = backgroundColor ?? theme.surface;

    // -----------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------

    const [paths, setPaths] = useState<Point[][]>([]);
    const [currentPath, setCurrentPath] = useState<Point[]>([]);
    const [containerLayout, setContainerLayout] = useState<{
      width: number;
      height: number;
    }>({ width: 0, height: 0 });

    const hasSignature = paths.length > 0 || currentPath.length > 0;

    // -----------------------------------------------------------------------
    // Pulse animation for the empty-state icon
    // -----------------------------------------------------------------------

    const pulseOpacity = useSharedValue(0.4);

    React.useEffect(() => {
      pulseOpacity.value = withRepeat(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    }, [pulseOpacity]);

    const pulseStyle = useAnimatedStyle(() => ({
      opacity: pulseOpacity.value,
    }));

    // -----------------------------------------------------------------------
    // Gesture
    // -----------------------------------------------------------------------

    const panGesture = Gesture.Pan()
      .minDistance(0)
      .onStart((e) => {
        const point: Point = { x: e.x, y: e.y };
        setCurrentPath([point]);
      })
      .onUpdate((e) => {
        const point: Point = { x: e.x, y: e.y };
        setCurrentPath((prev) => [...prev, point]);
      })
      .onEnd(() => {
        setCurrentPath((prev) => {
          if (prev.length > 0) {
            setPaths((existing) => {
              const updated = [...existing, prev];
              onSignatureChange?.(true);
              return updated;
            });
          }
          return [];
        });
      });

    // -----------------------------------------------------------------------
    // Ref methods
    // -----------------------------------------------------------------------

    useImperativeHandle(ref, () => ({
      clear() {
        setPaths([]);
        setCurrentPath([]);
        onSignatureChange?.(false);
      },
      toBase64() {
        return 'sig-' + Date.now();
      },
      isEmpty() {
        return paths.length === 0 && currentPath.length === 0;
      },
    }));

    // -----------------------------------------------------------------------
    // Layout
    // -----------------------------------------------------------------------

    const handleLayout = useCallback((e: LayoutChangeEvent) => {
      const { width, height: h } = e.nativeEvent.layout;
      setContainerLayout({ width, height: h });
    }, []);

    // -----------------------------------------------------------------------
    // Clear / Done handlers
    // -----------------------------------------------------------------------

    const handleClear = useCallback(() => {
      setPaths([]);
      setCurrentPath([]);
      onSignatureChange?.(false);
    }, [onSignatureChange]);

    const handleDone = useCallback(() => {
      // Finalise any in-progress stroke
      if (currentPath.length > 0) {
        setPaths((existing) => [...existing, currentPath]);
        setCurrentPath([]);
      }
      onSignatureChange?.(paths.length > 0 || currentPath.length > 0);
    }, [currentPath, onSignatureChange, paths.length]);

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
      <View className="w-full">
        {/* Drawing area */}
        <GestureDetector gesture={panGesture}>
          <View
            onLayout={handleLayout}
            className="overflow-hidden rounded-xl"
            style={{
              height,
              backgroundColor: resolvedBgColor,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            {/* SVG canvas */}
            {containerLayout.width > 0 && containerLayout.height > 0 && (
              <Svg
                width={containerLayout.width}
                height={containerLayout.height}
                style={{ position: 'absolute', top: 0, left: 0 }}
              >
                {/* Committed paths */}
                {paths.map((pts, idx) => (
                  <Path
                    key={`path-${idx}`}
                    d={pointsToSvgPath(pts)}
                    stroke={resolvedStrokeColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}

                {/* Current in-progress path */}
                {currentPath.length > 0 && (
                  <Path
                    d={pointsToSvgPath(currentPath)}
                    stroke={resolvedStrokeColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </Svg>
            )}

            {/* Empty-state hint */}
            {!hasSignature && (
              <View className="absolute inset-0 items-center justify-center">
                <Animated.View style={pulseStyle}>
                  <PenLine size={28} color={theme.textTertiary} />
                </Animated.View>
                <Text
                  variant="caption"
                  color={theme.textTertiary}
                  className="mt-2"
                >
                  Sign here
                </Text>
              </View>
            )}
          </View>
        </GestureDetector>

        {/* Signature line + label */}
        <View className="mt-2 items-center">
          <View
            className="w-3/4"
            style={{ height: 1, backgroundColor: theme.border }}
          />
          <Text
            variant="caption"
            color={theme.textTertiary}
            className="mt-1"
          >
            {label}
          </Text>
        </View>

        {/* Action bar */}
        <View className="mt-3 flex-row items-center justify-between">
          <Button variant="ghost" size="sm" onPress={handleClear}>
            Clear
          </Button>
          <Button variant="primary" size="sm" onPress={handleDone}>
            Done
          </Button>
        </View>
      </View>
    );
  },
);
