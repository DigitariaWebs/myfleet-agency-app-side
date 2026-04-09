import React from "react";
import { View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";

import { Button, type ButtonProps } from "./Button";

export interface StickyButtonProps extends ButtonProps {
  visible?: boolean;
}

export function StickyButton({
  visible = true,
  children,
  ...buttonProps
}: StickyButtonProps) {
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(250).springify()}
      exiting={FadeOutDown.duration(200)}
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingBottom: 8,
      }}
    >
      <Button size="lg" fullWidth {...buttonProps}>
        {children}
      </Button>
    </Animated.View>
  );
}
