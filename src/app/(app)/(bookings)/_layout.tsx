import { Stack } from "expo-router";

import { useTheme } from "@/hooks/useTheme";

export default function BookingsLayout() {
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
      <Stack.Screen name="[id]" />
      <Stack.Screen
        name="new"
        options={{ animation: "slide_from_bottom" }}
      />
      <Stack.Screen name="calendar" />
      <Stack.Screen
        name="pickup"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="return"
        options={{ animation: "slide_from_right" }}
      />
    </Stack>
  );
}
