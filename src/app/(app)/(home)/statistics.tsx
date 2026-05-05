import React, { useCallback, useMemo } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Car,
  CheckCircle,
  ChevronLeft,
  CircleCheck,
  KeyRound,
  Wrench,
} from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import type { LucideIcon } from "lucide-react-native";

import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/hooks/useTheme";
import { useBookings } from "@/hooks/useBookings";
import { useFleetStats } from "@/hooks/useFleet";
import { fontFamilies } from "@/theme/typography";

export default function StatisticsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const { data: fleetStatsData } = useFleetStats();
  const stats = fleetStatsData ?? {
    total: 0,
    rented: 0,
    available: 0,
    maintenance: 0,
  };

  const { data: bookings = [] } = useBookings();
  const { active, upcoming, completed } = useMemo(
    () => ({
      active: bookings.filter((b) => b.status === "active").length,
      upcoming: bookings.filter(
        (b) => b.status === "confirmed" || b.status === "pending",
      ).length,
      completed: bookings.filter((b) => b.status === "completed").length,
    }),
    [bookings],
  );

  const { rentedPct, availablePct, maintenancePct } = useMemo(() => {
    const total = stats.total || 1;
    return {
      rentedPct: Math.round((stats.rented / total) * 100),
      availablePct: Math.round((stats.available / total) * 100),
      maintenancePct: Math.round((stats.maintenance / total) * 100),
    };
  }, [stats]);

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const goToFleet = useCallback(() => router.push("/(app)/(fleet)"), [router]);

  const goToFleetRented = useCallback(
    () =>
      router.push({ pathname: "/(app)/(fleet)", params: { status: "rented" } }),
    [router],
  );

  const goToFleetAvailable = useCallback(
    () =>
      router.push({
        pathname: "/(app)/(fleet)",
        params: { status: "available" },
      }),
    [router],
  );

  const goToFleetMaintenance = useCallback(
    () =>
      router.push({
        pathname: "/(app)/(fleet)",
        params: { status: "maintenance" },
      }),
    [router],
  );

  const goToBookingsActive = useCallback(
    () =>
      router.push({
        pathname: "/(app)/(bookings)",
        params: { filter: "active" },
      }),
    [router],
  );

  const goToBookingsUpcoming = useCallback(
    () =>
      router.push({
        pathname: "/(app)/(bookings)",
        params: { filter: "upcoming" },
      }),
    [router],
  );

  const goToBookingsCompleted = useCallback(
    () =>
      router.push({
        pathname: "/(app)/(bookings)",
        params: { filter: "completed" },
      }),
    [router],
  );

  return (
    <ScreenWrapper scroll padded={false}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="flex-row items-center px-4 pt-3 pb-4"
      >
        <Pressable
          onPress={handleBack}
          hitSlop={10}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.borderLight,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronLeft size={20} color={theme.textPrimary} strokeWidth={2} />
        </Pressable>
        <View style={{ marginLeft: 12 }}>
          <Text
            variant="bodySmall"
            color={theme.textTertiary}
            style={{ fontSize: 11 }}
          >
            {t("dashboard.statsScreen.subtitle")}
          </Text>
          <Text
            variant="headlineMedium"
            style={{ fontFamily: fontFamilies.bold }}
          >
            {t("dashboard.statsScreen.title")}
          </Text>
        </View>
      </Animated.View>

      {/* Fleet KPI grid (2×2) */}
      <Animated.View
        entering={FadeInDown.delay(80).duration(400)}
        className="px-4"
      >
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Tile
            icon={Car}
            value={stats.total}
            label={t("dashboard.stats.totalFleet")}
            color={theme.accent}
            bg={theme.accentSoft}
            theme={theme}
            onPress={goToFleet}
          />
          <Tile
            icon={KeyRound}
            value={stats.rented}
            label={t("dashboard.stats.inRental")}
            color={theme.success}
            bg={theme.successSoft}
            theme={theme}
            onPress={goToFleetRented}
          />
        </View>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          <Tile
            icon={CircleCheck}
            value={stats.available}
            label={t("dashboard.stats.available")}
            color={theme.info}
            bg={theme.infoSoft}
            theme={theme}
            onPress={goToFleetAvailable}
          />
          <Tile
            icon={Wrench}
            value={stats.maintenance}
            label={t("dashboard.stats.inRepair")}
            color={theme.warning}
            bg={theme.warningSoft}
            theme={theme}
            onPress={goToFleetMaintenance}
          />
        </View>
      </Animated.View>

      {/* Fleet breakdown bar */}
      <Animated.View
        entering={FadeInDown.delay(130).duration(400)}
        className="mt-5 px-4"
      >
        <Text
          variant="titleMedium"
          style={{ fontFamily: fontFamilies.semiBold, marginBottom: 10 }}
        >
          {t("dashboard.statsScreen.fleetBreakdown")}
        </Text>
        <View
          style={{
            backgroundColor: theme.surface,
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.borderLight,
          }}
        >
          {/* Stacked bar */}
          <View
            style={{
              flexDirection: "row",
              height: 10,
              borderRadius: 5,
              overflow: "hidden",
              marginBottom: 14,
            }}
          >
            <View
              style={{
                flex: stats.rented,
                backgroundColor: theme.success,
              }}
            />
            <View
              style={{
                flex: stats.available,
                backgroundColor: theme.info,
              }}
            />
            <View
              style={{
                flex: stats.maintenance,
                backgroundColor: theme.warning,
              }}
            />
          </View>

          <LegendRow
            color={theme.success}
            label={t("dashboard.stats.inRental")}
            value={`${stats.rented} · ${rentedPct}%`}
            theme={theme}
          />
          <LegendRow
            color={theme.info}
            label={t("dashboard.stats.available")}
            value={`${stats.available} · ${availablePct}%`}
            theme={theme}
          />
          <LegendRow
            color={theme.warning}
            label={t("dashboard.stats.inRepair")}
            value={`${stats.maintenance} · ${maintenancePct}%`}
            theme={theme}
            isLast
          />
        </View>
      </Animated.View>

      {/* Bookings snapshot */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        className="mt-5 px-4"
      >
        <View className="mb-2">
          <Text
            variant="titleMedium"
            style={{ fontFamily: fontFamilies.semiBold }}
          >
            {t("dashboard.statsScreen.bookings")}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Tile
            icon={KeyRound}
            value={active}
            label={t("dashboard.statsScreen.bookingsActive")}
            color={theme.success}
            bg={theme.successSoft}
            theme={theme}
            onPress={goToBookingsActive}
          />
          <Tile
            icon={CircleCheck}
            value={upcoming}
            label={t("dashboard.statsScreen.bookingsUpcoming")}
            color={theme.info}
            bg={theme.infoSoft}
            theme={theme}
            onPress={goToBookingsUpcoming}
          />
          <Tile
            icon={CheckCircle}
            value={completed}
            label={t("dashboard.statsScreen.bookingsCompleted")}
            color={theme.textTertiary}
            bg={theme.surfaceTertiary}
            theme={theme}
            onPress={goToBookingsCompleted}
          />
        </View>
      </Animated.View>
    </ScreenWrapper>
  );
}

