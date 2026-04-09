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
import {
  Building2,
  ChevronLeft,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToastStore } from "@/components/ui/Toast";

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  agency?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const loginAction = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const showToast = useToastStore((s) => s.show);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [agency, setAgency] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!name.trim()) e.name = t("auth.validation.nameRequired");
    if (!email.trim()) {
      e.email = t("auth.validation.emailRequired");
    } else if (!isValidEmail(email.trim())) {
      e.email = t("auth.validation.emailInvalid");
    }
    if (!phone.trim()) e.phone = t("auth.validation.phoneRequired");
    if (!agency.trim()) e.agency = t("auth.validation.agencyRequired");
    if (!password) {
      e.password = t("auth.validation.passwordRequired");
    } else if (password.length < 6) {
      e.password = t("auth.validation.passwordMinLength");
    }
    if (password !== confirmPassword) {
      e.confirmPassword = t("auth.validation.passwordMismatch");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    Keyboard.dismiss();
    if (!validate()) return;
    try {
      await loginAction(email.trim(), password);
      showToast({
        variant: "success",
        title: t("common.success"),
        message: t("auth.registerScreen.title"),
      });
      router.replace("/(app)/(home)");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t("common.error");
      showToast({ variant: "error", title: t("common.error"), message });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 16,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
            {/* Back */}
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              className="self-start mb-4"
            >
              <ChevronLeft size={26} color={theme.textPrimary} />
            </Pressable>

            {/* Header — compact */}
            <Text variant="headlineLarge">
              {t("auth.registerScreen.title")}
            </Text>
            <Text
              variant="bodySmall"
              color={theme.textSecondary}
              className="mt-1 mb-5"
            >
              {t("auth.registerScreen.subtitle")}
            </Text>

            {/* Form — tight spacing */}
            <View className="gap-3">
              {/* Name + Email side by side */}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input
                    label={t("auth.registerScreen.fullName")}
                    placeholder={t("auth.registerScreen.fullNamePlaceholder")}
                    value={name}
                    onChangeText={(v) => { setName(v); clearError("name"); }}
                    leftIcon={User}
                    error={errors.name}
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label={t("auth.registerScreen.phone")}
                    placeholder="+33 6 12 34 56 78"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={(v) => { setPhone(v); clearError("phone"); }}
                    leftIcon={Phone}
                    error={errors.phone}
                  />
                </View>
              </View>

              <Input
                label={t("auth.email")}
                placeholder={t("auth.registerScreen.emailPlaceholder")}
                keyboardType="email-address"
                value={email}
                onChangeText={(v) => { setEmail(v); clearError("email"); }}
                leftIcon={Mail}
                error={errors.email}
              />

              <Input
                label={t("auth.registerScreen.agencyName")}
                placeholder={t("auth.registerScreen.agencyNamePlaceholder")}
                value={agency}
                onChangeText={(v) => { setAgency(v); clearError("agency"); }}
                leftIcon={Building2}
                error={errors.agency}
              />

              {/* Password fields side by side */}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input
                    variant="password"
                    label={t("auth.password")}
                    placeholder="••••••"
                    value={password}
                    onChangeText={(v) => { setPassword(v); clearError("password"); }}
                    leftIcon={Lock}
                    error={errors.password}
                  />
                </View>
                <View className="flex-1">
                  <Input
                    variant="password"
                    label={t("auth.registerScreen.confirmPassword")}
                    placeholder="••••••"
                    value={confirmPassword}
                    onChangeText={(v) => { setConfirmPassword(v); clearError("confirmPassword"); }}
                    leftIcon={Lock}
                    error={errors.confirmPassword}
                  />
                </View>
              </View>
            </View>

            {/* Spacer pushes button to bottom on tall screens */}
            <View className="flex-1" style={{ minHeight: 16 }} />

            {/* Register button */}
            <View className="mt-4">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                onPress={handleRegister}
              >
                {t("auth.registerScreen.createAccount")}
              </Button>
            </View>

            {/* Sign in link */}
            <Pressable
              onPress={() => {
                router.back();
                setTimeout(() => router.push("/(auth)/login"), 300);
              }}
              className="flex-row items-center justify-center gap-1 mt-4"
            >
              <Text variant="bodySmall" color={theme.textSecondary}>
                {t("auth.registerScreen.hasAccount")}
              </Text>
              <Text variant="titleSmall" color={theme.accent}>
                {t("auth.registerScreen.signIn")}
              </Text>
            </Pressable>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
