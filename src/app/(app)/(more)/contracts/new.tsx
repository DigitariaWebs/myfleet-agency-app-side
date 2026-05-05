import React, { useState, useCallback, useMemo } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  ChevronLeft,
  CalendarDays,
  Car,
  Check,
  PenLine,
  Send,
  Save,
  User,
  Building2,
  FileText,
} from "lucide-react-native";

import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Divider } from "@/components/ui/Divider";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToastStore } from "@/components/ui/Toast";
import { useTheme } from "@/hooks/useTheme";
import { formatDate, formatCurrency } from "@/utils/format";
import { useContractStore } from "@/stores/useContractStore";
import { useBookings } from "@/hooks/useBookings";
import { CONTRACT_CLAUSES } from "@/data/contracts";
import type { Booking } from "@/types/booking";

// ── Booking Picker Card ─────────────────────────────────────────────────────

interface BookingPickerCardProps {
  booking: Booking;
  index: number;
  selected: boolean;
  onPress: () => void;
}

function BookingPickerCard({
  booking,
  index,
  selected,
  onPress,
}: BookingPickerCardProps) {
  const theme = useTheme();

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60)
        .duration(400)
        .springify()}
    >
      <Pressable
        onPress={handlePress}
        className="rounded-xl p-3 mb-2 flex-row items-center"
        style={{
          backgroundColor: selected ? theme.accentSoft : theme.surfaceTertiary,
          borderWidth: selected ? 1.5 : 1,
          borderColor: selected ? theme.accent : theme.border,
        }}
      >
        <View
          className="rounded-lg items-center justify-center mr-3"
          style={{
            width: 40,
            height: 40,
            backgroundColor: selected ? theme.accent : theme.surface,
          }}
        >
          <Car size={18} color={selected ? "#0A0A0F" : theme.textTertiary} />
        </View>

        <View className="flex-1">
          <Text variant="titleSmall" numberOfLines={1}>
            {booking.vehicleName}
          </Text>
          <Text
            variant="bodySmall"
            color={theme.textSecondary}
            numberOfLines={1}
          >
            {booking.clientName}
          </Text>
          <Text
            variant="bodySmall"
            color={theme.textTertiary}
            className="mt-0.5"
          >
            {formatDate(booking.startDate, "short")} {"\u2192"}{" "}
            {formatDate(booking.endDate, "short")}
          </Text>
        </View>

        {selected && (
          <View
            className="rounded-full items-center justify-center"
            style={{
              width: 24,
              height: 24,
              backgroundColor: theme.accent,
            }}
          >
            <Check size={14} color="#0A0A0F" strokeWidth={3} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ── Section Header ──────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  index: number;
}

function SectionHeader({ title, index }: SectionHeaderProps) {
  const theme = useTheme();
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80)
        .duration(400)
        .springify()}
      className="mt-6 mb-3"
    >
      <Text variant="titleMedium" color={theme.textSecondary}>
        {title}
      </Text>
    </Animated.View>
  );
}

// ── Signature Placeholder ───────────────────────────────────────────────────

interface SignaturePlaceholderProps {
  label: string;
}

function SignaturePlaceholder({ label }: SignaturePlaceholderProps) {
  const theme = useTheme();
  return (
    <Pressable
      className="rounded-xl items-center justify-center"
      style={{
        backgroundColor: theme.surfaceTertiary,
        height: 128,
      }}
    >
      <PenLine size={28} color={theme.textTertiary} strokeWidth={1.5} />
      <Text variant="bodySmall" color={theme.textTertiary} className="mt-2">
        {label}
      </Text>
      <Text variant="labelSmall" color={theme.textTertiary} className="mt-1">
        Tap to sign
      </Text>
    </Pressable>
  );
}

// ── Info Row ────────────────────────────────────────────────────────────────

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  const theme = useTheme();
  return (
    <View className="flex-row justify-between py-1.5">
      <Text variant="bodySmall" color={theme.textSecondary}>
        {label}
      </Text>
      <Text variant="bodySmall">{value}</Text>
    </View>
  );
}

// ── Main Screen ─────────────────────────────────────────────────────────────

