import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  Bell,
  CalendarPlus,
  Car,
  CheckCircle,
  CircleCheck,
  Clock,
  FileCheck,
  KeyRound,
  ScanLine,
  UserPlus,
  Wrench,
} from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import type { LucideIcon } from "lucide-react-native";

import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/stores/useAuthStore";
import { fontFamilies } from "@/theme/typography";
import { shadows } from "@/theme/shadows";
import { getVehicleImage } from "@/data/vehicleImages";
import {
  activeRentals,
  upcomingReturns,
  fleetStats,
  recentActivity,
  type ActiveRental,
  type UpcomingReturn,
  type ActivityType,
} from "@/data/dashboard";

// ── Helpers ─────────────────────────────────────────────────────────────────

function getGreetingKey(): string {
  const h = new Date().getHours();
  if (h < 12) return "dashboard.greeting.morning";
  if (h < 18) return "dashboard.greeting.afternoon";
  return "dashboard.greeting.evening";
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getReturnBadge(
  returnDate: string,
  t: (k: string, o?: Record<string, unknown>) => string
): { variant: "success" | "warning" | "danger"; label: string } {
  const now = new Date("2026-04-08T08:00:00");
  const ret = new Date(returnDate);
  const diffMs = ret.getTime() - now.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffH < 0) return { variant: "danger", label: t("dashboard.overdue") };
  if (diffH < 24)
    return {
      variant: "warning",
      label: t("dashboard.dueIn", { hours: diffH }),
    };
  return { variant: "success", label: `${Math.ceil(diffH / 24)}d` };
}

function getTimeAgo(timestamp: string): string {
  const now = new Date("2026-04-08T08:00:00");
  const then = new Date(timestamp);
  const diffMin = Math.floor(
    (now.getTime() - then.getTime()) / (1000 * 60)
  );
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  return `${Math.floor(diffH / 24)}d`;
}

const activityIcons: Record<ActivityType, { icon: LucideIcon; color: string }> =
  {
    inspection_completed: { icon: ScanLine, color: "#00D4AA" },
    booking_created: { icon: CalendarPlus, color: "#448AFF" },
    vehicle_returned: { icon: CheckCircle, color: "#00C853" },
    violation_logged: { icon: AlertTriangle, color: "#FF3D57" },
    contract_signed: { icon: FileCheck, color: "#FFB300" },
  };

