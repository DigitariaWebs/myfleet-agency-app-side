import React, { useState, useMemo, useCallback } from 'react';
import { Platform, View, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import {
  X,
  ArrowLeft,
  Car,
  User,
  CalendarDays,
  DollarSign,
  ClipboardCheck,
  CheckCircle,
  Clock,
  UserPlus,
  Shield,
  Users,
  Navigation,
  Baby,
  AlertTriangle,
} from 'lucide-react-native';

import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Text } from '@/components/ui/Text';
import { SearchBar } from '@/components/ui/SearchBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StickyButton } from '@/components/ui/StickyButton';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Divider } from '@/components/ui/Divider';
import { Avatar } from '@/components/ui/Avatar';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/theme/colors';
import { mockVehicles } from '@/data/vehicles';
import { mockClients } from '@/data/clients';
import type { Vehicle } from '@/types/vehicle';
import type { Client } from '@/types/client';
import { useBookingStore } from '@/stores/useBookingStore';
import { useToastStore } from '@/components/ui/Toast';

// ── Constants ───────────────────────────────────────────────────────────────

const STEP_COUNT = 5;

const STEP_ICONS = [Car, User, CalendarDays, DollarSign, ClipboardCheck] as const;

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

interface OptionToggle {
  id: string;
  label: string;
  price: number;
  enabled: boolean;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function isValidDate(dateStr: string): boolean {
  if (!DATE_REGEX.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === dateStr;
}

function calcDays(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / 86_400_000));
}

// ── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({
  currentStep,
  theme,
}: {
  currentStep: number;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View className="flex-row items-center justify-center gap-2 py-3">
      {Array.from({ length: STEP_COUNT }, (_, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;
        return (
          <View
            key={i}
            style={{
              width: isActive ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: isActive || isCompleted ? theme.accent : theme.border,
            }}
          />
        );
      })}
    </View>
  );
}

// ── Success Overlay ─────────────────────────────────────────────────────────

function SuccessOverlay({
  bookingRef,
  onBack,
  theme,
}: {
  bookingRef: string;
  onBack: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  const checkScale = useSharedValue(0);

  React.useEffect(() => {
    checkScale.value = withSequence(
      withTiming(1.3, { duration: 300 }),
      withSpring(1, { damping: 8, stiffness: 150 }),
    );
  }, [checkScale]);

  const animatedCheckStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <View
      className="absolute inset-0 items-center justify-center z-50"
      style={{ backgroundColor: theme.background }}
    >
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="items-center px-8"
      >
        <Animated.View style={animatedCheckStyle} className="mb-6">
          <CheckCircle size={80} color={theme.success} strokeWidth={1.5} />
        </Animated.View>

        <Text variant="headlineLarge" align="center">
          Booking Confirmed!
        </Text>

        <View className="mt-3 mb-2">
          <Text variant="bodyMedium" color={theme.textSecondary} align="center">
            Reference
          </Text>
        </View>

        <Badge variant="accent" size="lg">
          {bookingRef}
        </Badge>

        <View className="mt-8 w-full">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={onBack}
          >
            Back to Bookings
          </Button>
        </View>
      </Animated.View>
    </View>
  );
}

// ── Main Screen ─────────────────────────────────────────────────────────────

