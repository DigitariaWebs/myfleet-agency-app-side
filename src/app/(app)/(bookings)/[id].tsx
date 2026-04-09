import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  ChevronLeft,
  Car,
  Phone,
  Mail,
  MapPin,
  Clock,
  Calendar,
  CalendarCheck,
  CalendarX,
  FileText,
  ArrowRight,
  RefreshCw,
  ClipboardList,
  CreditCard,
  Copy,
  MessageCircle,
  Send,
  Shield,
  ShieldCheck,
  Timer,
} from 'lucide-react-native';

import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Avatar } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { useToastStore } from '@/components/ui/Toast';
import { useBookingStore } from '@/stores/useBookingStore';
import type { Booking, BookingStatus, TimelineStep } from '@/types/booking';
import { mockClients } from '@/data/clients';

// ── Helpers ─────────────────────────────────────────────────────────────────

function daysBetween(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)));
}

function daysElapsed(start: string): number {
  const s = new Date(start).getTime();
  const now = Date.now();
  return Math.max(0, Math.round((now - s) / (1000 * 60 * 60 * 24)));
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function statusBadgeVariant(
  status: BookingStatus,
): 'success' | 'info' | 'warning' | 'neutral' | 'danger' {
  const map: Record<BookingStatus, 'success' | 'info' | 'warning' | 'neutral' | 'danger'> = {
    active: 'success',
    confirmed: 'info',
    pending: 'warning',
    completed: 'neutral',
    cancelled: 'danger',
  };
  return map[status];
}

function statusStripColor(
  status: BookingStatus,
  theme: ReturnType<typeof useTheme>,
): string {
  const map: Record<BookingStatus, string> = {
    active: theme.success,
    confirmed: theme.info,
    pending: theme.warning,
    completed: theme.textTertiary,
    cancelled: theme.danger,
  };
  return map[status];
}

function statusLabel(status: BookingStatus): string {
  const map: Record<BookingStatus, string> = {
    active: 'Active',
    confirmed: 'Confirmed',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return map[status];
}

function buildTimeline(booking: Booking): TimelineStep[] {
  const { status, createdAt } = booking;

  const isConfirmedOrLater =
    status === 'confirmed' || status === 'active' || status === 'completed';
  const isActiveOrLater = status === 'active' || status === 'completed';
  const isCompleted = status === 'completed';

  return [
    {
      key: 'created',
      label: 'Created',
      date: createdAt,
      completed: true,
      active: false,
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      date: isConfirmedOrLater ? createdAt : null,
      completed: isConfirmedOrLater,
      active: status === 'confirmed',
    },
    {
      key: 'picked_up',
      label: 'Vehicle Picked Up',
      date: isActiveOrLater ? booking.startDate : null,
      completed: isActiveOrLater,
      active: false,
    },
    {
      key: 'in_progress',
      label: 'In Progress',
      date: isActiveOrLater ? booking.startDate : null,
      completed: isCompleted,
      active: status === 'active',
    },
    {
      key: 'returned',
      label: 'Returned',
      date: isCompleted ? booking.endDate : null,
      completed: isCompleted,
      active: false,
    },
    {
      key: 'closed',
      label: 'Closed',
      date: isCompleted ? booking.endDate : null,
      completed: isCompleted,
      active: false,
    },
  ];
}

// ── Main Screen ─────────────────────────────────────────────────────────────

export default function BookingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const showToast = useToastStore((s) => s.show);

  const bookings = useBookingStore((s) => s.bookings);
  const booking = bookings.find((b) => b.id === id);

  if (!booking) {
    return (
      <ScreenWrapper scroll>
        <View className="flex-1 items-center justify-center py-20">
          <EmptyState
            icon={ClipboardList}
            title={t('bookings.detail.notFound', 'Booking not found')}
            subtitle={t(
              'bookings.detail.notFoundDesc',
              'The booking you are looking for does not exist.',
            )}
            actionLabel={t('common.back', 'Back')}
            onAction={() => router.back()}
          />
        </View>
      </ScreenWrapper>
    );
  }

  const client = mockClients.find((c) => c.id === booking.clientId);
  const totalDays = daysBetween(booking.startDate, booking.endDate);
  const elapsed = daysElapsed(booking.startDate);
  const remaining = Math.max(0, totalDays - elapsed);
  const timeline = buildTimeline(booking);

  const enabledOptions = booking.options.filter((o) => o.enabled);
  const subtotal = booking.dailyRate * totalDays;
  const optionsTotal = enabledOptions.reduce((s, o) => s + o.price * totalDays, 0);
  const total = subtotal + optionsTotal;

  return (
    <ScreenWrapper scroll>
      {/* ── Header ──────────────────────────────────────────────── */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="flex-row items-center pt-4 pb-2"
      >
        <Pressable onPress={() => router.back()} className="mr-3 p-1">
          <ChevronLeft size={24} color={theme.textPrimary} />
        </Pressable>
        <Text variant="headlineLarge">
          {t('bookings.detail.title', 'Booking Details')}
        </Text>
      </Animated.View>

      {/* ── Status Banner ───────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(400).delay(80)} className="mt-4">
        <View
          style={{ backgroundColor: theme.surface }}
          className="rounded-2xl overflow-hidden flex-row"
        >
          <View
            style={{
              width: 4,
              backgroundColor: statusStripColor(booking.status, theme),
            }}
          />
          <View className="flex-1 p-4">
            <View className="flex-row items-center justify-between">
              <Text variant="titleLarge">{statusLabel(booking.status)}</Text>
              <Badge variant={statusBadgeVariant(booking.status)} size="md">
                {statusLabel(booking.status)}
              </Badge>
            </View>
            <Text variant="bodySmall" color={theme.textTertiary} className="mt-1">
              #{booking.id}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* ── Vehicle Card ────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(400).delay(160)} className="mt-4">
        <View
          style={{ backgroundColor: theme.surface }}
          className="rounded-2xl p-4 flex-row items-center"
        >
          <View
            style={{ backgroundColor: theme.surfaceTertiary }}
            className="w-[60px] h-[60px] rounded-xl items-center justify-center"
          >
            <Car size={28} color={theme.textTertiary} />
          </View>
          <View className="ml-4 flex-1">
            <Text variant="titleLarge">{booking.vehicleName}</Text>
            <Text variant="bodySmall" color={theme.textSecondary} className="mt-1">
              ID: {booking.vehicleId}
            </Text>
            <Text variant="bodySmall" color={theme.accent} className="mt-1">
              {'\u20AC'}{booking.dailyRate}/day
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* ── Client Card ─────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(400).delay(240)} className="mt-4">
        <View
          style={{ backgroundColor: theme.surface }}
          className="rounded-2xl p-4"
        >
          <View className="flex-row items-center">
            <Avatar name={booking.clientName} size="md" />
            <View className="ml-3 flex-1">
              <Text variant="titleMedium">{booking.clientName}</Text>
              {client?.phone ? (
                <Text variant="bodySmall" color={theme.textSecondary} className="mt-1">
                  {client.phone}
                </Text>
              ) : null}
              {client?.email ? (
                <Text variant="bodySmall" color={theme.textSecondary}>
                  {client.email}
                </Text>
              ) : null}
            </View>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  showToast({
                    variant: 'info',
                    title: t('bookings.detail.callSimulated', 'Call simulated'),
                    message: client?.phone ?? booking.clientName,
                  });
                }}
                style={{ backgroundColor: theme.surfaceTertiary }}
                className="w-10 h-10 rounded-full items-center justify-center"
              >
                <Phone size={18} color={theme.accent} />
              </Pressable>
              <Pressable
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  showToast({
                    variant: 'info',
                    title: t('bookings.detail.emailSimulated', 'Email simulated'),
                    message: client?.email ?? booking.clientName,
                  });
                }}
                style={{ backgroundColor: theme.surfaceTertiary }}
                className="w-10 h-10 rounded-full items-center justify-center"
              >
                <Mail size={18} color={theme.accent} />
              </Pressable>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* ── Dates & Duration ────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(400).delay(320)} className="mt-4">
        <View
          style={{ backgroundColor: theme.surface }}
          className="rounded-2xl p-4"
        >
          {/* Start / End */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text variant="bodySmall" color={theme.textTertiary}>
                {t('bookings.detail.startDate', 'Start')}
              </Text>
              <Text variant="titleMedium" className="mt-1">
                {formatDate(booking.startDate)}
              </Text>
            </View>
            <ArrowRight size={18} color={theme.textTertiary} />
            <View className="flex-1 items-end">
              <Text variant="bodySmall" color={theme.textTertiary}>
                {t('bookings.detail.endDate', 'End')}
              </Text>
              <Text variant="titleMedium" className="mt-1">
                {formatDate(booking.endDate)}
              </Text>
            </View>
          </View>

          {/* Duration badge */}
          <View className="mt-3 items-center">
            <Badge variant="accent" size="lg">
              {totalDays} {t('bookings.detail.days', 'days')}
            </Badge>
          </View>

          <Divider className="my-3" />

          {/* Pickup / Return details */}
          <View className="flex-row items-start mt-1">
            <Clock size={14} color={theme.textSecondary} />
            <Text variant="bodySmall" color={theme.textSecondary} className="ml-2">
              {t('bookings.detail.pickup', 'Pickup')}: {booking.pickupTime}
            </Text>
          </View>
          <View className="flex-row items-start mt-2">
            <Clock size={14} color={theme.textSecondary} />
            <Text variant="bodySmall" color={theme.textSecondary} className="ml-2">
              {t('bookings.detail.return', 'Return')}: {booking.returnTime}
            </Text>
          </View>
          <View className="flex-row items-start mt-2">
            <MapPin size={14} color={theme.textSecondary} />
            <Text variant="bodySmall" color={theme.textSecondary} className="ml-2">
              {booking.pickupLocation}
            </Text>
          </View>
          {booking.returnLocation !== booking.pickupLocation && (
            <View className="flex-row items-start mt-2">
              <MapPin size={14} color={theme.textSecondary} />
              <Text variant="bodySmall" color={theme.textSecondary} className="ml-2">
                {booking.returnLocation}
              </Text>
            </View>
          )}

          {/* Active countdown */}
          {booking.status === 'active' && (
            <View className="mt-4">
              <Text variant="bodySmall" color={theme.textSecondary} className="mb-1">
                {remaining} {t('bookings.detail.daysRemaining', 'days remaining')}
              </Text>
              <ProgressBar
                progress={Math.min(1, elapsed / totalDays)}
                label={`${elapsed} / ${totalDays} ${t('bookings.detail.days', 'days')}`}
                showPercentage
                color={theme.accent}
              />
            </View>
          )}
        </View>
      </Animated.View>

      {/* ── Status Timeline ─────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(400).delay(400)} className="mt-4">
        <View
          style={{ backgroundColor: theme.surface }}
          className="rounded-2xl p-4"
        >
          <Text variant="headlineSmall" className="mb-4">
            {t('bookings.detail.timeline', 'Timeline')}
          </Text>
          {timeline.map((step, index) => {
            const isLast = index === timeline.length - 1;
            const dotColor = step.completed
              ? theme.success
              : step.active
                ? theme.accent
                : theme.border;
            const dotBorderOnly = !step.completed && !step.active;

            return (
              <View key={step.key} className="flex-row">
                {/* Dot + Line column */}
                <View className="items-center" style={{ width: 24 }}>
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: dotBorderOnly ? 'transparent' : dotColor,
                      borderWidth: dotBorderOnly ? 2 : 0,
                      borderColor: dotBorderOnly ? theme.border : 'transparent',
                    }}
                  />
                  {!isLast && (
                    <View
                      style={{
                        width: 2,
                        flex: 1,
                        backgroundColor: step.completed ? theme.success : theme.border,
                      }}
                    />
                  )}
                </View>

                {/* Label + date */}
                <View className="ml-3 pb-5 flex-1">
                  <Text
                    variant="titleMedium"
                    color={
                      step.completed
                        ? theme.textPrimary
                        : step.active
                          ? theme.accent
                          : theme.textTertiary
                    }
                  >
                    {step.label}
                  </Text>
                  {step.date ? (
                    <Text variant="bodySmall" color={theme.textTertiary} className="mt-1">
                      {formatDate(step.date)}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      </Animated.View>

      {/* ── Pricing ─────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(400).delay(480)} className="mt-4">
        <View
          style={{ backgroundColor: theme.surface }}
          className="rounded-2xl p-4"
        >
          <Text variant="headlineSmall" className="mb-3">
            {t('bookings.detail.pricing', 'Pricing')}
          </Text>

          {/* Daily rate x days */}
          <View className="flex-row justify-between mb-2">
            <Text variant="bodyMedium" color={theme.textSecondary}>
              {'\u20AC'}{booking.dailyRate} x {totalDays}{' '}
              {t('bookings.detail.days', 'days')}
            </Text>
            <Text variant="bodyMedium">
              {'\u20AC'}{subtotal.toLocaleString('fr-FR')}
            </Text>
          </View>

          {/* Options */}
          {enabledOptions.map((opt) => (
            <View key={opt.id} className="flex-row justify-between mb-2">
              <Text variant="bodyMedium" color={theme.textSecondary}>
                {opt.label} ({'\u20AC'}{opt.price}/day)
              </Text>
              <Text variant="bodyMedium">
                {'\u20AC'}{(opt.price * totalDays).toLocaleString('fr-FR')}
              </Text>
            </View>
          ))}

          <Divider className="my-3" />

          {/* Deposit */}
          <View className="flex-row justify-between mb-2">
            <Text variant="bodyMedium" color={theme.textSecondary}>
              {t('bookings.detail.deposit', 'Deposit')}
            </Text>
            <Text variant="bodyMedium">
              {'\u20AC'}{booking.deposit.toLocaleString('fr-FR')}
            </Text>
          </View>

          {/* Total */}
          <View className="flex-row justify-between mt-2">
            <Text variant="headlineMedium">
              {t('bookings.detail.total', 'Total')}
            </Text>
            <Text variant="headlineMedium" color={theme.accent}>
              {'\u20AC'}{total.toLocaleString('fr-FR')}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* ── Payment Section ──────────────────────────────────────── */}
      {booking.paymentStatus && (
        <Animated.View entering={FadeInDown.duration(400).delay(520)} className="mt-4">
          <View
            style={{ backgroundColor: theme.surface }}
            className="rounded-2xl p-4"
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <CreditCard size={20} color={theme.accent} strokeWidth={1.8} />
                <Text variant="headlineSmall" className="ml-2">
                  {t('booking.payment.title', 'Payment')}
                </Text>
              </View>
              <Badge
                variant={
                  booking.paymentStatus === 'paid'
                    ? 'success'
                    : booking.paymentStatus === 'expired' || booking.paymentStatus === 'failed'
                      ? 'danger'
                      : 'warning'
                }
                size="sm"
              >
                {t(`booking.payment.status.${booking.paymentStatus}`, booking.paymentStatus)}
              </Badge>
            </View>

            {booking.paymentLink && booking.paymentStatus === 'link_sent' && (
              <View>
                <View
                  className="rounded-xl p-3 mb-3"
                  style={{ backgroundColor: theme.surfaceTertiary }}
                >
                  <Text variant="bodySmall" color={theme.textSecondary} numberOfLines={1}>
                    {booking.paymentLink}
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      showToast({ variant: 'success', title: t('booking.payment.copyLink', 'Link copied') });
                    }}
                    className="flex-1 flex-row items-center justify-center rounded-full py-2.5"
                    style={{ backgroundColor: theme.surfaceTertiary }}
                  >
                    <Copy size={14} color={theme.textSecondary} />
                    <Text variant="titleSmall" color={theme.textSecondary} className="ml-1.5">
                      {t('booking.payment.copyLink', 'Copy')}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      showToast({ variant: 'info', title: t('booking.payment.sendWhatsApp', 'WhatsApp') });
                    }}
                    className="flex-1 flex-row items-center justify-center rounded-full py-2.5"
                    style={{ backgroundColor: theme.surfaceTertiary }}
                  >
                    <MessageCircle size={14} color={theme.textSecondary} />
                    <Text variant="titleSmall" color={theme.textSecondary} className="ml-1.5">
                      WhatsApp
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      showToast({ variant: 'info', title: t('booking.payment.sendEmail', 'Email') });
                    }}
                    className="flex-1 flex-row items-center justify-center rounded-full py-2.5"
                    style={{ backgroundColor: theme.surfaceTertiary }}
                  >
                    <Send size={14} color={theme.textSecondary} />
                    <Text variant="titleSmall" color={theme.textSecondary} className="ml-1.5">
                      Email
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {booking.paymentStatus === 'expired' && (
              <Button
                variant="primary"
                fullWidth
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  showToast({ variant: 'success', title: t('booking.payment.resend', 'Payment link resent') });
                }}
              >
                {t('booking.payment.resend', 'Resend Payment Link')}
              </Button>
            )}

            {booking.autoCancelAt && booking.paymentStatus !== 'paid' && (
              <View className="flex-row items-center mt-3 rounded-xl px-3 py-2" style={{ backgroundColor: theme.warningSoft }}>
                <Timer size={14} color={theme.warning} />
                <Text variant="bodySmall" color={theme.warning} className="ml-2">
                  {t('booking.autoCancelIn', { defaultValue: 'Auto-cancels in {{time}}', time: 'soon' })}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      )}

      {/* ── Insurance Section ────────────────────────────────────── */}
      {booking.insurance && (
        <Animated.View entering={FadeInDown.duration(400).delay(540)} className="mt-4">
          <View
            style={{ backgroundColor: theme.surface }}
            className="rounded-2xl p-4"
          >
            <View className="flex-row items-center mb-3">
              {booking.insurance.tier === 'all_inclusive' ? (
                <ShieldCheck size={20} color={theme.accent} strokeWidth={1.8} />
              ) : (
                <Shield size={20} color={theme.textSecondary} strokeWidth={1.8} />
              )}
              <Text variant="headlineSmall" className="ml-2">
                {t('insurance.title', 'Insurance')}
              </Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text variant="bodyMedium" color={theme.textSecondary}>
                {booking.insurance.tier === 'all_inclusive'
                  ? t('insurance.allInclusive.title', 'All-Inclusive')
                  : t('insurance.basic.title', 'Basic Insurance')}
              </Text>
              <Badge
                variant={booking.insurance.tier === 'all_inclusive' ? 'accent' : 'success'}
                size="sm"
              >
                {booking.insurance.tier === 'all_inclusive'
                  ? `CHF ${booking.insurance.totalCost}`
                  : t('insurance.basic.included', 'Included')}
              </Badge>
            </View>
            <Text variant="bodySmall" color={theme.textTertiary}>
              Excess: CHF {booking.insurance.excess.toLocaleString('fr-FR')}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* ── Action Buttons ──────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(400).delay(560)} className="mt-6">
        <ActionButtons
          booking={booking}
          theme={theme}
          router={router}
          showToast={showToast}
          t={t}
        />
      </Animated.View>

      {/* ── Notes ───────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(400).delay(640)} className="mt-4 mb-8">
        <View
          style={{ backgroundColor: theme.surface }}
          className="rounded-2xl p-4"
        >
          <Text variant="headlineSmall" className="mb-2">
            {t('bookings.detail.notes', 'Notes')}
          </Text>
          {booking.notes ? (
            <Text variant="bodyMedium" color={theme.textSecondary}>
              {booking.notes}
            </Text>
          ) : (
            <Text variant="bodyMedium" color={theme.textTertiary}>
              {t('bookings.detail.noNotes', 'No notes')}
            </Text>
          )}
        </View>
      </Animated.View>
    </ScreenWrapper>
  );
}

// ── Action Buttons Component ────────────────────────────────────────────────

type ShowToastFn = (toast: {
  variant: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}) => void;

interface ActionButtonsProps {
  booking: Booking;
  theme: ReturnType<typeof useTheme>;
  router: ReturnType<typeof useRouter>;
  showToast: ShowToastFn;
  t: ReturnType<typeof useTranslation>['t'];
}

function ActionButtons({ booking, theme, router, showToast, t }: ActionButtonsProps) {
  const handleCancel = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    useBookingStore.getState().cancelBooking(booking.id);
    showToast({
      variant: 'success',
      title: t('bookings.detail.cancelled', 'Booking cancelled'),
      message: t('bookings.detail.cancelledMsg', 'The booking has been cancelled.'),
    });
  };

  switch (booking.status) {
    case 'pending':
      return (
        <View className="gap-3">
          <Button
            variant="primary"
            fullWidth
            leftIcon={CalendarCheck}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              useBookingStore.getState().updateBookingStatus(booking.id, 'confirmed');
              showToast({
                variant: 'success',
                title: t('bookings.detail.confirmed', 'Booking confirmed'),
              });
            }}
          >
            {t('bookings.detail.confirm', 'Confirm')}
          </Button>
          <Button
            variant="danger"
            fullWidth
            leftIcon={CalendarX}
            onPress={handleCancel}
          >
            {t('bookings.detail.cancel', 'Cancel')}
          </Button>
        </View>
      );

    case 'confirmed':
      return (
        <View className="gap-3">
          <Button
            variant="primary"
            fullWidth
            leftIcon={Car}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push(`/(app)/(bookings)/pickup/${booking.id}` as never);
            }}
          >
            {t('pickup.title', 'Start Pickup')}
          </Button>
          <Button
            variant="danger"
            fullWidth
            leftIcon={CalendarX}
            onPress={handleCancel}
          >
            {t('bookings.detail.cancel', 'Cancel')}
          </Button>
        </View>
      );

    case 'active':
      return (
        <View className="gap-3">
          <Button
            variant="primary"
            fullWidth
            leftIcon={ClipboardList}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push(`/(app)/(bookings)/return/${booking.id}` as never);
            }}
          >
            {t('return.title', 'Start Return')}
          </Button>
          <Button
            variant="secondary"
            fullWidth
            leftIcon={Calendar}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              showToast({
                variant: 'info',
                title: t('bookings.detail.extendRental', 'Extend Rental'),
                message: t(
                  'bookings.detail.extendRentalMsg',
                  'Rental extension will be available soon.',
                ),
              });
            }}
          >
            {t('bookings.detail.extendRental', 'Extend Rental')}
          </Button>
        </View>
      );

    case 'completed':
      return (
        <View className="gap-3">
          <Button
            variant="primary"
            fullWidth
            leftIcon={FileText}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              showToast({
                variant: 'info',
                title: t('bookings.detail.viewInvoice', 'View Invoice'),
                message: t(
                  'bookings.detail.viewInvoiceMsg',
                  'Invoice viewer will be available soon.',
                ),
              });
            }}
          >
            {t('bookings.detail.viewInvoice', 'View Invoice')}
          </Button>
          <Button
            variant="secondary"
            fullWidth
            leftIcon={ClipboardList}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              showToast({
                variant: 'info',
                title: t('bookings.detail.viewInspection', 'View Inspection'),
                message: t(
                  'bookings.detail.viewInspectionMsg',
                  'Inspection viewer will be available soon.',
                ),
              });
            }}
          >
            {t('bookings.detail.viewInspection', 'View Inspection')}
          </Button>
        </View>
      );

    case 'cancelled':
      return (
        <View className="gap-3">
          <Button
            variant="primary"
            fullWidth
            leftIcon={RefreshCw}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              showToast({
                variant: 'info',
                title: t('bookings.detail.rebook', 'Rebook'),
                message: t(
                  'bookings.detail.rebookMsg',
                  'Rebooking will be available soon.',
                ),
              });
            }}
          >
            {t('bookings.detail.rebook', 'Rebook')}
          </Button>
        </View>
      );

    default:
      return null;
  }
}
