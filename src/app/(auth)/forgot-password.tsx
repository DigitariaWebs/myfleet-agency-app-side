import React, { useEffect, useState } from "react";
import { Keyboard, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { CheckCircle, ChevronLeft, Mail } from "lucide-react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTheme } from "@/hooks/useTheme";

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // Checkmark bounce animation
  const checkScale = useSharedValue(0);

  useEffect(() => {
    if (isSent) {
      checkScale.value = withSequence(
        withTiming(1.2, { duration: 300 }),
        withTiming(1, { duration: 200 })
      );
    }
  }, [isSent, checkScale]);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  // Pulse animation for the check circle
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isSent) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    }
  }, [isSent, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handleReset = async () => {
    Keyboard.dismiss();

    if (!email.trim()) {
      setEmailError(t("auth.validation.emailRequired"));
      return;
    }
    if (!isValidEmail(email.trim())) {
      setEmailError(t("auth.validation.emailInvalid"));
      return;
    }

    setEmailError(undefined);
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setIsSubmitting(false);
    setIsSent(true);
  };

  if (isSent) {
    return (
      <ScreenWrapper scroll={false}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="mb-8 self-start"
        >
          <ChevronLeft size={28} color={theme.textPrimary} />
        </Pressable>

        <View className="flex-1 items-center justify-center px-4">
          <Animated.View
            entering={FadeIn.duration(400)}
            style={[checkStyle, pulseStyle]}
            className="mb-6"
          >
            <View
              className="w-20 h-20 rounded-full items-center justify-center"
              style={{ backgroundColor: theme.successSoft }}
            >
              <CheckCircle size={40} color={theme.success} strokeWidth={1.5} />
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            className="items-center"
          >
            <Text variant="headlineMedium" align="center">
              {t("auth.forgotScreen.emailSent")}
            </Text>
            <Text
              variant="bodyMedium"
              color={theme.textSecondary}
              align="center"
              className="mt-3 px-4"
            >
              {t("auth.forgotScreen.emailSentMessage")}
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400).duration(400)}
            className="mt-10"
          >
            <Pressable onPress={() => router.push("/(auth)/login")}>
              <Text variant="titleMedium" color={theme.accent}>
                {t("auth.forgotScreen.backToLogin")}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scroll={false}>
      <Pressable onPress={Keyboard.dismiss} className="flex-1">
        {/* Back */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            className="mb-8 self-start"
          >
            <ChevronLeft size={28} color={theme.textPrimary} />
          </Pressable>
        </Animated.View>

        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text variant="headlineLarge">
            {t("auth.forgotScreen.title")}
          </Text>
          <Text
            variant="bodyMedium"
            color={theme.textSecondary}
            className="mt-2"
          >
            {t("auth.forgotScreen.subtitle")}
          </Text>
        </Animated.View>

        {/* Email input */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          className="mt-8"
        >
          <Input
            label={t("auth.email")}
            placeholder={t("auth.forgotScreen.emailPlaceholder")}
            keyboardType="email-address"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (emailError) setEmailError(undefined);
            }}
            leftIcon={Mail}
            error={emailError}
          />
        </Animated.View>

        {/* Send button */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          className="mt-8"
        >
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            onPress={handleReset}
          >
            {t("auth.forgotScreen.sendLink")}
          </Button>
        </Animated.View>

        {/* Back to login */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(400)}
          className="items-center mt-6"
        >
          <Pressable onPress={() => router.push("/(auth)/login")}>
            <Text variant="bodyMedium" color={theme.accent}>
              {t("auth.forgotScreen.backToLogin")}
            </Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </ScreenWrapper>
  );
}