// ── Dashboard Screen ────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [refreshing, setRefreshing] = useState(false);

  const dateStr = useMemo(getFormattedDate, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <ScreenWrapper
      scroll
      refreshing={refreshing}
      onRefresh={onRefresh}
      padded={false}
    >
      {/* ── Header ────────────────────────────────────────────────── */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="px-4 pt-4 pb-2"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text variant="headlineLarge">
              {t(getGreetingKey())},{" "}
              {user?.name?.split(" ")[0] ?? "User"}
            </Text>
            <Text
              variant="bodySmall"
              color={theme.textTertiary}
              className="mt-1"
            >
              {dateStr}
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/(app)/(more)/notifications");
              }}
            >
              <View>
                <Bell size={24} color={theme.textSecondary} strokeWidth={1.6} />
                <View
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: theme.danger,
                    borderWidth: 1.5,
                    borderColor: theme.background,
                  }}
                />
              </View>
            </Pressable>
            <Pressable
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/(app)/(more)/settings/profile");
              }}
            >
              <Avatar name={user?.name ?? "U"} size="sm" />
            </Pressable>
          </View>
        </View>
      </Animated.View>

      {/* ── Quick Stats ───────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-4 gap-3 py-3"
        >
          <StatCard
            icon={Car}
            value={fleetStats.total}
            label={t("dashboard.stats.totalFleet")}
            color={theme.accent}
            bg={theme.accentSoft}
            theme={theme}
            onPress={() => router.push("/(app)/(fleet)")}
          />
          <StatCard
            icon={KeyRound}
            value={fleetStats.rented}
            label={t("dashboard.stats.inRental")}
            color={theme.success}
            bg={theme.successSoft}
            theme={theme}
            onPress={() => router.push("/(app)/(fleet)")}
          />
          <StatCard
            icon={CircleCheck}
            value={fleetStats.available}
            label={t("dashboard.stats.available")}
            color={theme.info}
            bg={theme.infoSoft}
            theme={theme}
            onPress={() => router.push("/(app)/(fleet)")}
          />
          <StatCard
            icon={Wrench}
            value={fleetStats.maintenance}
            label={t("dashboard.stats.inRepair")}
            color={theme.warning}
            bg={theme.warningSoft}
            theme={theme}
            onPress={() => router.push("/(app)/(fleet)")}
          />
        </ScrollView>
      </Animated.View>

      {/* ── Active Rentals ────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <SectionHeader
          title={t("dashboard.activeRentals")}
          action={t("dashboard.seeAll")}
          onAction={() => router.push("/(app)/(bookings)")}
          theme={theme}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-4 gap-3 pb-2"
        >
          {activeRentals.map((rental) => (
            <RentalCard
              key={rental.id}
              rental={rental}
              theme={theme}
              t={t}
              onPress={() =>
                router.push({
                  pathname: "/(app)/(bookings)/[id]",
                  params: { id: rental.bookingId },
                })
              }
            />
          ))}
        </ScrollView>
      </Animated.View>

      {/* ── Returning Today ───────────────────────────────────────── */}
      <Animated.View
        entering={FadeInDown.delay(300).duration(400)}
        className="mt-4"
      >
        <SectionHeader
          title={t("dashboard.returningToday")}
          badge={upcomingReturns.length}
          theme={theme}
        />
        <View className="px-4">
          {upcomingReturns.length === 0 ? (
            <EmptyState
              icon={Clock}
              title={t("dashboard.noReturns")}
              className="py-8"
            />
          ) : (
            upcomingReturns.map((ret, idx) => (
              <ReturnRow
                key={ret.id}
                item={ret}
                isLast={idx === upcomingReturns.length - 1}
                theme={theme}
                t={t}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/(bookings)/[id]",
                    params: { id: ret.bookingId },
                  })
                }
              />
            ))
          )}
        </View>
      </Animated.View>

      {/* ── Quick Actions ─────────────────────────────────────────── */}
      <Animated.View
        entering={FadeInDown.delay(400).duration(400)}
        className="mt-6"
      >
        <SectionHeader
          title={t("dashboard.quickActions")}
          theme={theme}
        />
        <View className="px-4 flex-row flex-wrap gap-3">
          <QuickAction
            icon={ScanLine}
            label={t("dashboard.newInspection")}
            theme={theme}
            onPress={() => router.push("/(app)/(inspections)/new")}
          />
          <QuickAction
            icon={CalendarPlus}
            label={t("dashboard.newBooking")}
            theme={theme}
            onPress={() => router.push("/(app)/(bookings)/new")}
          />
          <QuickAction
            icon={UserPlus}
            label={t("dashboard.addClient")}
            theme={theme}
            onPress={() => router.push("/(app)/(more)/clients/new")}
          />
          <QuickAction
            icon={AlertTriangle}
            label={t("dashboard.violations")}
            theme={theme}
            onPress={() => router.push("/(app)/(more)/violations")}
          />
        </View>
      </Animated.View>

      {/* ── Recent Activity ───────────────────────────────────────── */}
      <Animated.View
        entering={FadeInDown.delay(500).duration(400)}
        className="mt-6 mb-6"
      >
        <SectionHeader
          title={t("dashboard.recentActivity")}
          theme={theme}
        />
        <View
          className="mx-4 rounded-2xl overflow-hidden"
          style={{ backgroundColor: theme.surface }}
        >
          {recentActivity.slice(0, 5).map((item, idx) => {
            const cfg = activityIcons[item.type];
            const Icon = cfg.icon;
            const isLast = idx === 4;
            return (
              <View
                key={item.id}
                className="flex-row items-center px-4 py-3"
                style={
                  !isLast
                    ? { borderBottomWidth: 0.5, borderBottomColor: theme.border }
                    : undefined
                }
              >
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: `${cfg.color}20` }}
                >
                  <Icon size={16} color={cfg.color} strokeWidth={1.8} />
                </View>
                <View className="flex-1 mr-2">
                  <Text variant="bodySmall" numberOfLines={1}>
                    {item.description}
                  </Text>
                </View>
                <Text variant="caption" color={theme.textTertiary}>
                  {getTimeAgo(item.timestamp)}
                </Text>
              </View>
            );
          })}
        </View>
        <Pressable className="mt-3 items-center">
          <Text variant="titleSmall" color={theme.accent}>
            {t("dashboard.viewAll")}
          </Text>
        </Pressable>
      </Animated.View>
    </ScreenWrapper>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

interface StatCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  color: string;
  bg: string;
  theme: ReturnType<typeof useTheme>;
  onPress: () => void;
}

