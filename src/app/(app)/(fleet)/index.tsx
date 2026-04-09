import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Pressable,
  FlatList,
  RefreshControl,
  type ListRenderItemInfo,
} from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Car,
  Plus,
  LayoutGrid,
  List,
  ChevronRight,
  SearchX,
} from 'lucide-react-native';

import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Text } from '@/components/ui/Text';
import { SearchBar } from '@/components/ui/SearchBar';
import { Chip, ChipGroup } from '@/components/ui/Chip';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/useAuthStore';
import { mockVehicles } from '@/data/vehicles';
import { getVehicleImage } from '@/data/vehicleImages';
import { shadows } from '@/theme/shadows';
import type { Vehicle, VehicleStatus, VehicleBrand } from '@/types/vehicle';

// ── Helpers ──────────────────────────────────────────────────────────────────

const ALL_BRANDS = Array.from(
  new Set(mockVehicles.map((v) => v.brand)),
).sort() as VehicleBrand[];

const STATUS_OPTIONS: { label: string; value: VehicleStatus | null }[] = [
  { label: 'All', value: null },
  { label: 'Available', value: 'available' },
  { label: 'Rented', value: 'rented' },
  { label: 'Maintenance', value: 'maintenance' },
];

function countByStatus(status: VehicleStatus | null): number {
  if (status === null) return mockVehicles.length;
  return mockVehicles.filter((v) => v.status === status).length;
}

