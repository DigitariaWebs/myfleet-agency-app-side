import React, { useState, useMemo, useCallback } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInLeft,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  ChevronLeft,
  Camera,
  ScanLine,
  ClipboardCheck,
  Wrench,
  Gauge,
  Fuel,
  Check,
  type LucideIcon,
} from 'lucide-react-native';
import { Image } from 'expo-image';

// ScreenWrapper replaced with direct SafeAreaView for sticky button support
import { Text } from '@/components/ui/Text';
import { SearchBar } from '@/components/ui/SearchBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StickyButton } from '@/components/ui/StickyButton';
import { useTheme } from '@/hooks/useTheme';
import { shadows } from '@/theme/shadows';
import { mockVehicles } from '@/data/vehicles';
import { getVehicleImage } from '@/data/vehicleImages';
import type { Vehicle } from '@/types/vehicle';
import type { InspectionType } from '@/types/inspection';
import { useInspectionStore } from '@/stores/useInspectionStore';
import { useAuthStore } from '@/stores/useAuthStore';

// ── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Vehicle', 'Type', 'Details'] as const;
const FUEL_LEVELS = [0, 25, 50, 75, 100] as const;

interface InspectionTypeOption {
  type: InspectionType;
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

const INSPECTION_TYPES: InspectionTypeOption[] = [
  {
    type: 'pre-rental',
    icon: ScanLine,
    title: 'Pre-rental',
    subtitle: 'Before handing to client',
  },
  {
    type: 'post-rental',
    icon: ClipboardCheck,
    title: 'Post-rental',
    subtitle: 'When client returns vehicle',
  },
  {
    type: 'routine',
    icon: Wrench,
    title: 'Routine',
    subtitle: 'Periodic maintenance check',
  },
];

// ── Step Progress Bar ────────────────────────────────────────────────────────

interface StepProgressProps {
  currentStep: number;
  steps: readonly string[];
}

function StepProgress({ currentStep, steps }: StepProgressProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 24,
      }}
    >
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        const circleSize = 32;
        const circleColor = isCompleted || isActive
          ? theme.accent
          : theme.surfaceTertiary;
        const textColor = isCompleted || isActive ? '#FFFFFF' : theme.textTertiary;

        return (
          <React.Fragment key={label}>
            {/* Connecting line before (skip first) */}
            {index > 0 && (
              <View
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: index <= currentStep ? theme.accent : theme.surfaceTertiary,
                  marginHorizontal: 4,
                }}
              />
            )}

            {/* Step circle + label */}
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: circleSize,
                  height: circleSize,
                  borderRadius: circleSize / 2,
                  backgroundColor: circleColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isCompleted ? (
                  <Check size={16} color="#FFFFFF" strokeWidth={3} />
                ) : (
                  <Text
                    variant="bodySmall"
                    color={textColor}
                    style={{ fontWeight: '700', fontSize: 13 }}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                variant="bodySmall"
                color={isActive ? theme.accent : theme.textTertiary}
                style={{ marginTop: 4, fontWeight: isActive ? '600' : '400', fontSize: 11 }}
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

// ── Screen ───────────────────────────────────────────────────────────────────

export default function NewInspectionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);

  // Step state
  const [currentStep, setCurrentStep] = useState(0);

  // Step 1 - Vehicle selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Step 2 - Inspection type
  const [selectedType, setSelectedType] = useState<InspectionType | null>(null);

  // Step 3 - Vehicle info
  const [mileage, setMileage] = useState('');
  const [fuelLevel, setFuelLevel] = useState<number>(100);
  const [notes, setNotes] = useState('');

  // Track animation direction
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // ── Derived ────────────────────────────────────────────────────────────

  const filteredVehicles = useMemo(() => {
    if (!searchQuery.trim()) return mockVehicles;
    const q = searchQuery.toLowerCase();
    return mockVehicles.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.licensePlate.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  // ── Handlers ───────────────────────────────────────────────────────────

  const goNext = useCallback(() => {
    setDirection('forward');
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  }, []);

  const goBack = useCallback(() => {
    if (currentStep === 0) {
      router.back();
      return;
    }
    setDirection('backward');
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, [currentStep, router]);

  const handleSelectVehicle = useCallback((vehicle: Vehicle) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedVehicle((prev) => (prev?.id === vehicle.id ? null : vehicle));
    setMileage(String(vehicle.mileage));
  }, []);

  const handleSelectType = useCallback((type: InspectionType) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedType((prev) => (prev === type ? null : type));
  }, []);

  const handleFuelLevel = useCallback((level: number) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFuelLevel(level);
  }, []);

  const handleStart = useCallback(() => {
    if (!selectedVehicle || !selectedType) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    useInspectionStore.getState().startInspection(
      selectedVehicle.id,
      selectedVehicle.name,
      selectedType,
    );

    const parsedMileage = parseInt(mileage, 10);
    if (!isNaN(parsedMileage)) {
      useInspectionStore.getState().updateDraftMileage(parsedMileage);
    }
    useInspectionStore.getState().updateDraftFuelLevel(fuelLevel);

    if (notes.trim()) {
      useInspectionStore.getState().updateDraftNotes(notes.trim());
    }

    router.push('/(app)/(inspections)/camera');
  }, [selectedVehicle, selectedType, mileage, fuelLevel, notes, router]);

  // ── Step validity ─────────────────────────────────────────────────────

  const canGoNext = useMemo(() => {
    if (currentStep === 0) return selectedVehicle !== null;
    if (currentStep === 1) return selectedType !== null;
    return true;
  }, [currentStep, selectedVehicle, selectedType]);

  // ── Animation entering ─────────────────────────────────────────────

  const enteringAnim = direction === 'forward'
    ? FadeInRight.duration(350).springify()
    : FadeInLeft.duration(350).springify();

  // ── Render Vehicle Card ────────────────────────────────────────────────

  const renderVehicleCard = useCallback(
    (vehicle: Vehicle, index: number) => {
      const isSelected = selectedVehicle?.id === vehicle.id;
      const imageUri = getVehicleImage(vehicle.id);

      return (
        <Animated.View
          key={vehicle.id}
          entering={FadeInDown.delay(index * 40).duration(350).springify()}
        >
          <Pressable
            onPress={() => handleSelectVehicle(vehicle)}
            style={[
              {
                backgroundColor: isSelected ? theme.accentSoft : theme.surface,
                borderRadius: 20,
                borderWidth: isSelected ? 2 : 0,
                borderColor: isSelected ? theme.accent : 'transparent',
                padding: 14,
                marginBottom: 10,
                flexDirection: 'row',
                alignItems: 'center',
              },
              shadows.sm,
            ]}
          >
            {/* Vehicle image */}
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                overflow: 'hidden',
                backgroundColor: theme.surfaceTertiary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              {imageUri ? (
                <Image
                  source={imageUri}
                  style={{ width: 56, height: 56 }}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <Camera size={22} color={theme.textTertiary} />
              )}
            </View>

            {/* Info */}
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                {vehicle.name}
              </Text>
              <Text variant="bodySmall" color={theme.textSecondary}>
                {vehicle.brand} · {vehicle.licensePlate}
              </Text>
              <View style={{ marginTop: 4 }}>
                <StatusBadge status={vehicle.status} size="sm" />
              </View>
            </View>

            {/* Radio indicator */}
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: isSelected ? theme.accent : theme.surfaceTertiary,
                backgroundColor: isSelected ? theme.accent : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isSelected && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#FFFFFF',
                  }}
                />
              )}
            </View>
          </Pressable>
        </Animated.View>
      );
    },
    [selectedVehicle, theme, handleSelectVehicle],
  );

  // ── Render Type Card ───────────────────────────────────────────────────

  const renderTypeCard = useCallback(
    (option: InspectionTypeOption, index: number) => {
      const isSelected = selectedType === option.type;
      const Icon = option.icon;

      return (
        <Animated.View
          key={option.type}
          entering={FadeInDown.delay(index * 80).duration(400).springify()}
        >
          <Pressable
            onPress={() => handleSelectType(option.type)}
            style={[
              {
                backgroundColor: isSelected ? theme.accentSoft : theme.surface,
                borderRadius: 20,
                borderWidth: isSelected ? 2 : 0,
                borderColor: isSelected ? theme.accent : 'transparent',
                padding: 20,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
              },
              shadows.sm,
            ]}
          >
            {/* Icon circle */}
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: isSelected ? theme.accent : theme.accentSoft,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}
            >
              <Icon
                size={28}
                color={isSelected ? '#FFFFFF' : theme.accent}
              />
            </View>

            {/* Text */}
            <View style={{ flex: 1 }}>
              <Text variant="titleLarge" style={{ fontWeight: '600' }}>
                {option.title}
              </Text>
              <Text variant="bodySmall" color={theme.textSecondary} style={{ marginTop: 2 }}>
                {option.subtitle}
              </Text>
            </View>

            {/* Checkmark when selected */}
            {isSelected && (
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: theme.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Check size={16} color="#FFFFFF" strokeWidth={3} />
              </View>
            )}
          </Pressable>
        </Animated.View>
      );
    },
    [selectedType, theme, handleSelectType],
  );

  // ── Step Content ───────────────────────────────────────────────────────

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Animated.View
            key="step-0"
            entering={enteringAnim}
            style={{ flex: 1 }}
          >
            {/* Title */}
            <Text variant="headlineMedium" style={{ marginBottom: 4, fontWeight: '700' }}>
              {t('inspections.new.selectVehicle', 'Select Vehicle')}
            </Text>
            <Text variant="bodyMedium" color={theme.textSecondary} style={{ marginBottom: 16 }}>
              {t('inspections.new.selectVehicleHint', 'Choose the vehicle to inspect')}
            </Text>

            {/* Search */}
            <SearchBar
              placeholder={t(
                'inspections.new.searchPlaceholder',
                'Search by name, brand, or plate...',
              )}
              onChangeText={setSearchQuery}
              className="mb-3"
            />

            {/* Vehicle list */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              style={{ maxHeight: 5 * 90, marginTop: 4 }}
            >
              {filteredVehicles.map((vehicle, index) =>
                renderVehicleCard(vehicle, index),
              )}

              {filteredVehicles.length === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                  <Text variant="bodyMedium" color={theme.textTertiary}>
                    {t('inspections.new.noVehicles', 'No vehicle found')}
                  </Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        );

      case 1:
        return (
          <Animated.View
            key="step-1"
            entering={enteringAnim}
            style={{ flex: 1 }}
          >
            {/* Title */}
            <Text variant="headlineMedium" style={{ marginBottom: 4, fontWeight: '700' }}>
              {t('inspections.new.inspectionType', 'Inspection Type')}
            </Text>
            <Text variant="bodyMedium" color={theme.textSecondary} style={{ marginBottom: 20 }}>
              {t('inspections.new.typeHint', 'Select the type of inspection to perform')}
            </Text>

            {/* Type cards */}
            {INSPECTION_TYPES.map((option, index) =>
              renderTypeCard(option, index),
            )}
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View
            key="step-2"
            entering={enteringAnim}
            style={{ flex: 1 }}
          >
            {/* Title */}
            <Text variant="headlineMedium" style={{ marginBottom: 4, fontWeight: '700' }}>
              {t('inspections.new.vehicleDetails', 'Vehicle Details')}
            </Text>
            <Text variant="bodyMedium" color={theme.textSecondary} style={{ marginBottom: 20 }}>
              {t('inspections.new.detailsHint', 'Enter current vehicle information')}
            </Text>

            {/* Mileage input */}
            <Input
              label={t('inspections.new.mileage', 'Current Mileage')}
              placeholder="0"
              value={mileage}
              onChangeText={setMileage}
              keyboardType="number-pad"
              leftIcon={Gauge}
              className="mb-5"
            />

            {/* Fuel level */}
            <View style={{ marginBottom: 20 }}>
              <Text
                variant="bodySmall"
                color={theme.textSecondary}
                style={{ marginBottom: 8, fontWeight: '500' }}
              >
                {t('inspections.new.fuelLevel', 'Fuel Level')}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Fuel size={18} color={theme.textTertiary} />
                {FUEL_LEVELS.map((level) => {
                  const isActive = fuelLevel === level;
                  return (
                    <Pressable
                      key={level}
                      onPress={() => handleFuelLevel(level)}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 10,
                        borderRadius: 9999,
                        backgroundColor: isActive ? theme.accent : theme.surfaceTertiary,
                      }}
                    >
                      <Text
                        variant="bodySmall"
                        color={isActive ? '#FFFFFF' : theme.textSecondary}
                        style={{ fontWeight: isActive ? '700' : '500' }}
                      >
                        {level}%
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Notes input */}
            <Input
              label={t('inspections.new.notes', 'Notes (optional)')}
              placeholder={t('inspections.new.notesPlaceholder', 'Additional observations...')}
              value={notes}
              onChangeText={setNotes}
              multiline
              className="mb-4"
            />
          </Animated.View>
        );

      default:
        return null;
    }
  };

  // ── JSX ────────────────────────────────────────────────────────────────

  const showButton =
    (canGoNext && currentStep < 2) ||
    (currentStep === 2 && selectedVehicle !== null && selectedType !== null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingBottom: showButton ? 90 : 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(400).springify()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingTop: 16,
              paddingBottom: 4,
            }}
          >
            <Pressable
              onPress={goBack}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme.surfaceSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <ChevronLeft size={22} color={theme.textPrimary} />
            </Pressable>
            <Text variant="headlineLarge" style={{ fontWeight: '700' }}>
              {t('inspections.new.title', 'New Inspection')}
            </Text>
          </Animated.View>

          {/* Step progress bar */}
          <StepProgress currentStep={currentStep} steps={STEPS} />

          {/* Step content */}
          <View style={{ flex: 1, minHeight: 400 }}>
            {renderStepContent()}
          </View>
        </ScrollView>

        {/* Sticky bottom button — OUTSIDE ScrollView so it stays fixed */}
        {canGoNext && currentStep < 2 && (
          <StickyButton variant="primary" onPress={goNext}>
            {t('inspections.new.next', 'Next')}
          </StickyButton>
        )}
        {currentStep === 2 && selectedVehicle && selectedType && (
          <StickyButton variant="primary" onPress={handleStart} leftIcon={ScanLine}>
            {t('inspections.new.start', 'Start Inspection')}
          </StickyButton>
        )}
      </View>
    </SafeAreaView>
  );
}