export default function NewContractScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const showToast = useToastStore((s) => s.show);

  const { data: bookings = [] } = useBookings();
  const createContractFromBooking = useContractStore(
    (s) => s.createContractFromBooking,
  );

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Bookings eligible for contract creation (confirmed/pending without existing contracts)
  const contracts = useContractStore((s) => s.contracts);
  const bookingIdsWithContracts = useMemo(
    () => new Set(contracts.map((c) => c.bookingId).filter(Boolean)),
    [contracts],
  );

  const eligibleBookings = useMemo(
    () =>
      bookings.filter(
        (b) =>
          (b.status === "confirmed" || b.status === "pending") &&
          !bookingIdsWithContracts.has(b.id),
      ),
    [bookings, bookingIdsWithContracts],
  );

  const selectedBooking = useMemo(
    () => eligibleBookings.find((b) => b.id === selectedBookingId) ?? null,
    [eligibleBookings, selectedBookingId],
  );

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleSelectBooking = useCallback((bookingId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBookingId((prev) => (prev === bookingId ? null : bookingId));
    setTermsAccepted(false);
  }, []);

  const handleToggleTerms = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTermsAccepted((prev) => !prev);
  }, []);

  const handleSendForSignature = useCallback(() => {
    if (!selectedBookingId) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const result = createContractFromBooking(selectedBookingId);
    if (result) {
      showToast({
        variant: "success",
        title: "Email envoyé",
        message: "Le contrat a été envoyé pour signature.",
      });
      router.back();
    }
  }, [selectedBookingId, createContractFromBooking, showToast, router]);

  const handleSaveAsDraft = useCallback(() => {
    if (!selectedBookingId) return;
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const result = createContractFromBooking(selectedBookingId);
    setSaving(false);
    if (result) {
      showToast({
        variant: "success",
        title: "Brouillon enregistré",
        message: `Contrat ${result.reference} créé avec succès.`,
      });
      router.back();
    }
  }, [selectedBookingId, createContractFromBooking, showToast, router]);

  // ── Contract date ─────────────────────────────────────────────────────

  const todayStr = new Date().toISOString().slice(0, 10);
  const nextRef = `MF-2026-${String(contracts.length + 1).padStart(4, "0")}`;

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <ScreenWrapper scroll>
      {/* Header */}
      <View className="flex-row items-center pt-6 pb-4">
        <Pressable onPress={() => router.back()} className="mr-3">
          <ChevronLeft size={24} color={theme.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text variant="headlineLarge" className="flex-1">
          {t("contracts.new", { defaultValue: "Nouveau contrat" })}
        </Text>
      </View>

      {/* ── Section: Select Booking ──────────────────────────────────── */}
      <SectionHeader title="Sélectionner une réservation" index={0} />

      {eligibleBookings.length === 0 ? (
        <Animated.View
          entering={FadeInDown.delay(80).duration(400).springify()}
        >
          <EmptyState
            icon={CalendarDays}
            title="Aucune réservation disponible"
            subtitle="Toutes les réservations confirmées ont déjà un contrat associé."
            className="py-8"
          />
        </Animated.View>
      ) : (
        eligibleBookings.map((booking, idx) => (
          <BookingPickerCard
            key={booking.id}
            booking={booking}
            index={idx}
            selected={selectedBookingId === booking.id}
            onPress={() => handleSelectBooking(booking.id)}
          />
        ))
      )}

      {/* ── Section: Contract Preview ────────────────────────────────── */}
      {selectedBooking != null && (
        <>
          <SectionHeader title="Aperçu du contrat" index={1} />

          {/* Contract Header */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400).springify()}
          >
            <Card className="mb-3">
              <View className="items-center py-3">
                <Text variant="headlineMedium" align="center">
                  MY FLEET SAS
                </Text>
                <Text
                  variant="titleSmall"
                  color={theme.textSecondary}
                  align="center"
                  className="mt-1"
                >
                  CONTRAT DE LOCATION
                </Text>
                <Divider className="my-3" />
                <View className="flex-row items-center justify-between w-full">
                  <Text variant="bodySmall" color={theme.textTertiary}>
                    Réf: {nextRef}
                  </Text>
                  <Text variant="bodySmall" color={theme.textTertiary}>
                    {formatDate(todayStr, "long")}
                  </Text>
                </View>
              </View>
            </Card>
          </Animated.View>

          {/* Parties */}
          <Animated.View
            entering={FadeInDown.delay(160).duration(400).springify()}
          >
            <Card className="mb-3">
              {/* Lessor */}
              <View className="flex-row items-center mb-2">
                <Building2
                  size={16}
                  color={theme.accent}
                  style={{ marginRight: 8 }}
                />
                <Text variant="titleSmall">Le Loueur</Text>
              </View>
              <View className="ml-6 mb-3">
                <Text variant="bodySmall">My Fleet SAS</Text>
                <Text variant="bodySmall" color={theme.textSecondary}>
                  45 Avenue des Champs-Élysées, 75008 Paris
                </Text>
                <Text variant="bodySmall" color={theme.textSecondary}>
                  +33 1 42 56 78 90 - contact@myfleet.fr
                </Text>
              </View>

              <Divider className="mb-3" />

              {/* Lessee */}
              <View className="flex-row items-center mb-2">
                <User
                  size={16}
                  color={theme.accent}
                  style={{ marginRight: 8 }}
                />
                <Text variant="titleSmall">Le Locataire</Text>
              </View>
              <View className="ml-6">
                <Text variant="bodySmall">{selectedBooking.clientName}</Text>
                <Text variant="bodySmall" color={theme.textSecondary}>
                  {selectedBooking.pickupLocation}
                </Text>
              </View>
            </Card>
          </Animated.View>

          {/* Vehicle */}
          <Animated.View
            entering={FadeInDown.delay(220).duration(400).springify()}
          >
            <Card className="mb-3">
              <View className="flex-row items-center mb-2">
                <Car
                  size={16}
                  color={theme.accent}
                  style={{ marginRight: 8 }}
                />
                <Text variant="titleSmall">Véhicule</Text>
              </View>
              <View className="ml-6">
                <InfoRow label="Modèle" value={selectedBooking.vehicleName} />
                <InfoRow label="Année" value="2024" />
              </View>
            </Card>
          </Animated.View>

          {/* Terms */}
          <Animated.View
            entering={FadeInDown.delay(280).duration(400).springify()}
          >
            <Card className="mb-3">
              <View className="flex-row items-center mb-2">
                <CalendarDays
                  size={16}
                  color={theme.accent}
                  style={{ marginRight: 8 }}
                />
                <Text variant="titleSmall">Conditions</Text>
              </View>
              <View className="ml-6">
                <InfoRow
                  label="Période"
                  value={`${formatDate(selectedBooking.startDate, "short")} \u2192 ${formatDate(selectedBooking.endDate, "short")}`}
                />
                <InfoRow
                  label="Tarif journalier"
                  value={formatCurrency(selectedBooking.dailyRate)}
                />
                <InfoRow
                  label="Montant total"
                  value={formatCurrency(selectedBooking.totalAmount)}
                />
                <InfoRow
                  label="Caution"
                  value={formatCurrency(selectedBooking.deposit)}
                />
                <InfoRow
                  label="Lieu de prise en charge"
                  value={selectedBooking.pickupLocation}
                />
                <InfoRow
                  label="Lieu de restitution"
                  value={selectedBooking.returnLocation}
                />
              </View>
            </Card>
          </Animated.View>

          {/* Clauses */}
          <Animated.View
            entering={FadeInDown.delay(340).duration(400).springify()}
          >
            <Card className="mb-3">
              <View className="flex-row items-center mb-3">
                <FileText
                  size={16}
                  color={theme.accent}
                  style={{ marginRight: 8 }}
                />
                <Text variant="titleSmall">Clauses contractuelles</Text>
              </View>
              {CONTRACT_CLAUSES.map((clause, idx) => (
                <View key={clause.id} className={idx > 0 ? "mt-3" : ""}>
                  <Text variant="titleSmall">
                    {idx + 1}. {clause.title}
                  </Text>
                  <Text
                    variant="bodySmall"
                    color={theme.textSecondary}
                    className="mt-1"
                  >
                    {clause.content}
                  </Text>
                </View>
              ))}
            </Card>
          </Animated.View>

          {/* Signature Area */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(400).springify()}
          >
            <Card className="mb-3">
              <Text variant="titleSmall" className="mb-3">
                Signatures
              </Text>

              {/* Terms checkbox */}
              <Pressable
                onPress={handleToggleTerms}
                className="flex-row items-center mb-4"
              >
                <View
                  className="rounded-md items-center justify-center mr-3"
                  style={{
                    width: 22,
                    height: 22,
                    borderWidth: 1.5,
                    borderColor: termsAccepted ? theme.accent : theme.border,
                    backgroundColor: termsAccepted
                      ? theme.accent
                      : "transparent",
                  }}
                >
                  {termsAccepted && (
                    <Check size={14} color="#0A0A0F" strokeWidth={3} />
                  )}
                </View>
                <Text variant="bodySmall" className="flex-1">
                  J&apos;accepte les conditions générales
                </Text>
              </Pressable>

              {/* Signature placeholders */}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text
                    variant="labelSmall"
                    color={theme.textSecondary}
                    className="mb-2"
                  >
                    Signature Client
                  </Text>
                  <SignaturePlaceholder label="Client" />
                </View>
                <View className="flex-1">
                  <Text
                    variant="labelSmall"
                    color={theme.textSecondary}
                    className="mb-2"
                  >
                    Signature Agent
                  </Text>
                  <SignaturePlaceholder label="Agent" />
                </View>
              </View>
            </Card>
          </Animated.View>

          {/* Actions */}
          <Animated.View
            entering={FadeInDown.delay(460).duration(400).springify()}
            className="mb-8"
          >
            <Button
              variant="primary"
              fullWidth
              leftIcon={Send}
              disabled={!termsAccepted}
              onPress={handleSendForSignature}
              className="mb-3"
            >
              Envoyer pour signature
            </Button>
            <Button
              variant="secondary"
              fullWidth
              leftIcon={Save}
              loading={saving}
              onPress={handleSaveAsDraft}
            >
              Enregistrer comme brouillon
            </Button>
          </Animated.View>
        </>
      )}
    </ScreenWrapper>
  );
}