function countByBrand(brand: VehicleBrand | null): number {
  if (brand === null) return mockVehicles.length;
  return mockVehicles.filter((v) => v.brand === brand).length;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function FleetScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  // State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | null>(null);
  const [brandFilter, setBrandFilter] = useState<VehicleBrand | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshing, setRefreshing] = useState(false);

  // Filtering
  const filtered = useMemo(() => {
    return mockVehicles.filter((v) => {
      if (statusFilter && v.status !== statusFilter) return false;
      if (brandFilter && v.brand !== brandFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          v.name.toLowerCase().includes(q) ||
          v.brand.toLowerCase().includes(q) ||
          v.licensePlate.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [statusFilter, brandFilter, search]);

  // Handlers
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleToggleView = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'));
  }, []);

  const handleAddVehicle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to add vehicle screen (placeholder)
  }, []);

  const navigateToVehicle = useCallback(
    (id: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/(app)/(fleet)/${id}`);
    },
    [router],
  );

  // ── Grid Card ──────────────────────────────────────────────────────────────

  const renderGridCard = useCallback(
    ({ item, index }: ListRenderItemInfo<Vehicle>) => (
      <Animated.View
        entering={FadeInDown.delay(index * 50).duration(400)}
        className="flex-1"
        style={{ maxWidth: '50%' }}
      >
        <Pressable
          onPress={() => navigateToVehicle(item.id)}
          style={{ backgroundColor: theme.surface, ...shadows.sm }}
          className="rounded-2xl overflow-hidden m-1.5"
        >
          {/* Vehicle photo */}
          <View style={{ backgroundColor: theme.surfaceTertiary }} className="h-28 overflow-hidden">
            {getVehicleImage(item.id) ? (
              <Image
                source={getVehicleImage(item.id)!}
                style={{ width: '100%', height: 112 }}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Car size={36} color={theme.textTertiary} strokeWidth={1.5} />
              </View>
            )}
          </View>

          {/* Info */}
          <View className="p-3">
            <Text variant="titleMedium" numberOfLines={1}>
              {item.name}
            </Text>
            <Text
              variant="caption"
              color={theme.textTertiary}
              numberOfLines={1}
              className="mt-0.5"
            >
              {item.category}
            </Text>
            <View className="mt-2">
              <StatusBadge status={item.status} size="sm" />
            </View>
            <Text variant="bodySmall" color={theme.accent} className="mt-2">
              {'\u20AC'}{item.dailyRate}/day
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    ),
    [navigateToVehicle, theme],
  );

  // ── List Row ───────────────────────────────────────────────────────────────

  const renderListRow = useCallback(
    ({ item, index }: ListRenderItemInfo<Vehicle>) => (
      <Animated.View entering={FadeInDown.delay(index * 40).duration(350)}>
        <Pressable
          onPress={() => navigateToVehicle(item.id)}
          style={{ backgroundColor: theme.surface }}
          className="flex-row rounded-xl py-3 px-3 mb-2 items-center"
        >
          {/* Thumbnail */}
          <View
            style={{ backgroundColor: theme.surfaceTertiary, width: 64, height: 48 }}
            className="rounded-lg overflow-hidden"
          >
            {getVehicleImage(item.id) ? (
              <Image
                source={getVehicleImage(item.id)!}
                style={{ width: 64, height: 48 }}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Car size={24} color={theme.textTertiary} strokeWidth={1.5} />
              </View>
            )}
          </View>

          {/* Info */}
          <View className="flex-1 ml-3">
            <Text variant="titleMedium" numberOfLines={1}>
              {item.name}
            </Text>
            <Text
              variant="bodySmall"
              color={theme.textSecondary}
              numberOfLines={1}
              className="mt-0.5"
            >
              {item.brand} {'\u00B7'} {item.category}
            </Text>
          </View>

          {/* Right */}
          <View className="items-end ml-2">
            <StatusBadge status={item.status} size="sm" />
            <ChevronRight
              size={18}
              color={theme.textTertiary}
              style={{ marginTop: 8 }}
            />
          </View>
        </Pressable>
      </Animated.View>
    ),
    [navigateToVehicle, theme],
  );

  // ── Key extractor ──────────────────────────────────────────────────────────

  const keyExtractor = useCallback((item: Vehicle) => item.id, []);

  // ── Header Component ───────────────────────────────────────────────────────

  const ListHeader = useMemo(
    () => (
      <View>
        {/* Header row */}
        <View className="pt-6 pb-4 flex-row items-center justify-between">
          <Text variant="headlineLarge">{t('fleet.title')}</Text>
          <View className="flex-row items-center gap-2">
            <IconButton
              icon={viewMode === 'grid' ? List : LayoutGrid}
              variant="ghost"
              size="sm"
              onPress={handleToggleView}
            />
            {isAdmin && (
              <IconButton
                icon={Plus}
                variant="filled"
                size="sm"
                onPress={handleAddVehicle}
              />
            )}
          </View>
        </View>

        {/* Search */}
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t('fleet.searchPlaceholder', 'Search vehicles...')}
          className="mb-3"
        />

        {/* Status filter chips */}
        <ChipGroup className="mb-2">
          {STATUS_OPTIONS.map((opt) => (
            <Chip
              key={opt.label}
              label={`${opt.label} (${countByStatus(opt.value)})`}
              selected={statusFilter === opt.value}
              onPress={() => setStatusFilter(opt.value)}
            />
          ))}
        </ChipGroup>

        {/* Brand filter chips */}
        <ChipGroup className="mb-3">
          <Chip
            label={`All (${countByBrand(null)})`}
            selected={brandFilter === null}
            onPress={() => setBrandFilter(null)}
          />
          {ALL_BRANDS.map((brand) => (
            <Chip
              key={brand}
              label={`${brand} (${countByBrand(brand)})`}
              selected={brandFilter === brand}
              onPress={() => setBrandFilter(brand)}
            />
          ))}
        </ChipGroup>
      </View>
    ),
    [
      t,
      viewMode,
      isAdmin,
      search,
      statusFilter,
      brandFilter,
      handleToggleView,
      handleAddVehicle,
    ],
  );

  // ── Empty list component ───────────────────────────────────────────────────

  const ListEmpty = useMemo(
    () => (
      <View className="flex-1 pt-16">
        <EmptyState
          icon={SearchX}
          title={t('fleet.noVehicles', 'No vehicles found')}
          subtitle={t(
            'fleet.noVehiclesSubtitle',
            'Try adjusting your search or filters',
          )}
        />
      </View>
    ),
    [t],
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <ScreenWrapper padded={false}>
      <FlatList
        data={filtered}
        renderItem={viewMode === 'grid' ? renderGridCard : renderListRow}
        keyExtractor={keyExtractor}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // force re-mount on column change
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 100,
          flexGrow: 1,
        }}
        columnWrapperStyle={
          viewMode === 'grid' ? { gap: 0 } : undefined
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.accent}
          />
        }
      />
    </ScreenWrapper>
  );
}