interface TileProps {
  icon: LucideIcon;
  value: number;
  label: string;
  color: string;
  bg: string;
  theme: ReturnType<typeof useTheme>;
  onPress?: () => void;
}

const Tile = React.memo(function Tile({
  icon: Icon,
  value,
  label,
  color,
  bg,
  theme,
  onPress,
}: TileProps) {
  return (
    <Pressable
      onPress={() => {
        if (!onPress) return;
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      disabled={!onPress}
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: theme.surface,
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: theme.borderLight,
        transform: [{ scale: pressed && onPress ? 0.97 : 1 }],
      })}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <Icon size={18} color={color} strokeWidth={2} />
      </View>
      <Text
        variant="headlineSmall"
        style={{
          fontFamily: fontFamilies.bold,
          fontSize: 22,
          lineHeight: 26,
          color: theme.textPrimary,
        }}
      >
        {value}
      </Text>
      <Text
        variant="caption"
        color={theme.textSecondary}
        style={{ fontSize: 11, marginTop: 2 }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
});

interface LegendRowProps {
  color: string;
  label: string;
  value: string;
  theme: ReturnType<typeof useTheme>;
  isLast?: boolean;
}

const LegendRow = React.memo(function LegendRow({
  color,
  label,
  value,
  theme,
  isLast,
}: LegendRowProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: isLast ? 0 : 0.5,
        borderBottomColor: theme.border,
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
          marginRight: 10,
        }}
      />
      <Text variant="bodySmall" style={{ flex: 1 }} color={theme.textSecondary}>
        {label}
      </Text>
      <Text
        variant="labelSmall"
        style={{
          fontFamily: fontFamilies.semiBold,
          fontSize: 12,
          color: theme.textPrimary,
        }}
      >
        {value}
      </Text>
    </View>
  );
});