function StatCard({
  icon: Icon,
  value,
  label,
  color,
  bg,
  theme,
  onPress,
}: StatCardProps) {
  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      className="rounded-xl px-4 py-3"
      style={{
        backgroundColor: theme.surfaceTertiary,
        minWidth: 120,
      }}
    >
      <View
        className="w-9 h-9 rounded-lg items-center justify-center mb-2"
        style={{ backgroundColor: bg }}
      >
        <Icon size={18} color={color} strokeWidth={1.8} />
      </View>
      <Animated.Text
        style={{
          fontFamily: fontFamilies.bold,
          fontSize: 20,
          lineHeight: 28,
          color: theme.textPrimary,
        }}
      >
        {value}
      </Animated.Text>
      <Text variant="caption" color={theme.textSecondary}>
        {label}
      </Text>
    </Pressable>
  );
}

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
  badge?: number;
  theme: ReturnType<typeof useTheme>;
}

function SectionHeader({
  title,
  action,
  onAction,
  badge,
  theme,
}: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-4 mb-3 mt-2">
      <View className="flex-row items-center gap-2">
        <Text variant="titleLarge">{title}</Text>
        {badge !== undefined && (
          <Badge variant="accent" size="sm">
            {badge}
          </Badge>
        )}
      </View>
      {action && (
        <Pressable onPress={onAction}>
          <Text variant="titleSmall" color={theme.accent}>
            {action}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

interface RentalCardProps {
  rental: ActiveRental;
  theme: ReturnType<typeof useTheme>;
  t: (k: string, o?: Record<string, unknown>) => string;
  onPress: () => void;
}

function RentalCard({ rental, theme, t, onPress }: RentalCardProps) {
  const badge = getReturnBadge(rental.returnDate, t);

  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: theme.surface,
        width: 240,
        ...shadows.md,
      }}
    >
      {/* Vehicle image */}
      <View className="h-32 overflow-hidden" style={{ backgroundColor: theme.surfaceTertiary }}>
        {getVehicleImage(rental.vehicle.id) ? (
          <Image
            source={getVehicleImage(rental.vehicle.id)!}
            style={{ width: 240, height: 128 }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Car size={36} color={theme.textTertiary} strokeWidth={1} />
          </View>
        )}
      </View>

      <View className="p-3">
        <Text variant="titleMedium" numberOfLines={1}>
          {rental.vehicle.name}
        </Text>
        <Text
          variant="bodySmall"
          color={theme.textSecondary}
          numberOfLines={1}
          className="mt-0.5"
        >
          {rental.client.firstName} {rental.client.lastName}
        </Text>
        <View className="flex-row items-center justify-between mt-2">
          <Text variant="caption" color={theme.textTertiary}>
            {rental.returnDate}
          </Text>
          <Badge variant={badge.variant} size="sm">
            {badge.label}
          </Badge>
        </View>
      </View>
    </Pressable>
  );
}

interface ReturnRowProps {
  item: UpcomingReturn;
  isLast: boolean;
  theme: ReturnType<typeof useTheme>;
  t: (k: string, o?: Record<string, unknown>) => string;
  onPress: () => void;
}

function ReturnRow({ item, isLast, theme, t, onPress }: ReturnRowProps) {
  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      className="flex-row items-center py-3"
      style={
        !isLast
          ? { borderBottomWidth: 0.5, borderBottomColor: theme.border }
          : undefined
      }
    >
      <View
        className="w-11 h-11 rounded-xl overflow-hidden mr-3"
        style={{ backgroundColor: theme.surfaceTertiary }}
      >
        {getVehicleImage(item.vehicle.id) ? (
          <Image
            source={getVehicleImage(item.vehicle.id)!}
            style={{ width: 44, height: 44 }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Car size={18} color={theme.textSecondary} strokeWidth={1.5} />
          </View>
        )}
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text variant="titleMedium" numberOfLines={1}>
            {item.vehicle.name}
          </Text>
          <Text variant="caption" color={theme.textTertiary}>
            {item.vehicle.licensePlate}
          </Text>
        </View>
        <Text variant="bodySmall" color={theme.textSecondary}>
          {item.client.firstName} {item.client.lastName}
        </Text>
      </View>
      <View className="items-end">
        <Text variant="titleSmall" color={theme.accent}>
          {item.returnTime}
        </Text>
      </View>
    </Pressable>
  );
}

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  theme: ReturnType<typeof useTheme>;
  onPress: () => void;
}

function QuickAction({ icon: Icon, label, theme, onPress }: QuickActionProps) {
  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      className="rounded-xl items-center justify-center py-4"
      style={{
        backgroundColor: theme.surfaceTertiary,
        width: "48%" as unknown as number,
        flexBasis: "47%",
        flexGrow: 1,
      }}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mb-2"
        style={{ backgroundColor: theme.accentSoft }}
      >
        <Icon size={20} color={theme.accent} strokeWidth={1.6} />
      </View>
      <Text variant="titleSmall" align="center">
        {label}
      </Text>
    </Pressable>
  );
}
