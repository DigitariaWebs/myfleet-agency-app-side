import React from "react";
import { View, type ViewStyle } from "react-native";
import {
  CheckCircle,
  Car,
  Wrench,
  Clock,
  Archive,
  type LucideIcon,
} from "lucide-react-native";

import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import type { ColorScale } from "@/theme/colors";
import { Text } from "./Text";

export interface StatusBadgeProps {
  status: "available" | "rented" | "maintenance" | "reserved" | "retired";
  size?: "sm" | "md";
  className?: string;
}

interface StatusConfig {
  icon: LucideIcon;
  color: string;
  backgroundColor: string;
  translationKey: string;
  fallbackLabel: string;
}

function getStatusConfig(
  status: StatusBadgeProps["status"],
  theme: ColorScale,
): StatusConfig {
  switch (status) {
    case "available":
      return {
        icon: CheckCircle,
        color: theme.success,
        backgroundColor: theme.successSoft,
        translationKey: "fleet.status.available",
        fallbackLabel: "Disponible",
      };
    case "rented":
      return {
        icon: Car,
        color: theme.warning,
        backgroundColor: theme.warningSoft,
        translationKey: "fleet.status.rented",
        fallbackLabel: "En location",
      };
    case "maintenance":
      return {
        icon: Wrench,
        color: theme.danger,
        backgroundColor: theme.dangerSoft,
        translationKey: "fleet.status.maintenance",
        fallbackLabel: "En maintenance",
      };
    case "reserved":
      return {
        icon: Clock,
        color: theme.info,
        backgroundColor: theme.infoSoft,
        translationKey: "fleet.status.reserved",
        fallbackLabel: "Reserved",
      };
    case "retired":
      return {
        icon: Archive,
        color: theme.textTertiary,
        backgroundColor: theme.surfaceTertiary,
        translationKey: "fleet.status.retired",
        fallbackLabel: "Retired",
      };
  }
}

export function StatusBadge({
  status,
  size = "md",
  className,
}: StatusBadgeProps) {
  const theme = useTheme();
  const { t } = useLocale();
  const config = getStatusConfig(status, theme);

  const Icon = config.icon;
  const isSmall = size === "sm";

  const iconSize = isSmall ? 12 : 14;

  const containerStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    gap: isSmall ? 4 : 6,
    backgroundColor: config.backgroundColor,
    borderRadius: 9999,
    paddingHorizontal: isSmall ? 8 : 10,
    paddingVertical: isSmall ? 3 : 5,
    alignSelf: "flex-start",
  };

  const translated = t(config.translationKey);
  // If i18next returns the key itself, it means no translation exists -- use the fallback
  const label =
    translated === config.translationKey ? config.fallbackLabel : translated;

  return (
    <View style={containerStyle} className={className}>
      <Icon size={iconSize} color={config.color} />
      <Text variant={isSmall ? "labelSmall" : "bodySmall"} color={config.color}>
        {label}
      </Text>
    </View>
  );
}
