import React, { useState, useCallback } from "react";
import { View, Pressable, ScrollView } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import {
  ChevronLeft,
  Check,
  CheckCircle,
  Fuel,
  Gauge,
  Key,
  AlertTriangle,
  PenTool,
  Car,
  RotateCcw,
  FileText,
} from "lucide-react-native";

import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Divider } from "@/components/ui/Divider";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { useToastStore } from "@/components/ui/Toast";
import { useBooking, useCloseBooking } from "@/hooks/useBookings";
import { useInspections } from "@/hooks/useInspections";
import { BookingInspectionStep } from "@/components/inspection/BookingInspectionStep";
import { useVehicle } from "@/hooks/useFleet";
import { useClient } from "@/hooks/useClients";
import { EmptyState } from "@/components/ui/EmptyState";
import { Image } from "@/components/ui/Image";
import { resolveVehicleImageSource } from "@/data/vehicleImages";
import { useTheme } from "@/hooks/useTheme";
import { shadows } from "@/theme/shadows";
import { ActivityIndicator } from "react-native";

const DEFAULT_INCLUDED_KM = 200;
const DEFAULT_EXTRA_KM_RATE = 0.3;

const MOCK_RETURN_DETECTIONS = [
  {
    id: "r1",
    location: "Front Bumper",
    type: "Scratch",
    confidence: 94,
    severity: "minor",
    preExisting: true,
  },
  {
    id: "r2",
    location: "Rear Bumper",
    type: "Dent",
    confidence: 91,
    severity: "moderate",
    preExisting: false,
  },
  {
    id: "r3",
    location: "Left Mirror",
    type: "Scratch",
    confidence: 82,
    severity: "minor",
    preExisting: false,
  },
  {
    id: "r4",
    location: "Right Side Panel",
    type: "Scratch",
    confidence: 45,
    severity: "minor",
    preExisting: false,
  },
];

const FUEL_LEVELS = ["Empty", "1/4", "1/2", "3/4", "Full"] as const;

const STEPS = ["Checklist", "Inspection", "Comparison"] as const;

// ── Step Progress Component ─────────────────────────────────────────────────

interface StepProgressProps {
  currentStep: number;
  steps: readonly string[];
}

function StepProgress({ currentStep, steps }: StepProgressProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 20,
        paddingHorizontal: 24,
      }}
    >
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        const circleSize = 32;
        const circleColor =
          isCompleted || isActive ? theme.accent : theme.surfaceTertiary;
        const textColor =
          isCompleted || isActive ? "#FFFFFF" : theme.textTertiary;

        return (
          <React.Fragment key={label}>
            {index > 0 && (
              <View
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor:
                    index <= currentStep ? theme.accent : theme.surfaceTertiary,
                  marginHorizontal: 4,
                }}
              />
            )}

            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: circleSize,
                  height: circleSize,
                  borderRadius: circleSize / 2,
                  backgroundColor: circleColor,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isCompleted ? (
                  <Check size={16} color="#FFFFFF" strokeWidth={3} />
                ) : (
                  <Text
                    variant="bodySmall"
                    color={textColor}
                    style={{ fontWeight: "700", fontSize: 13 }}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                variant="bodySmall"
                color={isActive ? theme.accent : theme.textTertiary}
                style={{
                  marginTop: 4,
                  fontWeight: isActive ? "600" : "400",
                  fontSize: 11,
                }}
              >
                {label}
              </Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ── Checklist Item ──────────────────────────────────────────────────────────

interface ChecklistItemProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  checked: boolean;
  onToggle: () => void;
  subtitle?: string;
}

function ChecklistItem({
  icon: Icon,
  label,
  checked,
  onToggle,
  subtitle,
}: ChecklistItemProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onToggle();
      }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 12,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: checked ? theme.accentSoft : theme.surfaceSecondary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={20} color={checked ? theme.accent : theme.textTertiary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          variant="bodyMedium"
          color={checked ? theme.textPrimary : theme.textSecondary}
          style={{ fontWeight: checked ? "600" : "400" }}
        >
          {label}
        </Text>
        {subtitle != null && (
          <Text variant="caption" color={theme.textTertiary}>
            {subtitle}
          </Text>
        )}
      </View>
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: checked ? theme.accent : theme.border,
          backgroundColor: checked ? theme.accent : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
      </View>
    </Pressable>
  );
}

