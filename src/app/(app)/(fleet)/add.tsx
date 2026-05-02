import React, { useState, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, Car, Camera } from 'lucide-react-native';

import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Chip, ChipGroup } from '@/components/ui/Chip';
import { Divider } from '@/components/ui/Divider';
import { useToastStore } from '@/components/ui/Toast';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCreateVehicle } from '@/hooks/useFleet';
import type { VehicleBrand, VehicleCategory, FuelType, Transmission } from '@/types/vehicle';

// ── Constants ───────────────────────────────────────────────────────────────

const BRANDS: VehicleBrand[] = [
  'Audi',
  'BMW',
  'Mercedes-Benz',
  'Škoda',
  'Volkswagen',
  'Mini',
  'Land Rover',
];

const CATEGORIES: VehicleCategory[] = [
  'SUV',
  'SUV Compact',
  'Sedan Compact',
  'Van / Minivan',
  'City Car',
  'SUV Coupé',
  'Hatchback',
  'SUV / 7 Places',
  'SUV Luxury',
  'Van / Utilitaire',
];

const FUEL_TYPES: { label: string; value: FuelType }[] = [
  { label: 'Gasoline', value: 'gasoline' },
  { label: 'Diesel', value: 'diesel' },
  { label: 'Electric', value: 'electric' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'Plug-in Hybrid', value: 'plug-in-hybrid' },
];

const TRANSMISSIONS: { label: string; value: Transmission }[] = [
  { label: 'Manual', value: 'manual' },
  { label: 'Automatic', value: 'automatic' },
];

// ── Stagger delay helper ────────────────────────────────────────────────────

const stagger = (index: number) => FadeInDown.delay(index * 60).duration(400).springify();

// ── Component ───────────────────────────────────────────────────────────────

