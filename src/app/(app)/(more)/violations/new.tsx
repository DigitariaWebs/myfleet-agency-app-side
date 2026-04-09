import React, { useState, useCallback, useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  ChevronLeft,
  CheckCircle,
  AlertTriangle,
  Car,
  Save,
  ChevronRight,
} from 'lucide-react-native';

import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Chip, ChipGroup } from '@/components/ui/Chip';
import { Divider } from '@/components/ui/Divider';
import { useToastStore } from '@/components/ui/Toast';
import { useTheme } from '@/hooks/useTheme';
import { useViolationStore } from '@/stores/useViolationStore';
import { identifyClient } from '@/utils/violationLookup';
import type { ViolationType } from '@/types/violation';

// ── Type chips config ──────────────────────────────────────────────────────

interface TypeOption {
  key: ViolationType;
  label: string;
}

const TYPE_OPTIONS: TypeOption[] = [
  { key: 'speeding', label: 'Excès de vitesse' },
  { key: 'parking', label: 'Stationnement' },
  { key: 'redlight', label: 'Feu rouge' },
  { key: 'other', label: 'Autre' },
];

// ── Main Screen ────────────────────────────────────────────────────────────

export default function NewViolationScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const showToast = useToastStore((s) => s.show);
  const addViolation = useViolationStore((s) => s.addViolation);
  const violations = useViolationStore((s) => s.violations);

  // Step management
  const [step, setStep] = useState<1 | 2>(1);

  // Form state
  const [date, setDate] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [violationType, setViolationType] = useState<ViolationType>('speeding');
  const [fineAmount, setFineAmount] = useState('');
  const [adminFee, setAdminFee] = useState('40');
  const [reference, setReference] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Lookup result
  const lookupResult = useMemo(() => {
    if (licensePlate.trim().length < 3 || date.trim().length < 8) {
      return null;
    }
    return identifyClient(licensePlate.trim().toUpperCase(), date.trim());
  }, [licensePlate, date]);

  // Computed
  const fineNum = parseFloat(fineAmount) || 0;
  const adminNum = parseFloat(adminFee) || 0;
  const totalCharge = fineNum + adminNum;

  const canProceed = useMemo(
    () =>
      date.trim().length >= 8 &&
      licensePlate.trim().length >= 3 &&
      fineAmount.trim().length > 0 &&
      reference.trim().length > 0,
    [date, licensePlate, fineAmount, reference],
  );

  const getTypeLabel = useCallback((type: ViolationType): string => {
    switch (type) {
      case 'speeding':
        return 'Excès de vitesse';
      case 'parking':
        return 'Stationnement';
      case 'redlight':
        return 'Feu rouge';
      case 'other':
        return 'Autre';
    }
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep(2);
  }, []);

  const handleBack = useCallback(() => {
    if (step === 2) {
      setStep(1);
    } else {
      router.back();
    }
  }, [step, router]);

  const handleSubmit = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newId = `vio-${Date.now()}`;
    const nextRef = reference.trim();

    addViolation({
      id: newId,
      reference: nextRef,
      vehicleId: lookupResult?.vehicle?.id ?? '',
      vehicleName: lookupResult?.vehicle?.name
        ? `${lookupResult.vehicle.brand} ${lookupResult.vehicle.name}`
        : 'Véhicule inconnu',
      licensePlate: licensePlate.trim().toUpperCase(),
      bookingId: lookupResult?.booking?.id ?? null,
      clientId: lookupResult?.clientId ?? null,
      clientName: lookupResult?.clientName ?? null,
      type: violationType,
      date: date.trim(),
      receivedDate: new Date().toISOString().slice(0, 10),
      fineAmount: fineNum,
      adminFee: adminNum,
      totalCharge,
      location: location.trim(),
      status: lookupResult?.clientId ? 'client-identified' : 'received',
      description: getTypeLabel(violationType),
      notes: notes.trim(),
    });

    showToast({
      variant: 'success',
      title: 'Infraction enregistrée',
      message: `Référence ${nextRef} ajoutée avec succès.`,
    });

    router.back();
  }, [
    addViolation,
    lookupResult,
    licensePlate,
    violationType,
    date,
    fineNum,
    adminNum,
    totalCharge,
    location,
    notes,
    reference,
    getTypeLabel,
    showToast,
    router,
  ]);

  // ── Step 1: Details ──────────────────────────────────────────────────────

  if (step === 1) {
    return (
      <ScreenWrapper scroll>
        {/* Header */}
        <View className="flex-row items-center pt-6 pb-4">
          <Pressable onPress={handleBack} className="mr-3">
            <ChevronLeft size={24} color={theme.textPrimary} strokeWidth={2} />
          </Pressable>
          <Text variant="headlineLarge" className="flex-1">
            {t('violations.new', { defaultValue: 'Nouvelle infraction' })}
          </Text>
        </View>

        {/* Date */}
        <Animated.View entering={FadeInDown.delay(0).duration(400).springify()}>
          <Input
            label="Date de l'infraction"
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
            className="mb-4"
          />
        </Animated.View>

        {/* License Plate */}
        <Animated.View entering={FadeInDown.delay(60).duration(400).springify()}>
          <Input
            label="Plaque d'immatriculation"
            placeholder="AA-123-BB"
            value={licensePlate}
            onChangeText={setLicensePlate}
            className="mb-2"
          />
        </Animated.View>

        {/* Lookup result */}
        {lookupResult != null && (
          <Animated.View
            entering={FadeInDown.delay(80).duration(400).springify()}
            className="mb-4"
          >
            {lookupResult.vehicle != null ? (
              <Card className="mb-2">
                <View className="flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                    style={{ backgroundColor: theme.surfaceTertiary }}
                  >
                    <Car size={20} color={theme.accent} />
                  </View>
                  <View className="flex-1">
                    <Text variant="titleSmall">
                      {lookupResult.vehicle.brand} {lookupResult.vehicle.name}
                    </Text>
                    <Text variant="bodySmall" color={theme.textSecondary}>
                      {lookupResult.vehicle.licensePlate}
                    </Text>
                  </View>
                </View>
              </Card>
            ) : null}

            {lookupResult.clientName != null ? (
              <View className="flex-row items-center p-3 rounded-xl" style={{ backgroundColor: theme.successSoft }}>
                <CheckCircle size={18} color={theme.success} />
                <Text variant="bodySmall" color={theme.success} className="ml-2">
                  Client identifié : {lookupResult.clientName}
                </Text>
              </View>
            ) : lookupResult.vehicle != null ? (
              <View className="flex-row items-center p-3 rounded-xl" style={{ backgroundColor: theme.warningSoft }}>
                <AlertTriangle size={18} color={theme.warning} />
                <Text variant="bodySmall" color={theme.warning} className="ml-2">
                  Aucune réservation trouvée
                </Text>
              </View>
            ) : null}
          </Animated.View>
        )}

        {/* Violation Type */}
        <Animated.View entering={FadeInDown.delay(120).duration(400).springify()} className="mb-4">
          <Text
            variant="bodySmall"
            color={theme.textSecondary}
            className="mb-2"
          >
            Type d'infraction
          </Text>
          <ChipGroup>
            {TYPE_OPTIONS.map((opt) => (
              <Chip
                key={opt.key}
                label={opt.label}
                selected={violationType === opt.key}
                onPress={() => setViolationType(opt.key)}
              />
            ))}
          </ChipGroup>
        </Animated.View>

        {/* Fine Amount */}
        <Animated.View entering={FadeInDown.delay(180).duration(400).springify()}>
          <Input
            label="Montant de l'amende"
            placeholder="0.00"
            value={fineAmount}
            onChangeText={setFineAmount}
            keyboardType="numeric"
            className="mb-4"
          />
        </Animated.View>

        {/* Admin Fee */}
        <Animated.View entering={FadeInDown.delay(240).duration(400).springify()}>
          <Input
            label="Frais administratifs"
            placeholder="40"
            value={adminFee}
            onChangeText={setAdminFee}
            keyboardType="numeric"
            className="mb-4"
          />
        </Animated.View>

        {/* Reference */}
        <Animated.View entering={FadeInDown.delay(300).duration(400).springify()}>
          <Input
            label="Référence (autorités)"
            placeholder="REF-2026-XXXX"
            value={reference}
            onChangeText={setReference}
            className="mb-4"
          />
        </Animated.View>

        {/* Location */}
        <Animated.View entering={FadeInDown.delay(360).duration(400).springify()}>
          <Input
            label="Lieu"
            placeholder="Adresse ou description"
            value={location}
            onChangeText={setLocation}
            className="mb-4"
          />
        </Animated.View>

        {/* Notes */}
        <Animated.View entering={FadeInDown.delay(420).duration(400).springify()}>
          <Input
            label="Notes"
            placeholder="Notes supplémentaires..."
            value={notes}
            onChangeText={setNotes}
            multiline
            className="mb-6"
          />
        </Animated.View>

        {/* Next Button */}
        <Animated.View
          entering={FadeInDown.delay(480).duration(400).springify()}
          className="mb-8"
        >
          <Button
            variant="primary"
            fullWidth
            rightIcon={ChevronRight}
            disabled={!canProceed}
            onPress={handleNext}
          >
            Suivant
          </Button>
        </Animated.View>
      </ScreenWrapper>
    );
  }

  // ── Step 2: Review ───────────────────────────────────────────────────────

  return (
    <ScreenWrapper scroll>
      {/* Header */}
      <View className="flex-row items-center pt-6 pb-4">
        <Pressable onPress={handleBack} className="mr-3">
          <ChevronLeft size={24} color={theme.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text variant="headlineLarge" className="flex-1">
          {t('violations.review', { defaultValue: 'Récapitulatif' })}
        </Text>
      </View>

      {/* Summary Card */}
      <Animated.View entering={FadeInDown.delay(0).duration(400).springify()}>
        <Card className="mb-4">
          <Text variant="titleMedium" className="mb-3">
            Détails de l'infraction
          </Text>

          <InfoRow label="Référence" value={reference} theme={theme} />
          <InfoRow label="Date" value={date} theme={theme} />
          <InfoRow label="Plaque" value={licensePlate.toUpperCase()} theme={theme} />
          <InfoRow label="Type" value={getTypeLabel(violationType)} theme={theme} />
          <InfoRow label="Lieu" value={location || '-'} theme={theme} />

          {lookupResult?.vehicle != null && (
            <InfoRow
              label="Véhicule"
              value={`${lookupResult.vehicle.brand} ${lookupResult.vehicle.name}`}
              theme={theme}
            />
          )}

          {lookupResult?.clientName != null && (
            <InfoRow label="Client" value={lookupResult.clientName} theme={theme} />
          )}

          <Divider className="my-3" />

          <InfoRow label="Amende" value={`\u20AC${fineNum.toFixed(2)}`} theme={theme} />
          <InfoRow label="Frais admin." value={`\u20AC${adminNum.toFixed(2)}`} theme={theme} />

          <Divider className="my-3" />

          <View className="flex-row justify-between py-1.5">
            <Text variant="titleSmall">Total</Text>
            <Text variant="titleMedium" color={theme.accent}>
              {'\u20AC'}{totalCharge.toFixed(2)}
            </Text>
          </View>

          {notes.trim().length > 0 && (
            <>
              <Divider className="my-3" />
              <Text variant="bodySmall" color={theme.textSecondary}>
                Notes : {notes}
              </Text>
            </>
          )}
        </Card>
      </Animated.View>

      {/* Submit */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(400).springify()}
        className="mb-8"
      >
        <Button
          variant="primary"
          fullWidth
          leftIcon={Save}
          onPress={handleSubmit}
        >
          Enregistrer l'infraction
        </Button>
      </Animated.View>
    </ScreenWrapper>
  );
}

// ── Info Row ──────────────────────────────────────────────────────────────

interface InfoRowProps {
  label: string;
  value: string;
  theme: ReturnType<typeof useTheme>;
}

function InfoRow({ label, value, theme }: InfoRowProps) {
  return (
    <View className="flex-row justify-between py-1.5">
      <Text variant="bodySmall" color={theme.textSecondary}>
        {label}
      </Text>
      <Text variant="bodySmall">{value}</Text>
    </View>
  );
}
