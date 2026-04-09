import React, { useState, useCallback, useMemo } from 'react';
import { View, Pressable, FlatList, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import { useTheme } from '@/hooks/useTheme';
import { mockBookings } from '@/data/bookings';
import type { Booking, BookingStatus } from '@/types/booking';

type StatusBadgeVariant = 'success' | 'info' | 'warning' | 'neutral' | 'danger';

function getStatusBadge(status: BookingStatus): {
  label: string;
  variant: StatusBadgeVariant;
} {
  switch (status) {
    case 'active':
      return { label: 'Active', variant: 'success' };
    case 'confirmed':
      return { label: 'Confirmed', variant: 'info' };
    case 'pending':
      return { label: 'Pending', variant: 'warning' };
    case 'completed':
      return { label: 'Completed', variant: 'neutral' };
    case 'cancelled':
      return { label: 'Cancelled', variant: 'danger' };
  }
}

function getDotVariant(
  status: BookingStatus,
  theme: ReturnType<typeof useTheme>,
): string {
  switch (status) {
    case 'active':
      return theme.success;
    case 'confirmed':
    case 'pending':
      return theme.info;
    case 'completed':
      return theme.textTertiary;
    case 'cancelled':
      return theme.danger;
  }
}

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const MONTH_NAMES = [
  'Janvier',
  'F\u00E9vrier',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Ao\u00FBt',
  'Septembre',
  'Octobre',
  'Novembre',
  'D\u00E9cembre',
];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatLongDate(date: Date): string {
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

interface CalendarDay {
  date: Date | null; // null for empty padding cells
  dayNumber: number;
  isToday: boolean;
  bookingColors: string[];
}

function generateCalendarDays(
  year: number,
  month: number,
  bookingsByDay: Map<number, string[]>,
  today: Date,
): CalendarDay[] {
  const firstOfMonth = new Date(year, month, 1);
  // Monday=0 ... Sunday=6
  const startDow = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: CalendarDay[] = [];

  // Padding before first day
  for (let i = 0; i < startDow; i++) {
    days.push({ date: null, dayNumber: 0, isToday: false, bookingColors: [] });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    days.push({
      date: dateObj,
      dayNumber: d,
      isToday: isSameDay(dateObj, today),
      bookingColors: bookingsByDay.get(d) ?? [],
    });
  }

  return days;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface DayBookingCardProps {
  booking: Booking;
  index: number;
  onPress: () => void;
}

function DayBookingCard({ booking, index, onPress }: DayBookingCardProps) {
  const theme = useTheme();
  const statusBadge = getStatusBadge(booking.status);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(index * 50).duration(350).springify()}
      onPress={handlePress}
      className="rounded-xl p-3 mb-2 flex-row items-center justify-between"
      style={{ backgroundColor: theme.surface }}
    >
      <View className="flex-1 mr-2">
        <Text variant="titleMedium" numberOfLines={1}>
          {booking.vehicleName}
        </Text>
        <Text
          variant="bodySmall"
          color={theme.textSecondary}
          numberOfLines={1}
          className="mt-0.5"
        >
          {booking.clientName}
        </Text>
      </View>
      <Badge variant={statusBadge.variant} size="sm">
        {statusBadge.label}
      </Badge>
    </AnimatedPressable>
  );
}

export default function CalendarScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();

  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState<Date>(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Compute bookings per day for current month (excluding cancelled)
  const bookingsByDay = useMemo(() => {
    const map = new Map<number, string[]>();

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    for (const b of mockBookings) {
      if (b.status === 'cancelled') continue;

      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);

      // Check if booking overlaps this month
      if (bEnd < monthStart || bStart > monthEnd) continue;

      const rangeStart = Math.max(bStart.getDate(), bStart < monthStart ? 1 : bStart.getDate());
      const rangeEnd = bEnd > monthEnd ? monthEnd.getDate() : bEnd.getDate();

      // Only consider days that actually fall in this month
      const effectiveStart =
        bStart.getFullYear() === year && bStart.getMonth() === month
          ? bStart.getDate()
          : 1;
      const effectiveEnd =
        bEnd.getFullYear() === year && bEnd.getMonth() === month
          ? bEnd.getDate()
          : monthEnd.getDate();

      for (let d = effectiveStart; d <= effectiveEnd; d++) {
        const existing = map.get(d) ?? [];
        const color = getDotVariant(b.status, theme);
        if (!existing.includes(color)) {
          existing.push(color);
        }
        map.set(d, existing);
      }
    }

    return map;
  }, [year, month, theme]);

  const calendarDays = useMemo(
    () => generateCalendarDays(year, month, bookingsByDay, today),
    [year, month, bookingsByDay, today],
  );

  // Bookings for selected date
  const selectedDayBookings = useMemo(() => {
    if (selectedDate === null) return [];

    const selTime = selectedDate.getTime();

    return mockBookings.filter((b) => {
      if (b.status === 'cancelled') return false;
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      // Normalize to start of day
      bStart.setHours(0, 0, 0, 0);
      bEnd.setHours(23, 59, 59, 999);
      const selNormalized = new Date(selTime);
      selNormalized.setHours(12, 0, 0, 0);
      return selNormalized >= bStart && selNormalized <= bEnd;
    });
  }, [selectedDate]);

  const goToPrevMonth = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(null);
  }, []);

  const goToNextMonth = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(null);
  }, []);

  const handleDayPress = useCallback((date: Date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate((prev) => (prev !== null && isSameDay(prev, date) ? null : date));
  }, []);

  const handleBookingPress = useCallback(
    (id: string) => {
      router.push(`/(bookings)/${id}`);
    },
    [router],
  );

  const isSelected = useCallback(
    (date: Date | null): boolean => {
      if (date === null || selectedDate === null) return false;
      return isSameDay(date, selectedDate);
    },
    [selectedDate],
  );

  return (
    <ScreenWrapper scroll={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
      >
        {/* Header */}
        <View className="flex-row items-center pt-4 pb-4">
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            className="mr-3 p-1"
          >
            <ChevronLeft size={24} color={theme.textPrimary} />
          </Pressable>
          <Text variant="headlineLarge">
            {t('bookings.calendar.title', 'Calendrier')}
          </Text>
        </View>

        {/* Month navigation */}
        <View className="flex-row items-center justify-between mb-4">
          <IconButton
            icon={ChevronLeft}
            variant="ghost"
            size="sm"
            onPress={goToPrevMonth}
          />
          <Text variant="titleMedium">
            {MONTH_NAMES[month]} {year}
          </Text>
          <IconButton
            icon={ChevronRight}
            variant="ghost"
            size="sm"
            onPress={goToNextMonth}
          />
        </View>

        {/* Weekday headers */}
        <View className="flex-row mb-2">
          {WEEKDAY_LABELS.map((label) => (
            <View key={label} className="flex-1 items-center">
              <Text variant="labelSmall" color={theme.textTertiary}>
                {label}
              </Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View className="flex-row flex-wrap">
          {calendarDays.map((day, idx) => {
            if (day.date === null) {
              return <View key={`empty-${idx}`} style={{ width: '14.285%', height: 48 }} />;
            }

            const dayIsToday = day.isToday;
            const dayIsSelected = isSelected(day.date);
            const dayDate = day.date;

            return (
              <Pressable
                key={`day-${day.dayNumber}`}
                onPress={() => handleDayPress(dayDate)}
                style={{ width: '14.285%', height: 48 }}
                className="items-center justify-center"
              >
                <View
                  className="items-center justify-center"
                  style={[
                    { width: 36, height: 36, borderRadius: 18 },
                    dayIsToday && !dayIsSelected
                      ? { backgroundColor: theme.accentSoft }
                      : undefined,
                    dayIsSelected
                      ? { backgroundColor: theme.accent }
                      : undefined,
                  ]}
                >
                  <Text
                    variant="bodySmall"
                    color={
                      dayIsSelected
                        ? '#0A0A0F'
                        : dayIsToday
                          ? theme.accent
                          : theme.textPrimary
                    }
                  >
                    {day.dayNumber}
                  </Text>
                </View>

                {/* Booking dots */}
                {day.bookingColors.length > 0 && (
                  <View
                    className="flex-row absolute"
                    style={{ bottom: 2, gap: 2 }}
                  >
                    {day.bookingColors.slice(0, 3).map((color, i) => (
                      <View
                        key={`dot-${day.dayNumber}-${i}`}
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: 2.5,
                          backgroundColor: color,
                        }}
                      />
                    ))}
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Selected day's bookings */}
        {selectedDate !== null && (
          <View className="mt-6">
            <View className="flex-row items-center mb-3">
              <Text variant="titleMedium">{formatLongDate(selectedDate)}</Text>
              <Badge variant="accent" size="sm" className="ml-2">
                {selectedDayBookings.length}
              </Badge>
            </View>

            {selectedDayBookings.length === 0 ? (
              <View
                className="rounded-xl p-4 items-center"
                style={{ backgroundColor: theme.surface }}
              >
                <Text variant="bodySmall" color={theme.textTertiary}>
                  {t(
                    'bookings.calendar.noBookings',
                    'Aucune r\u00E9servation pour ce jour',
                  )}
                </Text>
              </View>
            ) : (
              selectedDayBookings.map((booking, index) => (
                <DayBookingCard
                  key={booking.id}
                  booking={booking}
                  index={index}
                  onPress={() => handleBookingPress(booking.id)}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
