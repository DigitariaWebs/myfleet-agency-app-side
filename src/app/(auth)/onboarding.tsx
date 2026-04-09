import React, { useCallback, useRef, useState } from "react";
import { Dimensions, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  useAnimatedScrollHandler,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { Button } from "@/components/ui/Button";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { fontFamilies } from "@/theme/typography";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SLIDES = [
  {
    key: "screen1" as const,
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80",
  },
  {
    key: "screen2" as const,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
  },
  {
    key: "screen3" as const,
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const textOpacity = useSharedValue(1);

  const updateIndex = useCallback(
    (idx: number) => {
      if (idx !== activeIndex) {
        // Fade out, swap text, fade in
        textOpacity.value = withTiming(0, { duration: 150 }, () => {
          runOnJS(setActiveIndex)(idx);
          textOpacity.value = withTiming(1, { duration: 250 });
        });
      }
    },
    [activeIndex, textOpacity]
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
      const idx = Math.round(event.contentOffset.x / SCREEN_WIDTH);
      runOnJS(updateIndex)(idx);
    },
  });

  const handleNext = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (activeIndex < SLIDES.length - 1) {
      const nextIndex = activeIndex + 1;
      scrollRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
      // Trigger text transition immediately
      textOpacity.value = withTiming(0, { duration: 150 }, () => {
        runOnJS(setActiveIndex)(nextIndex);
        textOpacity.value = withTiming(1, { duration: 250 });
      });
    } else {
      completeOnboarding();
      router.replace("/(auth)/welcome");
    }
  }, [activeIndex, completeOnboarding, router, textOpacity]);

  const handleSkip = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    completeOnboarding();
    router.replace("/(auth)/welcome");
  }, [completeOnboarding, router]);

  const isLastSlide = activeIndex === SLIDES.length - 1;
  const currentSlide = SLIDES[activeIndex];

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: "#0F0A1A" }}>
      <StatusBar style="light" />

      {/* ── Image carousel (only images swipe) ──────────────────── */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        bounces={false}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide) => (
          <View
            key={slide.key}
            style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
          >
            <Image
              source={{ uri: slide.image }}
              style={{
                width: SCREEN_WIDTH,
                height: SCREEN_HEIGHT,
              }}
              contentFit="cover"
              transition={300}
            />
          </View>
        ))}
      </Animated.ScrollView>

      {/* ── Dark purple gradient overlay (fixed) ────────────────── */}
      <LinearGradient
        colors={[
          "transparent",
          "rgba(15, 10, 26, 0.25)",
          "rgba(15, 10, 26, 0.7)",
          "rgba(15, 10, 26, 0.92)",
          "rgba(15, 10, 26, 1)",
        ]}
        locations={[0, 0.3, 0.55, 0.75, 1]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: SCREEN_HEIGHT * 0.58,
        }}
        pointerEvents="none"
      />

      {/* ── Fixed bottom content (text crossfades, doesn't scroll) ── */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 24,
          paddingBottom: 44,
        }}
      >
        {/* Title + description with fade transition */}
        <Animated.View style={textAnimatedStyle}>
          <Animated.Text
            style={{
              fontFamily: fontFamilies.bold,
              fontSize: 28,
              lineHeight: 36,
              color: "#FFFFFF",
              marginBottom: 10,
            }}
          >
            {t(`auth.onboarding.${currentSlide.key}.title`)}
          </Animated.Text>

          <Animated.Text
            style={{
              fontFamily: fontFamilies.regular,
              fontSize: 15,
              lineHeight: 22,
              color: "rgba(255, 255, 255, 0.65)",
              marginBottom: 28,
            }}
          >
            {t(`auth.onboarding.${currentSlide.key}.subtitle`)}
          </Animated.Text>
        </Animated.View>

        {/* Pagination dots */}
        <View className="flex-row items-center justify-center mb-6 gap-2">
          {SLIDES.map((_, i) => (
            <PaginationDot key={i} index={i} scrollX={scrollX} />
          ))}
        </View>

        {/* Button */}
        <Button variant="primary" size="lg" fullWidth onPress={handleNext}>
          {isLastSlide
            ? t("auth.onboarding.getStarted")
            : t("auth.onboarding.next")}
        </Button>
      </View>

      {/* ── Skip button (top right, fixed) ──────────────────────── */}
      {!isLastSlide && (
        <Animated.View
          entering={FadeIn.duration(400)}
          style={{ position: "absolute", top: 60, right: 20, zIndex: 10 }}
        >
          <Pressable onPress={handleSkip} hitSlop={12}>
            <Animated.Text
              style={{
                fontFamily: fontFamilies.medium,
                fontSize: 15,
                color: "rgba(255, 255, 255, 0.75)",
              }}
            >
              {t("auth.onboarding.skip")}
            </Animated.Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

// ── Pagination Dot ──────────────────────────────────────────────────────────

function PaginationDot({
  index,
  scrollX,
}: {
  index: number;
  scrollX: { value: number };
}) {
  const style = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];
    const width = interpolate(scrollX.value, inputRange, [8, 24, 8], "clamp");
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.35, 1, 0.35],
      "clamp"
    );

    return { width, opacity };
  });

  return (
    <Animated.View
      style={[
        {
          height: 8,
          borderRadius: 4,
          backgroundColor: "#FFFFFF",
        },
        style,
      ]}
    />
  );
}
