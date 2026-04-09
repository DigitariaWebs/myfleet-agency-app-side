import { Redirect } from "expo-router";

import { useAuthStore } from "@/stores/useAuthStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const hasSeenOnboarding = useSettingsStore((s) => s.hasSeenOnboarding);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)/(home)" />;
  }

  if (!hasSeenOnboarding) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
