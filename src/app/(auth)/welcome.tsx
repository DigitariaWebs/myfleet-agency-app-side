import React from "react";
import { Dimensions, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";

import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { fontFamilies } from "@/theme/typography";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar style="light" />

      {/* Background car image */}
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80",
        }}
        style={{
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          position: "absolute",
        }}
        contentFit="cover"
        transition={400}
      />

      {/* Dark gradient overlay */}
      <LinearGradient
        colors={[
          "transparent",
          "rgba(0,0,0,0.2)",
          "rgba(0,0,0,0.75)",
          "rgba(0,0,0,0.95)",
        ]}
        locations={[0, 0.35, 0.65, 1]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: SCREEN_HEIGHT * 0.6,
        }}
      />

      {/* Content at bottom */}
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          paddingHorizontal: 24,
          paddingBottom: 48,
        }}
      >
        {/* Logo + tagline */}
        <Animated.View entering={FadeInUp.delay(100).duration(600)}>
          <Animated.Text
            style={{
              fontFamily: fontFamilies.bold,
              fontSize: 36,
              color: "#FFFFFF",
              letterSpacing: 3,
              marginBottom: 4,
            }}
          >
            {t("auth.welcome.title")}
          </Animated.Text>

          {/* Purple accent line */}
          <View
            style={{
              width: 40,
              height: 3,
              borderRadius: 2,
              backgroundColor: "#7C3AED",
              marginBottom: 12,
            }}
          />

          <Text variant="bodyLarge" color="rgba(255,255,255,0.7)">
            {t("auth.welcome.tagline")}
          </Text>
        </Animated.View>

        {/* Buttons */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(600).springify()}
          className="mt-10 gap-3"
        >
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.push("/(auth)/register")}
          >
            {t("auth.welcome.getStarted")}
          </Button>

          <Button
            variant="dark"
            size="lg"
            fullWidth
            onPress={() => router.push("/(auth)/login")}
          >
            {t("auth.welcome.signIn")}
          </Button>
        </Animated.View>
      </View>
    </View>
  );
}
