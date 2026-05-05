import { useEffect, useState } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import {
  Image as ExpoImage,
  type ImageProps as ExpoImageProps,
  type ImageLoadEventData,
  type ImageErrorEventData,
} from "expo-image";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";

export interface ImageProps extends ExpoImageProps {
  /** Disable the loading skeleton overlay (default: enabled for remote sources). */
  showLoadingState?: boolean;
}

function isRemoteSource(source: ExpoImageProps["source"]): boolean {
  if (source == null) return false;
  if (typeof source === "number") return false;
  if (typeof source === "string") return /^https?:|^data:|^blob:/.test(source);
  if (Array.isArray(source)) return source.some(isRemoteSource);
  if (typeof source === "object" && "uri" in source && source.uri) {
    return /^https?:|^data:|^blob:/.test(source.uri);
  }
  return false;
}

function ImageBase({
  showLoadingState = true,
  source,
  style,
  onLoad,
  onLoadStart,
  onError,
  ...rest
}: ImageProps) {
  const remote = isRemoteSource(source);
  const enabled = showLoadingState && remote;
  const [loading, setLoading] = useState(enabled);

  if (!enabled) {
    return (
      <ExpoImage
        source={source}
        style={style}
        onLoad={onLoad}
        onLoadStart={onLoadStart}
        onError={onError}
        {...rest}
      />
    );
  }

  return (
    <View style={[styles.container, style as StyleProp<ViewStyle>]}>
      <ExpoImage
        source={source}
        style={StyleSheet.absoluteFill}
        onLoadStart={() => {
          setLoading(true);
          onLoadStart?.();
        }}
        onLoad={(e: ImageLoadEventData) => {
          setLoading(false);
          onLoad?.(e);
        }}
        onError={(e: ImageErrorEventData) => {
          setLoading(false);
          onError?.(e);
        }}
        {...rest}
      />
      {loading && <ImageSkeletonOverlay />}
    </View>
  );
}

function ImageSkeletonOverlay() {
  const theme = useTheme();
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: theme.surfaceTertiary },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
});

// Re-expose expo-image's static methods (prefetch, clearMemoryCache, etc.)
type ImageStatics = Pick<
  typeof ExpoImage,
  | "prefetch"
  | "clearMemoryCache"
  | "clearDiskCache"
  | "getCachePathAsync"
  | "generateBlurhashAsync"
  | "loadAsync"
>;

export const Image: typeof ImageBase & ImageStatics = Object.assign(ImageBase, {
  prefetch: ExpoImage.prefetch.bind(ExpoImage),
  clearMemoryCache: ExpoImage.clearMemoryCache.bind(ExpoImage),
  clearDiskCache: ExpoImage.clearDiskCache.bind(ExpoImage),
  getCachePathAsync: ExpoImage.getCachePathAsync.bind(ExpoImage),
  generateBlurhashAsync: ExpoImage.generateBlurhashAsync.bind(ExpoImage),
  loadAsync: ExpoImage.loadAsync.bind(ExpoImage),
});
