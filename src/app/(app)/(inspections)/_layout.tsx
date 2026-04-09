import { Stack } from "expo-router";

import { useTheme } from "@/hooks/useTheme";

export default function InspectionsLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="new" />
      <Stack.Screen name="[id]" />
      <Stack.Screen
        name="camera"
        options={{ animation: "slide_from_bottom", gestureEnabled: false }}
      />
    </Stack>
  );
}
