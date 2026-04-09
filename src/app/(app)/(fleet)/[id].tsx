import React, { useState } from 'react';
import { Dimensions, FlatList, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  ChevronLeft,
  Heart,
  Car,
  Users,
  Cog,
  Fuel,
  CheckCircle,
  FileText,
  ClipboardList,
  ImageIcon,
  Film,
} from 'lucide-react-native';

import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Text } from '@/components/ui/Text';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Avatar } from '@/components/ui/Avatar';
import { IconButton } from '@/components/ui/IconButton';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { VideoPlayer } from '@/components/vehicle/VideoPlayer';
import { useTheme } from '@/hooks/useTheme';
import { mockVehicles } from '@/data/vehicles';
import { getVehicleImage } from '@/data/vehicleImages';
import type { Vehicle, FuelType, DamageRecord } from '@/types/vehicle';

type TabKey = 'overview' | 'damages' | 'rentals' | 'documents';
type MediaTab = 'photos' | 'video';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'damages', label: 'Damages' },
  { key: 'rentals', label: 'Rentals' },
  { key: 'documents', label: 'Documents' },
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const HERO_HEIGHT = SCREEN_WIDTH * 0.65;

function formatMileage(km: number): string {
  return km.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' km';
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function fuelLabel(fuel: FuelType): string {
  const map: Record<FuelType, string> = {
    gasoline: 'Essence',
    diesel: 'Diesel',
    electric: 'Electric',
    hybrid: 'Hybrid',
    'plug-in-hybrid': 'Plug-in Hybrid',
  };
  return map[fuel];
}

function severityVariant(severity: DamageRecord['severity']): 'info' | 'warning' | 'danger' {
  const map: Record<DamageRecord['severity'], 'info' | 'warning' | 'danger'> = {
    minor: 'info',
    moderate: 'warning',
    severe: 'danger',
  };
  return map[severity];
}

function daysBetween(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.max(0, Math.round((e - s) / (1000 * 60 * 60 * 24)));
}

function daysSince(start: string): number {
  const s = new Date(start).getTime();
  const now = Date.now();
  return Math.max(0, Math.round((now - s) / (1000 * 60 * 60 * 24)));
}

// ── Photo Carousel ──────────────────────────────────────────────────────────

function PhotoCarousel({ vehicle, theme }: { vehicle: Vehicle; theme: ReturnType<typeof useTheme> }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasLocalPhotos = vehicle.media.photos.length > 0;

  if (hasLocalPhotos) {
    return (
      <View>
        <FlatList
          data={vehicle.media.photos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setActiveIndex(idx);
          }}
          renderItem={({ item }) => (
            <Image
              source={item as string}
              style={{ width: SCREEN_WIDTH, height: HERO_HEIGHT }}
              contentFit="cover"
              transition={300}
            />
          )}
          keyExtractor={(_, i) => `photo-${i}`}
        />
        {/* Page dots */}
        {vehicle.media.photos.length > 1 && (
          <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5">
            {vehicle.media.photos.map((_, i) => (
              <View
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: i === activeIndex ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </View>
        )}
      </View>
    );
  }

  // Fallback to local asset thumbnail
  const fallbackImage = getVehicleImage(vehicle.id);
  if (fallbackImage) {
    return (
      <Image
        source={fallbackImage}
        style={{ width: '100%', height: HERO_HEIGHT }}
        contentFit="cover"
        transition={300}
      />
    );
  }

  return (
    <View className="flex-1 items-center justify-center" style={{ height: HERO_HEIGHT }}>
      <Car size={48} color={theme.textTertiary} />
      <Text variant="titleLarge" color={theme.textTertiary} className="mt-3">
        {vehicle.brand}
      </Text>
    </View>
  );
}

// ── Main Screen ─────────────────────────────────────────────────────────────

export default function VehicleDetailScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const vehicle = mockVehicles.find((v) => v.id === id);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [mediaTab, setMediaTab] = useState<MediaTab>('photos');

  if (!vehicle) {
    return (
      <ScreenWrapper scroll>
        <View className="flex-1 items-center justify-center py-20">
          <EmptyState
            icon={Car}
            title="Vehicle not found"
            subtitle="The vehicle you are looking for does not exist."
            actionLabel={t('common.back')}
            onAction={() => router.back()}
          />
        </View>
      </ScreenWrapper>
    );
  }

  const hasVideo = vehicle.media.hasVideo;
  const currentRental =
    vehicle.status === 'rented' && vehicle.rentalHistory.length > 0
      ? vehicle.rentalHistory[0]
      : null;

  const photoCount = vehicle.media.photos.length || 1;
  const videoCount = vehicle.media.videos.length;
  const mediaBadgeText = hasVideo
    ? `${photoCount} Photos · ${videoCount} Video`
    : `${photoCount} Photos`;

  return (
    <ScreenWrapper padded={false} scroll>
      {/* ================================================================
          1. HERO MEDIA SECTION
          ================================================================ */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <View
          style={{ backgroundColor: theme.surfaceTertiary, height: HERO_HEIGHT }}
          className="overflow-hidden"
        >
          {mediaTab === 'photos' ? (
            <PhotoCarousel vehicle={vehicle} theme={theme} />
          ) : (
            <VideoPlayer
              source={vehicle.media.videos[0]}
              posterSource={vehicle.media.thumbnail ?? undefined}
            />
          )}
        </View>

        {/* Back button overlay */}
        <Pressable
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={{ backgroundColor: theme.surfaceTertiary, opacity: 0.9 }}
          className="absolute top-12 left-4 w-10 h-10 rounded-full items-center justify-center"
        >
          <ChevronLeft size={22} color={theme.textPrimary} />
        </Pressable>

        {/* Favorite button overlay */}
        <View className="absolute top-12 right-4">
          <IconButton icon={Heart} variant="ghost" color={theme.textPrimary} />
        </View>

        {/* Media count badge */}
        <View
          className="absolute top-12 right-16 rounded-full px-3 py-1"
          style={{ backgroundColor: 'rgba(124, 58, 237, 0.85)' }}
        >
          <Text variant="caption" color="#FFFFFF">
            {mediaBadgeText}
          </Text>
        </View>

        {/* Gradient fade */}
        <View
          style={{ backgroundColor: theme.background }}
          className="h-6 -mt-6"
        />
      </Animated.View>

      {/* ================================================================
          1b. PHOTO/VIDEO TAB SWITCHER (only if vehicle has video)
          ================================================================ */}
      {hasVideo && (
        <Animated.View entering={FadeInDown.duration(400).delay(50)} className="px-4 mt-2">
          <View
            className="flex-row rounded-full p-1"
            style={{ backgroundColor: theme.surfaceTertiary }}
          >
            <Pressable
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setMediaTab('photos');
              }}
              className="flex-1 flex-row items-center justify-center py-2 rounded-full gap-1.5"
              style={{
                backgroundColor: mediaTab === 'photos' ? theme.surface : 'transparent',
              }}
            >
              <ImageIcon
                size={16}
                color={mediaTab === 'photos' ? theme.accent : theme.textTertiary}
              />
              <Text
                variant="titleSmall"
                color={mediaTab === 'photos' ? theme.accent : theme.textTertiary}
              >
                Photos
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setMediaTab('video');
              }}
              className="flex-1 flex-row items-center justify-center py-2 rounded-full gap-1.5"
              style={{
                backgroundColor: mediaTab === 'video' ? theme.surface : 'transparent',
              }}
            >
              <Film
                size={16}
                color={mediaTab === 'video' ? theme.accent : theme.textTertiary}
              />
              <Text
                variant="titleSmall"
                color={mediaTab === 'video' ? theme.accent : theme.textTertiary}
              >
                Interior Video
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* ================================================================
          2. VEHICLE INFO HEADER
          ================================================================ */}
      <Animated.View entering={FadeInDown.duration(400).delay(100)} className="px-4 mt-4">
        <Text variant="displayMedium">{vehicle.name}</Text>
        <Text variant="bodyMedium" color={theme.textSecondary} className="mt-1">
          {vehicle.brand} {'\u00B7'} {vehicle.year}
        </Text>
        <StatusBadge status={vehicle.status} size="md" className="mt-2" />
        <Text variant="headlineMedium" color={theme.accent} className="mt-2">
          CHF {vehicle.dailyRate} /day
        </Text>
      </Animated.View>

      {/* ================================================================
          3. QUICK SPECS ROW
          ================================================================ */}
      <Animated.View entering={FadeInDown.duration(400).delay(200)} className="px-4 mt-6">
        <View className="flex-row gap-3">
          {([
            { icon: Users, value: String(vehicle.seats), label: 'Seats' },
            { icon: Cog, value: capitalize(vehicle.transmission), label: 'Gearbox' },
            { icon: Fuel, value: fuelLabel(vehicle.fuelType), label: 'Fuel' },
            { icon: Car, value: vehicle.category, label: 'Type' },
          ] as const).map((spec) => {
            const Icon = spec.icon;
            return (
              <View
                key={spec.label}
                style={{ backgroundColor: theme.surfaceTertiary }}
                className="flex-1 rounded-xl py-3 items-center"
              >
                <Icon size={18} color={theme.textSecondary} />
                <Text variant="titleMedium" className="mt-1" numberOfLines={1}>
                  {spec.value}
                </Text>
                <Text variant="caption" color={theme.textTertiary}>
                  {spec.label}
                </Text>
              </View>
            );
          })}
        </View>
      </Animated.View>

      {/* ================================================================
          4. ACTION BUTTONS
          ================================================================ */}
      <Animated.View entering={FadeInDown.duration(400).delay(300)} className="px-4 mt-6">
        {vehicle.status === 'available' && (
          <View className="flex-row gap-3">
            <Button variant="primary" className="flex-1">
              Book Now
            </Button>
            <Button variant="secondary" className="flex-1">
              Inspect
            </Button>
          </View>
        )}

        {vehicle.status === 'rented' && (
          <>
            <Button variant="primary" disabled fullWidth>
              Currently Rented
            </Button>

            {currentRental && (
              <Card variant="default" padding="md" className="mt-4">
                <View className="flex-row items-center">
                  <Avatar name={currentRental.clientName} size="md" />
                  <View className="ml-3 flex-1">
                    <Text variant="titleMedium">{currentRental.clientName}</Text>
                    <Text variant="bodySmall" color={theme.textSecondary}>
                      {currentRental.startDate} {'\u2192'} {currentRental.endDate}
                    </Text>
                  </View>
                </View>
                <View className="mt-3">
                  <ProgressBar
                    progress={Math.min(
                      1,
                      daysSince(currentRental.startDate) /
                        daysBetween(currentRental.startDate, currentRental.endDate),
                    )}
                    label={`${daysSince(currentRental.startDate)} / ${daysBetween(currentRental.startDate, currentRental.endDate)} days`}
                    showPercentage
                  />
                </View>
                <Pressable className="mt-3">
                  <Text variant="bodySmall" color={theme.accent}>
                    View Booking
                  </Text>
                </Pressable>
              </Card>
            )}
          </>
        )}

        {vehicle.status === 'maintenance' && (
          <Button variant="danger" disabled fullWidth>
            In Maintenance
          </Button>
        )}

        {vehicle.status === 'reserved' && (
          <Button variant="secondary" disabled fullWidth>
            Reserved
          </Button>
        )}
      </Animated.View>

      {/* ================================================================
          5. TAB SELECTOR
          ================================================================ */}
      <Animated.View entering={FadeInDown.duration(400).delay(400)} className="px-4 mt-6">
        <View className="flex-row">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab(tab.key);
                }}
                className="flex-1 items-center pb-3"
                style={{
                  borderBottomWidth: 2,
                  borderBottomColor: isActive ? theme.accent : 'transparent',
                }}
              >
                <Text
                  variant="titleMedium"
                  color={isActive ? theme.accent : theme.textTertiary}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      {/* ================================================================
          6. TAB CONTENT
          ================================================================ */}
      <Animated.View entering={FadeInDown.duration(400).delay(500)} className="px-4 mt-4 pb-8">
        {activeTab === 'overview' && (
          <OverviewTab vehicle={vehicle} theme={theme} />
        )}
        {activeTab === 'damages' && (
          <DamagesTab vehicle={vehicle} theme={theme} />
        )}
        {activeTab === 'rentals' && (
          <RentalsTab vehicle={vehicle} theme={theme} />
        )}
        {activeTab === 'documents' && (
          <DocumentsTab />
        )}
      </Animated.View>
    </ScreenWrapper>
  );
}