export default function AddVehicleScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const showToast = useToastStore((s) => s.show);

  // ── Admin guard ─────────────────────────────────────────────────────────
  const isAdmin = user?.role === 'admin';

  // ── Form state ──────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [brand, setBrand] = useState<VehicleBrand | null>(null);
  const [category, setCategory] = useState<VehicleCategory | null>(null);
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [mileage, setMileage] = useState('');
  const [fuelType, setFuelType] = useState<FuelType | null>(null);
  const [transmission, setTransmission] = useState<Transmission | null>(null);
  const [seats, setSeats] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [notes, setNotes] = useState('');
  const createVehicle = useCreateVehicle();

  // ── Handlers ────────────────────────────────────────────────────────────

  const handlePhotosPress = useCallback(() => {
    showToast({ variant: 'info', title: 'Coming soon', message: 'Photo upload will be available soon.' });
  }, [showToast]);

  const handleSubmit = useCallback(() => {
    createVehicle.mutate(
      {
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        brand: brand ?? '',
        category: category ?? '',
        year: parseInt(year, 10) || new Date().getFullYear(),
        mileage: parseInt(mileage, 10) || 0,
        licensePlate,
        dailyRate: parseInt(dailyRate, 10) || 0,
        fuelType: fuelType ?? 'gasoline',
        transmission: transmission ?? 'automatic',
        seats: parseInt(seats, 10) || 5,
        color,
        features: notes ? [notes] : [],
        quantity: 1,
      },
      {
        onSuccess: () => {
          showToast({ variant: 'success', title: 'Vehicle added', message: 'The vehicle has been added to the fleet.' });
          router.back();
        },
        onError: (err: any) => {
          showToast({ variant: 'error', title: 'Error', message: err?.message || 'Failed to add vehicle' });
        },
      }
    );
  }, [createVehicle, name, brand, category, year, mileage, licensePlate, dailyRate, fuelType, transmission, seats, color, notes, showToast, router]);

  // ── Unauthorized state ──────────────────────────────────────────────────

  if (!isAdmin) {
    return (
      <ScreenWrapper>
        <View className="flex-1 items-center justify-center gap-4">
          <Text variant="headlineSmall" color={theme.danger}>
            {t('common.unauthorized', { defaultValue: 'Unauthorized' })}
          </Text>
          <Text variant="bodyMedium" color={theme.textSecondary} align="center">
            {t('common.adminOnly', { defaultValue: 'You need administrator privileges to access this page.' })}
          </Text>
          <Button variant="secondary" onPress={() => router.back()}>
            {t('common.goBack', { defaultValue: 'Go Back' })}
          </Button>
        </View>
      </ScreenWrapper>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────────

  let sectionIndex = 0;

  return (
    <ScreenWrapper scroll>
      {/* Header */}
      <Animated.View entering={stagger(sectionIndex++)} className="pt-4 mb-6">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center mb-4"
        >
          <ChevronLeft size={24} color={theme.accent} />
          <Text variant="bodyMedium" color={theme.accent}>
            {t('common.back', { defaultValue: 'Back' })}
          </Text>
        </Pressable>
        <Text variant="headlineLarge">
          {t('fleet.addVehicle', { defaultValue: 'Add Vehicle' })}
        </Text>
      </Animated.View>

      {/* ── Section: Vehicle Info ─────────────────────────────────────────── */}
      <Animated.View entering={stagger(sectionIndex++)} className="mb-2">
        <Text variant="labelLarge" color={theme.textSecondary} className="mb-3">
          {t('fleet.vehicleInfo', { defaultValue: 'Vehicle Info' })}
        </Text>
      </Animated.View>

      <Animated.View entering={stagger(sectionIndex++)} className="mb-3">
        <Input
          label={t('fleet.vehicleName', { defaultValue: 'Vehicle Name' })}
          placeholder="e.g., BMW X3"
          value={name}
          onChangeText={setName}
          leftIcon={Car}
        />
      </Animated.View>

      <Animated.View entering={stagger(sectionIndex++)} className="mb-3">
        <Text
          variant="bodySmall"
          color={theme.textSecondary}
          className="mb-1.5"
        >
          {t('fleet.brand', { defaultValue: 'Brand' })}
        </Text>
        <ChipGroup>
          {BRANDS.map((b) => (
            <Chip
              key={b}
              label={b}
              selected={brand === b}
              onPress={() => setBrand(b)}
            />
          ))}
        </ChipGroup>
      </Animated.View>

      <Animated.View entering={stagger(sectionIndex++)} className="mb-3">
        <Text
          variant="bodySmall"
          color={theme.textSecondary}
          className="mb-1.5"
        >
          {t('fleet.category', { defaultValue: 'Category' })}
        </Text>
        <ChipGroup>
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              label={c}
              selected={category === c}
              onPress={() => setCategory(c)}
            />
          ))}
        </ChipGroup>
      </Animated.View>

      <Animated.View entering={stagger(sectionIndex++)} className="flex-row gap-3 mb-3">
        <View className="flex-1">
          <Input
            label={t('fleet.year', { defaultValue: 'Year' })}
            placeholder="2024"
            value={year}
            onChangeText={setYear}
            keyboardType="number-pad"
          />
        </View>
        <View className="flex-1">
          <Input
            label={t('fleet.color', { defaultValue: 'Color' })}
            placeholder="e.g., Black"
            value={color}
            onChangeText={setColor}
          />
        </View>
      </Animated.View>

      <Animated.View entering={stagger(sectionIndex++)}>
        <Divider className="my-4" />
      </Animated.View>

      {/* ── Section: Registration ─────────────────────────────────────────── */}
      <Animated.View entering={stagger(sectionIndex++)} className="mb-2">
        <Text variant="labelLarge" color={theme.textSecondary} className="mb-3">
          {t('fleet.registration', { defaultValue: 'Registration' })}
        </Text>
      </Animated.View>

      <Animated.View entering={stagger(sectionIndex++)} className="mb-3">
        <Input
          label={t('fleet.licensePlate', { defaultValue: 'License Plate' })}
          placeholder="AB-123-CD"
          value={licensePlate}
          onChangeText={setLicensePlate}
        />
      </Animated.View>

      <Animated.View entering={stagger(sectionIndex++)} className="mb-3">
        <Input
          label={t('fleet.mileage', { defaultValue: 'Mileage (km)' })}
          value={mileage}
          onChangeText={setMileage}
          keyboardType="number-pad"
        />
      </Animated.View>

      <Animated.View entering={stagger(sectionIndex++)}>
        <Divider className="my-4" />
      </Animated.View>

      {/* ── Section: Specifications ───────────────────────────────────────── */}
      <Animated.View entering={stagger(sectionIndex++)} className="mb-2">
        <Text variant="labelLarge" color={theme.textSecondary} className="mb-3">
          {t('fleet.specifications', { defaultValue: 'Specifications' })}
        </Text>
      </Animated.View>

      <Animated.View entering={stagger(sectionIndex++)} className="mb-3">
        <Text
          variant="bodySmall"
          color={theme.textSecondary}
          className="mb-1.5"
        >
          {t('fleet.fuelType', { defaultValue: 'Fuel Type' })}
        </Text>
        <ChipGroup>
          {FUEL_TYPES.map((f) => (
            <Chip
              key={f.value}
              label={f.label}
              selected={fuelType === f.value}
              onPress={() => setFuelType(f.value)}
            />
          ))}
        </ChipGroup>
      </Animated.View>

      <Animated.View entering={stagger(sectionIndex++)} className="mb-3">
        <Text
          variant="bodySmall"
          color={theme.textSecondary}
          className="mb-1.5"
        >
          {t('fleet.transmission', { defaultValue: 'Transmission' })}
        </Text>
        <ChipGroup>
          {TRANSMISSIONS.map((tr) => (
            <Chip
              key={tr.value}
              label={tr.label}
              selected={transmission === tr.value}
              onPress={() => setTransmission(tr.value)}
            />
          ))}
        </ChipGroup>
      </Animated.View>

      <Animated.View entering={stagger(sectionIndex++)} className="flex-row gap-3 mb-3">
        <View className="flex-1">
          <Input
            label={t('fleet.seats', { defaultValue: 'Seats' })}
            placeholder="5"
            value={seats}
            onChangeText={setSeats}
            keyboardType="number-pad"
          />
        </View>
        <View className="flex-1">
          <Input
            label={t('fleet.dailyRate', { defaultValue: 'Daily Rate (\u20AC)' })}
            placeholder="120"
            value={dailyRate}
            onChangeText={setDailyRate}
            keyboardType="decimal-pad"
          />
        </View>
      </Animated.View>

      <Animated.View entering={stagger(sectionIndex++)}>
        <Divider className="my-4" />
      </Animated.View>

      {/* ── Section: Photos ───────────────────────────────────────────────── */}
      <Animated.View entering={stagger(sectionIndex++)} className="mb-2">
        <Text variant="labelLarge" color={theme.textSecondary} className="mb-3">
          {t('fleet.photos', { defaultValue: 'Photos' })}
        </Text>
      </Animated.View>

      <Animated.View entering={stagger(sectionIndex++)} className="mb-3">
        <Pressable
          onPress={handlePhotosPress}
          className="items-center justify-center rounded-xl py-8"
          style={{
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: theme.border,
            backgroundColor: theme.surfaceTertiary,
          }}
        >
          <Camera size={32} color={theme.textTertiary} />
          <Text variant="bodyMedium" color={theme.textTertiary} className="mt-2">
            {t('fleet.addPhotos', { defaultValue: 'Add Photos' })}
          </Text>
        </Pressable>
      </Animated.View>

      <Animated.View entering={stagger(sectionIndex++)}>
        <Divider className="my-4" />
      </Animated.View>

      {/* ── Section: Notes ────────────────────────────────────────────────── */}
      <Animated.View entering={stagger(sectionIndex++)} className="mb-2">
        <Text variant="labelLarge" color={theme.textSecondary} className="mb-3">
          {t('fleet.notes', { defaultValue: 'Notes' })}
        </Text>
      </Animated.View>

      <Animated.View entering={stagger(sectionIndex++)} className="mb-6">
        <Input
          label={t('fleet.notesLabel', { defaultValue: 'Notes' })}
          placeholder={t('fleet.notesPlaceholder', { defaultValue: 'Any additional notes about this vehicle...' })}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </Animated.View>

      {/* ── Submit ────────────────────────────────────────────────────────── */}
      <Animated.View entering={stagger(sectionIndex++)} className="mb-8">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={createVehicle.isPending}
          onPress={handleSubmit}
        >
          {t('fleet.addVehicle', { defaultValue: 'Add Vehicle' })}
        </Button>
      </Animated.View>
    </ScreenWrapper>
  );
}