export default function NewBookingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.background === colors.dark.background;
  const pickerTheme = isDark ? 'dark' : 'light';
  const showToast = useToastStore((s) => s.show);
  const bookingStore = useBookingStore();

  // ── Flow State ──────────────────────────────────────────────────────────
  const [step, setStep] = useState<number>(1);

  // Step 1: Vehicle
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleSearch, setVehicleSearch] = useState('');

  // Step 2: Client
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearch, setClientSearch] = useState('');

  // Step 3: Dates (native pickers)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [startDateObj, setStartDateObj] = useState<Date>(tomorrow);
  const [endDateObj, setEndDateObj] = useState<Date>(() => {
    const d = new Date(tomorrow);
    d.setDate(d.getDate() + 3);
    return d;
  });
  const [pickupTime, setPickupTime] = useState<Date>(() => {
    const d = new Date(); d.setHours(9, 0, 0, 0); return d;
  });
  const [returnTime, setReturnTime] = useState<Date>(() => {
    const d = new Date(); d.setHours(18, 0, 0, 0); return d;
  });
  const [showPicker, setShowPicker] = useState<'start' | 'end' | 'pickupTime' | 'returnTime' | null>(null);

  // String versions for store/validation
  const startDate = startDateObj.toISOString().slice(0, 10);
  const endDate = endDateObj.toISOString().slice(0, 10);

  // Step 4: Options
  const [options, setOptions] = useState<OptionToggle[]>([
    { id: 'ins', label: 'Insurance Plus', price: 15, enabled: false },
    { id: 'drv', label: 'Additional Driver', price: 10, enabled: false },
    { id: 'gps', label: 'GPS', price: 8, enabled: false },
    { id: 'seat', label: 'Child Seat', price: 5, enabled: false },
  ]);

  // Step 5: Confirm
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);

  // ── Derived Data ────────────────────────────────────────────────────────

  const availableVehicles = useMemo(
    () => mockVehicles.filter((v) => v.status === 'available'),
    [],
  );

  const filteredVehicles = useMemo(() => {
    const q = vehicleSearch.toLowerCase().trim();
    if (!q) return availableVehicles;
    return availableVehicles.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q),
    );
  }, [availableVehicles, vehicleSearch]);

  const filteredClients = useMemo(() => {
    const q = clientSearch.toLowerCase().trim();
    if (!q) return mockClients;
    return mockClients.filter(
      (c) =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.phone.includes(q),
    );
  }, [clientSearch]);

  const datesValid = useMemo(() => endDateObj > startDateObj, [startDateObj, endDateObj]);

  const days = useMemo(() => {
    if (!datesValid) return 0;
    return Math.max(1, Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / 86400000));
  }, [startDateObj, endDateObj, datesValid]);

  const vehicleAvailableForDates = useMemo(() => {
    if (!selectedVehicle || !datesValid) return true;
    return useBookingStore.getState().isVehicleAvailable(selectedVehicle.id, startDate, endDate);
  }, [selectedVehicle, startDate, endDate, datesValid]);

  const pricing = useMemo(() => {
    if (!selectedVehicle || days <= 0) {
      return { subtotal: 0, optionsTotal: 0, deposit: 0, total: 0 };
    }
    const subtotal = selectedVehicle.dailyRate * days;
    const optionsTotal = options
      .filter((o) => o.enabled)
      .reduce((sum, o) => sum + o.price * days, 0);
    const deposit = Math.round(subtotal * 0.4);
    const total = subtotal + optionsTotal;
    return { subtotal, optionsTotal, deposit, total };
  }, [selectedVehicle, days, options]);

  // ── Step Validation ─────────────────────────────────────────────────────

  const isStepValid = useMemo((): boolean => {
    switch (step) {
      case 1:
        return selectedVehicle !== null;
      case 2:
        return selectedClient !== null;
      case 3:
        return datesValid && vehicleAvailableForDates;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  }, [step, selectedVehicle, selectedClient, datesValid, vehicleAvailableForDates]);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleNext = useCallback(() => {
    if (step < STEP_COUNT) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep((s) => s + 1);
    }
  }, [step]);

  const handleBack = useCallback(() => {
    if (step > 1) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep((s) => s - 1);
    }
  }, [step]);

  const handleClose = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const toggleOption = useCallback((optionId: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOptions((prev) =>
      prev.map((o) => (o.id === optionId ? { ...o, enabled: !o.enabled } : o)),
    );
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedVehicle || !selectedClient) return;

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    bookingStore.startDraft();
    bookingStore.updateDraft({
      vehicleId: selectedVehicle.id,
      vehicleName: `${selectedVehicle.brand} ${selectedVehicle.name}`,
      clientId: selectedClient.id,
      clientName: `${selectedClient.firstName} ${selectedClient.lastName}`,
      startDate,
      endDate,
      pickupTime: pickupTime.toTimeString().slice(0, 5),
      returnTime: returnTime.toTimeString().slice(0, 5),
      options: options.map((o) => ({
        id: o.id,
        label: o.label,
        price: o.price,
        enabled: o.enabled,
      })),
    });

    const booking = bookingStore.createBooking(selectedVehicle.dailyRate);

    if (booking) {
      setConfirmedRef(booking.id);
    } else {
      showToast({
        variant: 'error',
        title: 'Error',
        message: 'Failed to create booking. Please try again.',
      });
    }
  }, [selectedVehicle, selectedClient, startDate, endDate, options, bookingStore, showToast]);

  const handleSaveDraft = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showToast({
      variant: 'info',
      title: 'Coming soon',
      message: 'Draft saving will be available soon.',
    });
  }, [showToast]);

  const handleAddNewClient = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showToast({
      variant: 'info',
      title: 'Coming soon',
      message: 'Adding new clients will be available soon.',
    });
  }, [showToast]);

  const handleBackToBookings = useCallback(() => {
    router.replace('/(app)/(bookings)');
  }, [router]);

  // ── Date/time helpers (must be before any conditional return) ────────────

  const onDateChange = useCallback(
    (pickerKey: 'start' | 'end' | 'pickupTime' | 'returnTime') =>
      (_: DateTimePickerEvent, selected?: Date) => {
        if (Platform.OS === 'android') setShowPicker(null);
        if (!selected) return;
        if (pickerKey === 'start') setStartDateObj(selected);
        else if (pickerKey === 'end') setEndDateObj(selected);
        else if (pickerKey === 'pickupTime') setPickupTime(selected);
        else if (pickerKey === 'returnTime') setReturnTime(selected);
      },
    [],
  );

  const formatDisplayDate = useCallback(
    (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    [],
  );

  const formatDisplayTime = useCallback(
    (d: Date) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    [],
  );

  // ── Success Overlay ─────────────────────────────────────────────────────

  if (confirmedRef) {
    return (
      <ScreenWrapper>
        <SuccessOverlay
          bookingRef={confirmedRef}
          onBack={handleBackToBookings}
          theme={theme}
        />
      </ScreenWrapper>
    );
  }

  // ── Step Titles ─────────────────────────────────────────────────────────

  const stepTitles: Record<number, string> = {
    1: t('bookings.new.step1', 'Select Vehicle'),
    2: t('bookings.new.step2', 'Select Client'),
    3: t('bookings.new.step3', 'Select Dates'),
    4: t('bookings.new.step4', 'Pricing & Options'),
    5: t('bookings.new.step5', 'Review & Confirm'),
  };

  // ── Option Icons ────────────────────────────────────────────────────────

  const optionIcons: Record<string, typeof Shield> = {
    ins: Shield,
    drv: Users,
    gps: Navigation,
    seat: Baby,
  };

  // ── Render Steps ────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <Animated.View entering={FadeInDown.duration(400).delay(100)}>
      <SearchBar
        placeholder={t('bookings.new.searchVehicle', 'Search vehicles...')}
        value={vehicleSearch}
        onChangeText={setVehicleSearch}
        className="mb-4"
      />

      <Text variant="bodySmall" color={theme.textSecondary} className="mb-3">
        {filteredVehicles.length} {t('bookings.new.available', 'available')}
      </Text>

      {filteredVehicles.map((vehicle, index) => {
        const isSelected = selectedVehicle?.id === vehicle.id;
        return (
          <Animated.View
            key={vehicle.id}
            entering={FadeInDown.duration(300).delay(index * 60)}
          >
            <Pressable
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedVehicle(vehicle);
              }}
              className="mb-3"
            >
              <Card
                variant={isSelected ? 'elevated' : 'default'}
                className={isSelected ? '' : ''}
              >
                <View
                  style={
                    isSelected
                      ? { borderWidth: 2, borderColor: theme.accent, borderRadius: 16, padding: 0, margin: -1 }
                      : undefined
                  }
                  className={isSelected ? 'rounded-2xl' : ''}
                >
                  <View className="p-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text variant="titleLarge">
                          {vehicle.brand} {vehicle.name}
                        </Text>
                        <Text variant="bodySmall" color={theme.textSecondary}>
                          {vehicle.category}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text variant="headlineSmall" color={theme.accent}>
                          {'\u20AC'}{vehicle.dailyRate}
                        </Text>
                        <Text variant="bodySmall" color={theme.textTertiary}>
                          /day
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center mt-2 gap-2">
                      <Badge variant="neutral" size="sm">
                        {vehicle.year.toString()}
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        {vehicle.transmission}
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        {vehicle.fuelType}
                      </Badge>
                    </View>
                  </View>
                </View>
              </Card>
            </Pressable>
          </Animated.View>
        );
      })}

      {filteredVehicles.length === 0 && (
        <View className="items-center py-8">
          <Text variant="bodyMedium" color={theme.textTertiary}>
            {t('bookings.new.noVehicles', 'No vehicles found')}
          </Text>
        </View>
      )}
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View entering={FadeInDown.duration(400).delay(100)}>
      <Button
        variant="secondary"
        size="md"
        fullWidth
        leftIcon={UserPlus}
        onPress={handleAddNewClient}
        className="mb-4"
      >
        {t('bookings.new.addClient', 'Add New Client')}
      </Button>

      <SearchBar
        placeholder={t('bookings.new.searchClient', 'Search clients...')}
        value={clientSearch}
        onChangeText={setClientSearch}
        className="mb-4"
      />

      {filteredClients.map((client, index) => {
        const isSelected = selectedClient?.id === client.id;
        const fullName = `${client.firstName} ${client.lastName}`;
        return (
          <Animated.View
            key={client.id}
            entering={FadeInDown.duration(300).delay(index * 60)}
          >
            <Pressable
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedClient(client);
              }}
              className="mb-3"
            >
              <View
                className="rounded-2xl p-4"
                style={{
                  backgroundColor: theme.surface,
                  borderWidth: isSelected ? 2 : 0,
                  borderColor: isSelected ? theme.accent : 'transparent',
                }}
              >
                <View className="flex-row items-center">
                  <Avatar name={fullName} size="md" />
                  <View className="ml-3 flex-1">
                    <Text variant="titleMedium">{fullName}</Text>
                    <Text variant="bodySmall" color={theme.textSecondary}>
                      {client.phone}
                    </Text>
                  </View>
                  {isSelected && (
                    <CheckCircle size={20} color={theme.accent} />
                  )}
                </View>
              </View>
            </Pressable>
          </Animated.View>
        );
      })}

      {filteredClients.length === 0 && (
        <View className="items-center py-8">
          <Text variant="bodyMedium" color={theme.textTertiary}>
            {t('bookings.new.noClients', 'No clients found')}
          </Text>
        </View>
      )}
    </Animated.View>
  );

  const renderStep3 = () => {
    return (
      <Animated.View entering={FadeInDown.duration(400).delay(100)}>
        {/* Date pickers */}
        <Card className="mb-4">
          <View className="p-4">
            {/* Start date */}
            <Text variant="bodySmall" color={theme.textSecondary} className="mb-2">
              Date de début
            </Text>
            <Pressable
              onPress={() => setShowPicker('start')}
              className="flex-row items-center rounded-xl px-4 py-3 mb-4"
              style={{ backgroundColor: theme.surfaceTertiary }}
            >
              <CalendarDays size={18} color={theme.accent} style={{ marginRight: 10 }} />
              <Text variant="titleMedium">{formatDisplayDate(startDateObj)}</Text>
            </Pressable>

            {showPicker === 'start' && (
              <DateTimePicker
                value={startDateObj}
                mode="date"
                display="spinner"
                minimumDate={new Date()}
                locale="fr-FR"
                themeVariant={pickerTheme}
                onChange={onDateChange('start')}
              />
            )}

            {/* End date */}
            <Text variant="bodySmall" color={theme.textSecondary} className="mb-2">
              Date de fin
            </Text>
            <Pressable
              onPress={() => setShowPicker('end')}
              className="flex-row items-center rounded-xl px-4 py-3"
              style={{ backgroundColor: theme.surfaceTertiary }}
            >
              <CalendarDays size={18} color={theme.accent} style={{ marginRight: 10 }} />
              <Text variant="titleMedium">{formatDisplayDate(endDateObj)}</Text>
            </Pressable>

            {showPicker === 'end' && (
              <DateTimePicker
                value={endDateObj}
                mode="date"
                display="spinner"
                minimumDate={startDateObj}
                locale="fr-FR"
                themeVariant={pickerTheme}
                onChange={onDateChange('end')}
              />
            )}

            {/* Duration badge */}
            {datesValid && (
              <Animated.View entering={FadeInDown.duration(300)} className="mt-4">
                <View className="rounded-full py-2 px-4 self-center" style={{ backgroundColor: theme.accentSoft }}>
                  <Text variant="titleMedium" color={theme.accent}>
                    {days} jours
                  </Text>
                </View>
              </Animated.View>
            )}
          </View>
        </Card>

        {/* Time pickers */}
        <Card className="mb-4">
          <View className="p-4">
            <Text variant="titleMedium" className="mb-3">Horaires</Text>
            {/* Time buttons row */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text variant="bodySmall" color={theme.textSecondary} className="mb-2">
                  Prise en charge
                </Text>
                <Pressable
                  onPress={() => setShowPicker(showPicker === 'pickupTime' ? null : 'pickupTime')}
                  className="flex-row items-center justify-center rounded-xl py-3"
                  style={{ backgroundColor: showPicker === 'pickupTime' ? theme.accentSoft : theme.surfaceTertiary }}
                >
                  <Clock size={16} color={theme.accent} style={{ marginRight: 6 }} />
                  <Text variant="titleMedium">{formatDisplayTime(pickupTime)}</Text>
                </Pressable>
              </View>

              <View className="flex-1">
                <Text variant="bodySmall" color={theme.textSecondary} className="mb-2">
                  Retour
                </Text>
                <Pressable
                  onPress={() => setShowPicker(showPicker === 'returnTime' ? null : 'returnTime')}
                  className="flex-row items-center justify-center rounded-xl py-3"
                  style={{ backgroundColor: showPicker === 'returnTime' ? theme.accentSoft : theme.surfaceTertiary }}
                >
                  <Clock size={16} color={theme.accent} style={{ marginRight: 6 }} />
                  <Text variant="titleMedium">{formatDisplayTime(returnTime)}</Text>
                </Pressable>
              </View>
            </View>

            {/* Time picker — full width, centered below buttons */}
            {showPicker === 'pickupTime' && (
              <View className="items-center mt-2">
                <DateTimePicker
                  value={pickupTime}
                  mode="time"
                  display="spinner"
                  minuteInterval={15}
                  locale="fr-FR"
                  themeVariant={pickerTheme}
                  onChange={onDateChange('pickupTime')}
                />
              </View>
            )}
            {showPicker === 'returnTime' && (
              <View className="items-center mt-2">
                <DateTimePicker
                  value={returnTime}
                  mode="time"
                  display="spinner"
                  minuteInterval={15}
                  locale="fr-FR"
                  themeVariant={pickerTheme}
                  onChange={onDateChange('returnTime')}
                />
              </View>
            )}
          </View>
        </Card>

        {/* Unavailable warning */}
        {datesValid && !vehicleAvailableForDates && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <View
              className="rounded-2xl p-4 flex-row items-center gap-3"
              style={{ backgroundColor: theme.dangerSoft }}
            >
              <AlertTriangle size={20} color={theme.danger} />
              <View className="flex-1">
                <Text variant="titleSmall" color={theme.danger}>
                  Véhicule indisponible
                </Text>
                <Text variant="bodySmall" color={theme.danger}>
                  Ce véhicule est déjà réservé pour les dates sélectionnées.
                </Text>
              </View>
            </View>
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  const renderStep4 = () => (
    <Animated.View entering={FadeInDown.duration(400).delay(100)}>
      <Card className="mb-4">
        <View className="p-4">
          <Text variant="titleMedium" className="mb-3">
            {t('bookings.new.pricing', 'Tarification')}
          </Text>

          {/* Daily rate line */}
          <View className="flex-row items-center justify-between mb-2">
            <Text variant="bodyMedium" color={theme.textSecondary}>
              {'\u20AC'}{selectedVehicle?.dailyRate ?? 0} {'\u00D7'} {days} jours
            </Text>
            <Text variant="bodyMedium">
              {'\u20AC'}{pricing.subtotal}
            </Text>
          </View>

          <Divider className="my-3" />

          {/* Option toggles */}
          <Text variant="titleSmall" color={theme.textSecondary} className="mb-2">
            OPTIONS
          </Text>

          {options.map((option) => {
            const OptionIcon = optionIcons[option.id] ?? Shield;
            return (
              <Pressable
                key={option.id}
                onPress={() => toggleOption(option.id)}
                className="flex-row items-center justify-between py-3"
              >
                <View className="flex-row items-center flex-1 gap-3">
                  <View
                    className="rounded-lg items-center justify-center"
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: option.enabled
                        ? theme.accentSoft
                        : theme.surfaceTertiary,
                    }}
                  >
                    <OptionIcon
                      size={18}
                      color={option.enabled ? theme.accent : theme.textTertiary}
                    />
                  </View>
                  <View className="flex-1">
                    <Text variant="bodyMedium">{option.label}</Text>
                    <Text variant="bodySmall" color={theme.textTertiary}>
                      +{'\u20AC'}{option.price}/day
                    </Text>
                  </View>
                </View>

                {/* Toggle switch */}
                <View
                  className="rounded-full"
                  style={{
                    width: 48,
                    height: 28,
                    backgroundColor: option.enabled
                      ? theme.accent
                      : theme.surfaceTertiary,
                    justifyContent: 'center',
                    paddingHorizontal: 2,
                  }}
                >
                  <View
                    className="rounded-full"
                    style={{
                      width: 24,
                      height: 24,
                      backgroundColor: '#FFFFFF',
                      alignSelf: option.enabled ? 'flex-end' : 'flex-start',
                    }}
                  />
                </View>
              </Pressable>
            );
          })}

          <Divider className="my-3" />

          {/* Deposit */}
          <View className="flex-row items-center justify-between mb-2">
            <Text variant="bodyMedium" color={theme.textSecondary}>
              {t('bookings.new.deposit', 'Deposit')}
            </Text>
            <Text variant="bodyMedium">
              {'\u20AC'}{pricing.deposit}
            </Text>
          </View>

          <Divider className="my-3" />

          {/* Total */}
          <View className="flex-row items-center justify-between">
            <Text variant="headlineMedium">Total</Text>
            <Text variant="headlineMedium" color={theme.accent}>
              {'\u20AC'}{pricing.total}
            </Text>
          </View>
        </View>
      </Card>
    </Animated.View>
  );

  const renderStep5 = () => {
    const enabledOptions = options.filter((o) => o.enabled);

    return (
      <Animated.View entering={FadeInDown.duration(400).delay(100)}>
        {/* Summary Card */}
        <Card className="mb-4">
          <View className="p-4">
            <Text variant="titleMedium" className="mb-4">
              {t('bookings.new.summary', 'Booking Summary')}
            </Text>

            {/* Vehicle */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <Car size={16} color={theme.textSecondary} />
                <Text variant="bodySmall" color={theme.textSecondary}>
                  Vehicle
                </Text>
              </View>
              <Text variant="bodyMedium">
                {selectedVehicle?.brand} {selectedVehicle?.name}
              </Text>
            </View>

            <Divider className="mb-3" />

            {/* Client */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <User size={16} color={theme.textSecondary} />
                <Text variant="bodySmall" color={theme.textSecondary}>
                  Client
                </Text>
              </View>
              <View className="items-end">
                <Text variant="bodyMedium">
                  {selectedClient?.firstName} {selectedClient?.lastName}
                </Text>
                <Text variant="bodySmall" color={theme.textTertiary}>
                  {selectedClient?.email}
                </Text>
              </View>
            </View>

            <Divider className="mb-3" />

            {/* Dates */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <CalendarDays size={16} color={theme.textSecondary} />
                <Text variant="bodySmall" color={theme.textSecondary}>
                  Dates
                </Text>
              </View>
              <View className="items-end">
                <Text variant="bodyMedium">
                  {startDate} {'\u2192'} {endDate}
                </Text>
                <Text variant="bodySmall" color={theme.textTertiary}>
                  {days} days
                </Text>
              </View>
            </View>

            <Divider className="mb-3" />

            {/* Options */}
            {enabledOptions.length > 0 && (
              <>
                <View className="mb-3">
                  <Text variant="bodySmall" color={theme.textSecondary} className="mb-2">
                    Options
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {enabledOptions.map((opt) => (
                      <Badge key={opt.id} variant="accent" size="sm">
                        {opt.label}
                      </Badge>
                    ))}
                  </View>
                </View>
                <Divider className="mb-3" />
              </>
            )}

            {/* Total */}
            <View className="flex-row items-center justify-between">
              <Text variant="headlineMedium">Total</Text>
              <Text variant="headlineMedium" color={theme.accent}>
                {'\u20AC'}{pricing.total}
              </Text>
            </View>
          </View>
        </Card>

        {/* Action buttons */}
        <View className="gap-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleConfirm}
          >
            {t('bookings.new.confirm', 'Confirm Booking')}
          </Button>

          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onPress={handleSaveDraft}
          >
            {t('bookings.new.saveDraft', 'Save as Draft')}
          </Button>
        </View>
      </Animated.View>
    );
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  // ── Main Render ─────────────────────────────────────────────────────────

  const showNextBtn = step < 5 && isStepValid;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingBottom: showNextBtn ? 90 : 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(400)}
            className="flex-row items-center justify-between pt-4 pb-2"
          >
            <View className="flex-row items-center gap-3">
              {step > 1 ? (
                <Pressable onPress={handleBack} className="p-1">
                  <ArrowLeft size={24} color={theme.textPrimary} />
                </Pressable>
              ) : (
                <View style={{ width: 26 }} />
              )}
              <View>
                <Text variant="bodySmall" color={theme.textTertiary}>
                  {t('bookings.new.stepOf', 'Step {{current}} of {{total}}', {
                    current: step,
                    total: STEP_COUNT,
                  })}
                </Text>
                <Text variant="headlineSmall">
                  {stepTitles[step]}
                </Text>
              </View>
            </View>

            <Pressable onPress={handleClose} className="p-1">
              <X size={24} color={theme.textPrimary} />
            </Pressable>
          </Animated.View>

          {/* Step Indicator */}
          <StepIndicator currentStep={step} theme={theme} />

          {/* Step Content */}
          <View className="flex-1">
            {renderCurrentStep()}
          </View>
        </ScrollView>

        {/* Sticky bottom button — OUTSIDE ScrollView */}
        {showNextBtn && (
          <StickyButton variant="primary" onPress={handleNext}>
            {t('bookings.new.next', 'Next')}
          </StickyButton>
        )}
      </View>
    </SafeAreaView>
  );
}