/* ====================================================================
   OVERVIEW TAB
   ==================================================================== */
interface TabProps {
  vehicle: Vehicle;
  theme: ReturnType<typeof useTheme>;
}

function OverviewTab({ vehicle, theme }: TabProps) {
  const specs: { label: string; value: string }[] = [
    { label: 'License Plate', value: vehicle.licensePlate },
    { label: 'Color', value: vehicle.color },
    { label: 'Year', value: String(vehicle.year) },
    { label: 'Mileage', value: formatMileage(vehicle.mileage) },
    { label: 'Fuel', value: fuelLabel(vehicle.fuelType) },
    { label: 'Transmission', value: capitalize(vehicle.transmission) },
    { label: 'Seats', value: String(vehicle.seats) },
    { label: 'Category', value: vehicle.category },
  ];

  return (
    <View>
      {specs.map((spec, index) => (
        <View key={spec.label}>
          <View className="flex-row justify-between py-3">
            <Text variant="bodyMedium" color={theme.textSecondary}>
              {spec.label}
            </Text>
            <Text variant="titleMedium">{spec.value}</Text>
          </View>
          {index < specs.length - 1 && <Divider />}
        </View>
      ))}

      {vehicle.features.length > 0 && (
        <View className="mt-6">
          <Text variant="headlineSmall" className="mb-3">
            Features
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {vehicle.features.map((feature) => (
              <Badge key={feature} variant="accent" size="md">
                {feature}
              </Badge>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

/* ====================================================================
   DAMAGES TAB
   ==================================================================== */
function DamagesTab({ vehicle, theme }: TabProps) {
  if (vehicle.damageRecords.length === 0) {
    return (
      <View className="py-12">
        <EmptyState
          icon={CheckCircle}
          title="No damage recorded"
          subtitle="This vehicle has no reported damages."
        />
      </View>
    );
  }

  return (
    <View>
      {vehicle.damageRecords.map((damage) => (
        <Card key={damage.id} variant="default" padding="md" className="mb-3">
          <View className="flex-row items-center justify-between">
            <Text variant="bodySmall" color={theme.textSecondary}>
              {damage.date}
            </Text>
            <Badge variant={severityVariant(damage.severity)} size="sm">
              {capitalize(damage.severity)}
            </Badge>
          </View>
          <Text variant="titleMedium" className="mt-2">
            {capitalize(damage.type)}
          </Text>
          <Text variant="bodySmall" color={theme.textSecondary} className="mt-1">
            {damage.description}
          </Text>
          <View className="flex-row items-center mt-2">
            {damage.resolved ? (
              <>
                <CheckCircle size={14} color={theme.success} />
                <Text variant="bodySmall" color={theme.success} className="ml-1">
                  Resolved
                </Text>
              </>
            ) : (
              <>
                <Badge variant="danger" dot size="sm" />
                <Text variant="bodySmall" color={theme.danger} className="ml-2">
                  Unresolved
                </Text>
              </>
            )}
          </View>
        </Card>
      ))}
    </View>
  );
}

/* ====================================================================
   RENTALS TAB
   ==================================================================== */
function RentalsTab({ vehicle, theme }: TabProps) {
  const totalRevenue = vehicle.rentalHistory.reduce((sum, r) => sum + r.revenue, 0);

  if (vehicle.rentalHistory.length === 0) {
    return (
      <View className="py-12">
        <EmptyState
          icon={ClipboardList}
          title="No rental history"
          subtitle="This vehicle has not been rented yet."
        />
      </View>
    );
  }

  return (
    <View>
      {/* Summary card */}
      <Card variant="default" padding="md" className="mb-4">
        <Text variant="titleMedium" color={theme.textSecondary}>
          Total Rentals: {vehicle.rentalHistory.length} {'\u00B7'} Revenue: CHF {totalRevenue.toLocaleString('fr-FR')}
        </Text>
      </Card>

      {/* Rental list */}
      {vehicle.rentalHistory.map((rental) => (
        <Card key={rental.id} variant="default" padding="md" className="mb-3">
          <View className="flex-row items-center justify-between">
            <Text variant="titleMedium">{rental.clientName}</Text>
            <Text variant="titleMedium" color={theme.accent}>
              CHF {rental.revenue}
            </Text>
          </View>
          <View className="flex-row items-center justify-between mt-1">
            <Text variant="bodySmall" color={theme.textSecondary}>
              {rental.startDate} {'\u2192'} {rental.endDate}
            </Text>
            <Text variant="bodySmall" color={theme.textTertiary}>
              {rental.duration} days
            </Text>
          </View>
        </Card>
      ))}
    </View>
  );
}

/* ====================================================================
   DOCUMENTS TAB
   ==================================================================== */
function DocumentsTab() {
  return (
    <View className="py-12">
      <EmptyState
        icon={FileText}
        title="No documents uploaded"
        subtitle="Vehicle documents will appear here."
      />
    </View>
  );
}
