import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { Lock, Mail, X } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Svg, { Path } from "react-native-svg";

import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Divider } from "@/components/ui/Divider";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToastStore } from "@/components/ui/Toast";
import { isAppleSignInAvailable } from "@/services/auth/socialAuth";

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ── Social Brand Icons ─────────────────────────────────────────────────────

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </Svg>
  );
}

function AppleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="#000000">
      <Path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </Svg>
  );
}

function FacebookIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="#1877F2">
      <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </Svg>
  );
}

// ── Social Button ───────────────────────────────────────────────────────────

function SocialButton({
  icon,
  onPress,
  theme,
}: {
  icon: React.ReactNode;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      className="w-[52px] h-[52px] rounded-full items-center justify-center"
      style={{
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      {icon}
    </Pressable>
  );
}

// ── Login Screen ────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();

  const login = useAuthStore((s) => s.login);
  const loginWithSocial = useAuthStore((s) => s.loginWithSocial);
  const isLoading = useAuthStore((s) => s.isLoading);
  const showToast = useToastStore((s) => s.show);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const showApple = isAppleSignInAvailable();

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = t("auth.validation.emailRequired");
    } else if (!isValidEmail(email.trim())) {
      newErrors.email = t("auth.validation.emailInvalid");
    }
    if (!password) {
      newErrors.password = t("auth.validation.passwordRequired");
    } else if (password.length < 6) {
      newErrors.password = t("auth.validation.passwordMinLength");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!validate()) return;
    try {
      await login(email.trim(), password);
      router.replace("/(app)/(home)");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t("common.error");
      showToast({ variant: "error", title: t("common.error"), message });
    }
  };

  const handleSocialLogin = async (provider: 'apple' | 'google' | 'facebook') => {
    try {
      await loginWithSocial(provider);
      router.replace("/(app)/(home)");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t("common.error");
      showToast({ variant: "error", title: t("common.error"), message });
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: "hidden",
      }}
    >
      <StatusBar style="dark" />

      {/* Drag handle + close */}
      <View className="items-center pt-3 pb-1">
        <View
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.surfaceTertiary,
          }}
        />
      </View>
      <View className="flex-row items-center justify-between px-4 pb-2">
        <View style={{ width: 40 }} />
        <Text variant="titleLarge" align="center">
          {t("auth.loginScreen.title")}
        </Text>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.surfaceTertiary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={18} color={theme.textSecondary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <Pressable onPress={Keyboard.dismiss}>
            {/* Subtitle */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(400)}
              className="items-center mt-2 mb-6"
            >
              <Text
                variant="bodyMedium"
                color={theme.textSecondary}
                align="center"
              >
                {t("auth.loginScreen.subtitle")}
              </Text>
            </Animated.View>

            {/* Social Login Buttons */}
            <Animated.View
              entering={FadeInDown.delay(150).duration(400)}
              className="items-center mb-6"
            >
              <View className="flex-row gap-4">
                <SocialButton
                  icon={<GoogleIcon />}
                  onPress={() => handleSocialLogin('google')}
                  theme={theme}
                />
                {showApple && (
                  <SocialButton
                    icon={<AppleIcon />}
                    onPress={() => handleSocialLogin('apple')}
                    theme={theme}
                  />
                )}
                <SocialButton
                  icon={<FacebookIcon />}
                  onPress={() => handleSocialLogin('facebook')}
                  theme={theme}
                />
              </View>
            </Animated.View>

            {/* Divider */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(400)}
              className="mb-6"
            >
              <Divider label={t("auth.continueWith", { defaultValue: "or continue with email" })} />
            </Animated.View>

            {/* Form */}
            <Animated.View
              entering={FadeInDown.delay(250).duration(400)}
              className="gap-4"
            >
              <Input
                label={t("auth.email")}
                placeholder={t("auth.loginScreen.emailPlaceholder")}
                keyboardType="email-address"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (errors.email)
                    setErrors((e) => ({ ...e, email: undefined }));
                }}
                leftIcon={Mail}
                error={errors.email}
              />

              <Input
                variant="password"
                label={t("auth.password")}
                placeholder={t("auth.loginScreen.passwordPlaceholder")}
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  if (errors.password)
                    setErrors((e) => ({ ...e, password: undefined }));
                }}
                leftIcon={Lock}
                error={errors.password}
              />
            </Animated.View>

            {/* Forgot password */}
            <Animated.View
              entering={FadeInDown.delay(350).duration(400)}
              className="mt-2 self-end"
            >
              <Pressable
                onPress={() => router.push("/(auth)/forgot-password")}
              >
                <Text variant="bodySmall" color={theme.accent}>
                  {t("auth.loginScreen.forgotPassword")}
                </Text>
              </Pressable>
            </Animated.View>

            {/* Sign In */}
            <Animated.View
              entering={FadeInDown.delay(400).duration(400)}
              className="mt-6"
            >
              <Button
                variant="dark"
                size="lg"
                fullWidth
                loading={isLoading}
                onPress={handleLogin}
              >
                {t("auth.loginScreen.signIn")}
              </Button>
            </Animated.View>

            {/* Register link */}
            <Animated.View
              entering={FadeInDown.delay(500).duration(400)}
              className="items-center mt-6"
            >
              <Pressable
                onPress={() => {
                  router.back();
                  setTimeout(() => router.push("/(auth)/register"), 300);
                }}
                className="flex-row items-center gap-1"
              >
                <Text variant="bodyMedium" color={theme.textSecondary}>
                  {t("auth.loginScreen.noAccount")}
                </Text>
                <Text variant="titleMedium" color={theme.accent}>
                  {t("auth.loginScreen.register")}
                </Text>
              </Pressable>
            </Animated.View>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