// ── Signature Box ───────────────────────────────────────────────────────────

interface SignatureBoxProps {
  label: string;
  signed: boolean;
  onSign: () => void;
}

function SignatureBox({ label, signed, onSign }: SignatureBoxProps) {
  const theme = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <Text
        variant="bodySmall"
        color={theme.textSecondary}
        style={{ marginBottom: 8, fontWeight: "600" }}
      >
        {label}
      </Text>
      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onSign();
        }}
        style={{
          height: 100,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: signed ? theme.accent : theme.border,
          borderStyle: signed ? "solid" : "dashed",
          backgroundColor: signed ? theme.accentSoft : theme.surfaceSecondary,
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        {signed ? (
          <>
            <CheckCircle size={24} color={theme.accent} />
            <Text
              variant="bodySmall"
              color={theme.accent}
              style={{ fontWeight: "600" }}
            >
              Signed
            </Text>
          </>
        ) : (
          <>
            <PenTool size={20} color={theme.textTertiary} />
            <Text variant="bodySmall" color={theme.textTertiary}>
              Tap to sign
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

// ── Main Screen ─────────────────────────────────────────────────────────────

export default function ReturnScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const showToast = useToastStore((s) => s.show);
  const insets = useSafeAreaInsets();

  const {
    data: storeBooking,
    isLoading: isLoadingBooking,
    isError: isBookingError,
    refetch: refetchBooking,
  } = useBooking(id);
  const { data: vehicle } = useVehicle(storeBooking?.vehicleId ?? "");
  const { data: client } = useClient(storeBooking?.clientId ?? "");
  const { data: relatedInspections = [] } = useInspections(
    storeBooking?.id ? { bookingId: storeBooking.id } : undefined,
  );
  const preRentalInspection = relatedInspections.find(
    (i) => i.type === "pre-rental",
  );

  const closeMutation = useCloseBooking();

  const [postInspectionId, setPostInspectionId] = useState<string | null>(null);
  const existingPostInspectionId = relatedInspections.find(
    (i) => i.type === "post-rental",
  )?.id;

  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Step 1 state
  const [fuelLevel, setFuelLevel] = useState<number | null>(null);
  const [keysReturned, setKeysReturned] = useState(false);
  const [mileageValue, setMileageValue] = useState("");

  // Step 3 state
  const [agentSigned, setAgentSigned] = useState(false);
  const [clientSigned, setClientSigned] = useState(false);

  const days =
    storeBooking != null
      ? Math.max(
          1,
          Math.round(
            (Date.parse(storeBooking.endDate) -
              Date.parse(storeBooking.startDate)) /
              (1000 * 60 * 60 * 24),
          ) + 1,
        )
      : 0;
  const booking = storeBooking
    ? {
        id: storeBooking.id,
        client: {
          name: storeBooking.clientName,
          phone: client?.phone ?? "—",
          licenseNo: "—",
        },
        vehicle: {
          name: storeBooking.vehicleName,
          plate: vehicle?.licensePlate ?? "—",
          color: vehicle?.color ?? "—",
          vin: "—",
        },
        dates: {
          start: storeBooking.startDate,
          end: storeBooking.endDate,
          days,
        },
        mileageOut: storeBooking.startMileage ?? 0,
      }
    : null;

  // ── Mileage (pulled from the real booking when available) ────────────────
  const startMileage = storeBooking?.startMileage ?? null;
  const includedKm = storeBooking?.includedKm ?? DEFAULT_INCLUDED_KM;
  const extraKmRate = storeBooking?.extraKmRate ?? DEFAULT_EXTRA_KM_RATE;

  const parsedReturn = Number.parseInt(mileageValue.replace(/[^0-9]/g, ""), 10);
  const hasReturnInput =
    mileageValue.trim().length > 0 && Number.isFinite(parsedReturn);
  const isReturnMileageValid =
    hasReturnInput && startMileage != null && parsedReturn > startMileage;

  const kmDriven =
    isReturnMileageValid && startMileage != null
      ? parsedReturn - startMileage
      : 0;
  const kmOverage = Math.max(0, kmDriven - includedKm);
  const overageCost = Math.round(kmOverage * extraKmRate * 100) / 100;

  const allChecked = fuelLevel !== null && isReturnMileageValid && keysReturned;

  const newDamages = MOCK_RETURN_DETECTIONS.filter(
    (d) => !d.preExisting && d.confidence >= 70,
  );
  const preExistingDamages = MOCK_RETURN_DETECTIONS.filter(
    (d) => d.preExisting && d.confidence >= 70,
  );

  const handleNext = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep < 2) {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    } else {
      router.back();
    }
  }, [currentStep, router]);

  const handleComplete = useCallback(async () => {
    if (!id) {
      showToast({
        variant: "error",
        title: t("bookings.mileage.errorBookingNotFound", "Booking not found"),
      });
      return;
    }

    if (!isReturnMileageValid) {
      showToast({
        variant: "error",
        title: t(
          "bookings.mileage.errorReturnBelowStart",
          "Return mileage must be higher than departure",
        ),
      });
      return;
    }

    try {
      await closeMutation.mutateAsync({
        id,
        payload: {
          returnMileage: parsedReturn,
          fuelLevel: fuelLevel ?? undefined,
          postInspectionId: postInspectionId ?? undefined,
        },
      });
    } catch (err) {
      showToast({
        variant: "error",
        title: t("bookings.mileage.errorInvalid", "Invalid mileage"),
        message: err instanceof Error ? err.message : undefined,
      });
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCompleted(true);
  }, [
    id,
    isReturnMileageValid,
    parsedReturn,
    fuelLevel,
    postInspectionId,
    closeMutation,
    showToast,
    t,
  ]);

  // ── Loading / not-found guards ─────────────────────────────────────────

  if (isLoadingBooking && !storeBooking) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color={theme.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if ((isBookingError && !storeBooking) || !booking) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View className="flex-1 items-center justify-center px-4 py-20">
          <EmptyState
            icon={Car}
            title={t("bookings.detail.notFound", "Booking not found")}
            actionLabel={t("common.retry", "Retry")}
            onAction={() => void refetchBooking()}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ── Success Screen ──────────────────────────────────────────────────────

  if (completed) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <StatusBar style="dark" />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 32,
          }}
        >
          <Animated.View entering={ZoomIn.springify().damping(12)}>
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: theme.successSoft,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <LinearGradient
                colors={[theme.success, "#34D399"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check size={40} color="#FFFFFF" strokeWidth={3} />
              </LinearGradient>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Text
              variant="headlineLarge"
              align="center"
              style={{ marginBottom: 8 }}
            >
              {t("return.success.title", { defaultValue: "Return Complete!" })}
            </Text>
            <Text
              variant="bodyMedium"
              color={theme.textSecondary}
              align="center"
              style={{ marginBottom: 8 }}
            >
              {t("return.success.subtitle", {
                defaultValue: "Vehicle return processed successfully",
              })}
            </Text>
            {newDamages.length > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <AlertTriangle size={14} color={theme.warning} />
                <Text variant="bodySmall" color={theme.warning}>
                  {t("return.success.newDamages", {
                    defaultValue: "{{count}} new damage(s) recorded",
                    count: newDamages.length,
                  })}
                </Text>
              </View>
            )}
            <Text
              variant="bodySmall"
              color={theme.textTertiary}
              align="center"
              style={{ marginBottom: 32 }}
            >
              {t("return.success.booking", {
                defaultValue: "Booking {{id}}",
                id: booking.id,
              })}
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(500).springify()}
            style={{ width: "100%" }}
          >
            <Button fullWidth onPress={() => router.back()}>
              {t("return.success.done", { defaultValue: "Done" })}
            </Button>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Step 1: Return Checklist ────────────────────────────────────────────

  const renderStep1 = () => (
    <Animated.View entering={FadeIn.duration(300)} style={{ gap: 16 }}>
      {/* Return Info Banner */}
      <Card variant="accent" padding="md">
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <RotateCcw size={20} color="#FFFFFF" />
          <View style={{ flex: 1 }}>
            <Text variant="bodySmall" color="#FFFFFF" style={{ opacity: 0.8 }}>
              {t("return.checklist.banner", {
                defaultValue: "Returning vehicle",
              })}
            </Text>
            <Text
              variant="titleMedium"
              color="#FFFFFF"
              style={{ fontWeight: "700" }}
            >
              {booking.vehicle.name} — {booking.client.name}
            </Text>
          </View>
        </View>
      </Card>

      <ReturnVehicleThumbnail vehicle={vehicle} theme={theme} />

      {/* Pre-rental reference (read-only) */}
      {preRentalInspection && (
        <Pressable
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(
              `/(app)/(inspections)/${preRentalInspection.id}` as never,
            );
          }}
          style={{
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: theme.accentSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileText size={15} color={theme.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={{ fontWeight: "600" }}>
                {t("return.preRentalReference.title", "Pre-rental reference")}
              </Text>
              <Text variant="caption" color={theme.textTertiary}>
                {t(
                  "return.preRentalReference.subtitle",
                  "Condition recorded at pickup",
                )}
              </Text>
            </View>
            <Badge variant="info" size="sm">
              {preRentalInspection.date}
            </Badge>
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text variant="caption" color={theme.textTertiary}>
                {t("return.preRentalReference.mileage", "Mileage at pickup")}
              </Text>
              <Text
                variant="bodyMedium"
                style={{ fontWeight: "600", marginTop: 2 }}
              >
                {preRentalInspection.mileage.toLocaleString()} km
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="caption" color={theme.textTertiary}>
                {t("return.preRentalReference.fuel", "Fuel at pickup")}
              </Text>
              <Text
                variant="bodyMedium"
                style={{ fontWeight: "600", marginTop: 2 }}
              >
                {preRentalInspection.fuelLevel}%
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="caption" color={theme.textTertiary}>
                {t("return.preRentalReference.damages", "Pre-existing damages")}
              </Text>
              <Text
                variant="bodyMedium"
                color={
                  preRentalInspection.totalDamagesAI +
                    preRentalInspection.totalDamagesManual >
                  0
                    ? theme.warning
                    : theme.success
                }
                style={{ fontWeight: "600", marginTop: 2 }}
              >
                {preRentalInspection.totalDamagesAI +
                  preRentalInspection.totalDamagesManual}
              </Text>
            </View>
          </View>
        </Pressable>
      )}

      {/* Fuel Level */}
      <Card>
        <Text variant="titleLarge" style={{ marginBottom: 4 }}>
          {t("return.checklist.fuelTitle", { defaultValue: "Fuel Level" })}
        </Text>
        <Text
          variant="bodySmall"
          color={theme.textSecondary}
          style={{ marginBottom: 12 }}
        >
          {t("return.checklist.fuelSubtitle", {
            defaultValue: "Select the current fuel level",
          })}
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {FUEL_LEVELS.map((level, index) => {
            const isSelected = fuelLevel === index;
            return (
              <Pressable
                key={level}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFuelLevel(index);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: isSelected ? theme.accent : theme.border,
                  backgroundColor: isSelected
                    ? theme.accentSoft
                    : theme.surfaceSecondary,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                <Fuel
                  size={18}
                  color={isSelected ? theme.accent : theme.textTertiary}
                />
                <Text
                  variant="labelSmall"
                  color={isSelected ? theme.accent : theme.textTertiary}
                  style={{
                    fontWeight: isSelected ? "700" : "400",
                    fontSize: 10,
                  }}
                >
                  {level}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* Mileage */}
      <Card>
        <Text variant="titleLarge" style={{ marginBottom: 4 }}>
          {t("bookings.mileage.sectionTitle", "Mileage")}
        </Text>
        <Text
          variant="bodySmall"
          color={theme.textSecondary}
          style={{ marginBottom: 12 }}
        >
          {t("bookings.mileage.helperIncluded", {
            defaultValue: "{{included}} km included · CHF {{rate}} / extra km",
            included: includedKm,
            rate: extraKmRate.toFixed(2),
          })}
        </Text>

        {/* Departure km — read-only */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 10,
            paddingHorizontal: 12,
            backgroundColor: theme.surfaceSecondary,
            borderRadius: 12,
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Gauge size={16} color={theme.textTertiary} />
            <Text variant="bodySmall" color={theme.textSecondary}>
              {t("bookings.mileage.startMileageReadonly", "Departure mileage")}
            </Text>
          </View>
          <Text variant="bodyMedium" style={{ fontWeight: "600" }}>
            {startMileage != null
              ? `${startMileage.toLocaleString()} ${t("bookings.mileage.unit", "km")}`
              : "—"}
          </Text>
        </View>

        {/* Return mileage — input */}
        <Input
          label={t("bookings.mileage.returnMileageLabel", "Return mileage")}
          placeholder={t(
            "bookings.mileage.returnMileagePlaceholder",
            "Enter mileage",
          )}
          value={mileageValue}
          onChangeText={(text) => setMileageValue(text.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
          leftIcon={Gauge}
          error={
            hasReturnInput &&
            startMileage != null &&
            parsedReturn <= startMileage
              ? t(
                  "bookings.mileage.errorReturnBelowStart",
                  "Return mileage must be higher than departure",
                )
              : startMileage == null
                ? t(
                    "bookings.mileage.errorMissingStart",
                    "Departure mileage missing",
                  )
                : undefined
          }
        />

        {/* Live computation panel */}
        {isReturnMileageValid && (
          <View style={{ marginTop: 12, gap: 8 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 8,
                paddingHorizontal: 12,
                backgroundColor: theme.surfaceSecondary,
                borderRadius: 10,
              }}
            >
              <Text variant="bodySmall" color={theme.textSecondary}>
                {t("bookings.mileage.kmDriven", "Km driven")}
              </Text>
              <Text
                variant="bodySmall"
                color={theme.accent}
                style={{ fontWeight: "700" }}
              >
                {kmDriven.toLocaleString()} {t("bookings.mileage.unit", "km")}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 8,
                paddingHorizontal: 12,
                backgroundColor:
                  kmOverage > 0 ? theme.warningSoft : theme.surfaceSecondary,
                borderRadius: 10,
              }}
            >
              <Text
                variant="bodySmall"
                color={kmOverage > 0 ? theme.warning : theme.textSecondary}
              >
                {t("bookings.mileage.overage", "Overage")}
              </Text>
              <Text
                variant="bodySmall"
                color={kmOverage > 0 ? theme.warning : theme.textSecondary}
                style={{ fontWeight: "700" }}
              >
                {kmOverage.toLocaleString()} {t("bookings.mileage.unit", "km")}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 8,
                paddingHorizontal: 12,
                backgroundColor:
                  kmOverage > 0 ? theme.warningSoft : theme.surfaceSecondary,
                borderRadius: 10,
              }}
            >
              <Text
                variant="bodySmall"
                color={kmOverage > 0 ? theme.warning : theme.textSecondary}
              >
                {t("bookings.mileage.extraCost", "Extra cost")}
              </Text>
              <Text
                variant="bodySmall"
                color={kmOverage > 0 ? theme.warning : theme.textSecondary}
                style={{ fontWeight: "700" }}
              >
                CHF {overageCost.toFixed(2)}
              </Text>
            </View>
          </View>
        )}
      </Card>

      {/* Keys */}
      <Card>
        <Text variant="titleLarge" style={{ marginBottom: 12 }}>
          {t("return.checklist.returnItems", {
            defaultValue: "Return Items",
          })}
        </Text>
        <ChecklistItem
          icon={Key}
          label={t("return.checklist.keys", {
            defaultValue: "Keys returned",
          })}
          checked={keysReturned}
          onToggle={() => setKeysReturned((v) => !v)}
        />
      </Card>

      {/* Continue */}
      <Button fullWidth disabled={!allChecked} onPress={handleNext}>
        {t("return.checklist.continue", {
          defaultValue: "Continue to Inspection",
        })}
      </Button>
    </Animated.View>
  );

  // ── Step 2: Post-Return Inspection ──────────────────────────────────────

  const renderStep2 = () =>
    storeBooking ? (
      <BookingInspectionStep
        bookingId={storeBooking.id}
        vehicleId={storeBooking.vehicleId}
        vehicleName={booking.vehicle.name}
        clientName={booking.client.name}
        type="post-rental"
        existingInspectionId={existingPostInspectionId}
        continueLabel={t("return.inspection.continue", {
          defaultValue: "Continue to Comparison",
        })}
        onInspectionReady={setPostInspectionId}
        onContinue={handleNext}
      />
    ) : null;

  // ── Step 3: Damage Comparison + Sign-off ────────────────────────────────

  const renderStep3 = () => (
    <Animated.View entering={FadeIn.duration(300)} style={{ gap: 16 }}>
      {/* Damage Comparison */}
      <Card>
        <View style={{ gap: 12 }}>
          <Text variant="titleLarge">
            {t("return.comparison.title", {
              defaultValue: "Damage Comparison",
            })}
          </Text>
          <Text variant="bodySmall" color={theme.textSecondary}>
            {t("return.comparison.subtitle", {
              defaultValue: "Before (pickup) vs. After (return)",
            })}
          </Text>

          <Divider />

          {/* Pre-existing damages */}
          <View style={{ gap: 8 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.textTertiary,
                }}
              />
              <Text
                variant="titleSmall"
                color={theme.textSecondary}
                style={{ fontWeight: "600" }}
              >
                {t("return.comparison.preExisting", {
                  defaultValue: "Pre-existing (from pickup)",
                })}
              </Text>
            </View>
            {preExistingDamages.length > 0 ? (
              preExistingDamages.map((d) => (
                <View
                  key={d.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    backgroundColor: theme.surfaceSecondary,
                    borderRadius: 10,
                  }}
                >
                  <Text variant="bodySmall">
                    {d.type} — {d.location}
                  </Text>
                  <Badge variant="neutral" size="sm">
                    {t("return.comparison.unchanged", {
                      defaultValue: "Unchanged",
                    })}
                  </Badge>
                </View>
              ))
            ) : (
              <Text
                variant="bodySmall"
                color={theme.textTertiary}
                style={{ paddingLeft: 16 }}
              >
                {t("return.comparison.noPrior", {
                  defaultValue: "No pre-existing damages",
                })}
              </Text>
            )}
          </View>

          <Divider />

          {/* New damages */}
          <View style={{ gap: 8 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.danger,
                }}
              />
              <Text
                variant="titleSmall"
                color={theme.danger}
                style={{ fontWeight: "600" }}
              >
                {t("return.comparison.newDamages", {
                  defaultValue: "New Damages",
                })}{" "}
                ({newDamages.length})
              </Text>
            </View>
            {newDamages.length > 0 ? (
              newDamages.map((d) => (
                <View
                  key={d.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    backgroundColor: theme.dangerSoft,
                    borderRadius: 10,
                  }}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="bodySmall" style={{ fontWeight: "600" }}>
                      {d.type} — {d.location}
                    </Text>
                    <Text variant="caption" color={theme.textTertiary}>
                      {d.confidence}%{" "}
                      {t("return.comparison.confidence", {
                        defaultValue: "confidence",
                      })}{" "}
                      · {d.severity}
                    </Text>
                  </View>
                  <Badge variant="danger" size="sm">
                    {t("return.comparison.new", { defaultValue: "New" })}
                  </Badge>
                </View>
              ))
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  backgroundColor: theme.successSoft,
                  borderRadius: 10,
                }}
              >
                <CheckCircle size={16} color={theme.success} />
                <Text
                  variant="bodySmall"
                  color={theme.success}
                  style={{ fontWeight: "600" }}
                >
                  {t("return.comparison.noDamages", {
                    defaultValue: "No new damages detected",
                  })}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Card>

      {/* Mileage Summary */}
      <Card>
        <Text variant="titleLarge" style={{ marginBottom: 12 }}>
          {t("return.comparison.summary", {
            defaultValue: "Return Summary",
          })}
        </Text>
        <View style={{ gap: 8 }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text variant="bodySmall" color={theme.textSecondary}>
              {t("bookings.mileage.startMileageReadonly", "Departure mileage")}
            </Text>
            <Text variant="bodySmall" style={{ fontWeight: "600" }}>
              {startMileage != null
                ? `${startMileage.toLocaleString()} ${t("bookings.mileage.unit", "km")}`
                : "—"}
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text variant="bodySmall" color={theme.textSecondary}>
              {t("bookings.mileage.returnMileageStored", "Return mileage")}
            </Text>
            <Text variant="bodySmall" style={{ fontWeight: "600" }}>
              {hasReturnInput
                ? `${parsedReturn.toLocaleString()} ${t("bookings.mileage.unit", "km")}`
                : "—"}
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text variant="bodySmall" color={theme.textSecondary}>
              {t("bookings.mileage.kmDriven", "Km driven")}
            </Text>
            <Text
              variant="bodySmall"
              color={theme.accent}
              style={{ fontWeight: "700" }}
            >
              {kmDriven.toLocaleString()} {t("bookings.mileage.unit", "km")}
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text variant="bodySmall" color={theme.textSecondary}>
              {t("bookings.mileage.overage", "Overage")}
            </Text>
            <Text
              variant="bodySmall"
              color={kmOverage > 0 ? theme.warning : theme.textSecondary}
              style={{ fontWeight: "700" }}
            >
              {kmOverage.toLocaleString()} {t("bookings.mileage.unit", "km")}
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text variant="bodySmall" color={theme.textSecondary}>
              {t("bookings.mileage.extraCost", "Extra cost")}
            </Text>
            <Text
              variant="bodySmall"
              color={kmOverage > 0 ? theme.warning : theme.textSecondary}
              style={{ fontWeight: "700" }}
            >
              CHF {overageCost.toFixed(2)}
            </Text>
          </View>
          <Divider />
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text variant="bodySmall" color={theme.textSecondary}>
              {t("return.comparison.fuelReturn", {
                defaultValue: "Fuel Level",
              })}
            </Text>
            <Text variant="bodySmall" style={{ fontWeight: "600" }}>
              {fuelLevel !== null ? FUEL_LEVELS[fuelLevel] : "—"}
            </Text>
          </View>
        </View>
      </Card>

      {/* Return Sign-off */}
      <Card>
        <Text variant="titleLarge" style={{ marginBottom: 12 }}>
          {t("return.comparison.signoff", {
            defaultValue: "Return Sign-off",
          })}
        </Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <SignatureBox
            label={t("return.comparison.agentSignature", {
              defaultValue: "Agent",
            })}
            signed={agentSigned}
            onSign={() => setAgentSigned((v) => !v)}
          />
          <SignatureBox
            label={t("return.comparison.clientSignature", {
              defaultValue: "Client",
            })}
            signed={clientSigned}
            onSign={() => setClientSigned((v) => !v)}
          />
        </View>
      </Card>

      {/* Complete Button */}
      <View style={{ ...shadows.accent, borderRadius: 9999 }}>
        <LinearGradient
          colors={[theme.accentGradientStart, theme.accentGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 9999, overflow: "hidden" }}
        >
          <Pressable
            onPress={handleComplete}
            disabled={!agentSigned || !clientSigned}
            style={{
              height: 52,
              borderRadius: 9999,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              opacity: agentSigned && clientSigned ? 1 : 0.5,
            }}
          >
            <CheckCircle size={20} color="#FFFFFF" />
            <Text
              variant="bodyLarge"
              color="#FFFFFF"
              style={{ fontWeight: "700" }}
            >
              {t("return.comparison.complete", {
                defaultValue: "Complete Return",
              })}
            </Text>
          </Pressable>
        </LinearGradient>
      </View>
    </Animated.View>
  );

  // ── Main Layout ─────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 8,
          gap: 12,
        }}
      >
        <IconButton
          icon={ChevronLeft}
          variant="ghost"
          size="md"
          onPress={handleBack}
        />
        <View style={{ flex: 1 }}>
          <Text variant="headlineSmall">
            {t("return.title", { defaultValue: "Vehicle Return" })}
          </Text>
          <Text variant="bodySmall" color={theme.textSecondary}>
            {booking.id}
          </Text>
        </View>
      </View>

      {/* Step Indicator */}
      <StepProgress currentStep={currentStep} steps={STEPS} />

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 110 + insets.bottom,
        }}
        bounces
      >
        {currentStep === 0 && renderStep1()}
        {currentStep === 1 && renderStep2()}
        {currentStep === 2 && renderStep3()}
      </ScrollView>
    </SafeAreaView>
  );
}

interface ReturnVehicleThumbnailProps {
  vehicle: Parameters<typeof resolveVehicleImageSource>[0];
  theme: ReturnType<typeof useTheme>;
}

function ReturnVehicleThumbnail({
  vehicle,
  theme,
}: ReturnVehicleThumbnailProps) {
  const source = resolveVehicleImageSource(vehicle);
  if (!source) return null;
  return (
    <View
      style={{
        width: "100%",
        height: 140,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: theme.surfaceTertiary,
      }}
    >
      <Image
        source={source}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        transition={200}
      />
    </View>
  );
}
