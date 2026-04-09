import React, { useState, useCallback, useMemo } from 'react';
import { View, Pressable, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { ScanLine, Plus, Camera } from 'lucide-react-native';
import { Image } from 'expo-image';

import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Text } from '@/components/ui/Text';
import { SearchBar } from '@/components/ui/SearchBar';
import { Chip, ChipGroup } from '@/components/ui/Chip';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { shadows } from '@/theme/shadows';
import { formatDate } from '@/utils/format';
import { mockInspections } from '@/data/inspections';
import { getVehicleImage } from '@/data/vehicleImages';
import type { Inspection, InspectionType } from '@/types/inspection';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type BadgeVariant = 'info' | 'warning' | 'accent';

function getTypeBadge(type: InspectionType): { label: string; variant: BadgeVariant } {
  switch (type) {
    case 'pre-rental':
      return { label: 'Pre-rental', variant: 'info' };
    case 'post-rental':
      return { label: 'Post-rental', variant: 'warning' };
    case 'routine':
      return { label: 'Routine', variant: 'accent' };
  }
}

// ── Hero Stats Card ──────────────────────────────────────────────────────────

interface HeroStatsProps {
  total: number;
  clean: number;
  issues: number;
}

function HeroStats({ total, clean, issues }: HeroStatsProps) {
  const theme = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(80).duration(500).springify()}
      style={[
        {
          backgroundColor: theme.surface,
          borderRadius: 20,
          overflow: 'hidden',
        },
        shadows.md,
      ]}
    >
      {/* Accent gradient line at top */}
      <LinearGradient
        colors={[theme.accentGradientStart, theme.accentGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 2 }}
      />

      <View style={{ padding: 20, flexDirection: 'row', alignItems: 'center' }}>
        {/* Total */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text variant="headlineMedium">{total}</Text>
          <Text variant="bodySmall" color={theme.textTertiary}>
            inspections
          </Text>
        </View>

        {/* Divider */}
        <View
          style={{
            width: 1,
            height: 36,
            backgroundColor: theme.surfaceTertiary,
          }}
        />

        {/* Clean */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text variant="headlineMedium" color={theme.success}>
            {clean}
          </Text>
          <Text variant="bodySmall" color={theme.textTertiary}>
            no damage
          </Text>
        </View>

        {/* Divider */}
        <View
          style={{
            width: 1,
            height: 36,
            backgroundColor: theme.surfaceTertiary,
          }}
        />

        {/* Issues */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text variant="headlineMedium" color={theme.danger}>
            {issues}
          </Text>
          <Text variant="bodySmall" color={theme.textTertiary}>
            damages found
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ── Inspection Card ──────────────────────────────────────────────────────────

interface InspectionCardProps {
  inspection: Inspection;
  index: number;
  onPress: () => void;
}

function InspectionCard({ inspection, index, onPress }: InspectionCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const typeBadge = getTypeBadge(inspection.type);
  const totalDamages = inspection.totalDamagesAI + inspection.totalDamagesManual;
  const vehicleImageUri = getVehicleImage(inspection.vehicleId);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(index * 60).duration(400).springify()}
      onPress={handlePress}
      style={[
        {
          backgroundColor: theme.surface,
          borderRadius: 20,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'flex-start',
        },
        shadows.sm,
      ]}
    >
      {/* Vehicle thumbnail */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          overflow: 'hidden',
          backgroundColor: theme.surfaceTertiary,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        {vehicleImageUri ? (
          <Image
            source={vehicleImageUri}
            style={{ width: 48, height: 48 }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <Camera size={20} color={theme.textTertiary} />
        )}
      </View>

      {/* Content area */}
      <View style={{ flex: 1 }}>
        {/* Top row: vehicleName + type badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="titleMedium" numberOfLines={1} style={{ flex: 1, marginRight: 8, fontWeight: '700' }}>
            {inspection.vehicleName}
          </Text>
          <Badge variant={typeBadge.variant} size="sm">
            {typeBadge.label}
          </Badge>
        </View>

        {/* Second row: date + inspector */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Text variant="bodySmall" color={theme.textSecondary}>
            {formatDate(inspection.date, 'short')}
          </Text>
          <Text variant="bodySmall" color={theme.textTertiary} style={{ marginHorizontal: 6 }}>
            {'\u00B7'}
          </Text>
          <Text variant="bodySmall" color={theme.textSecondary} numberOfLines={1}>
            {inspection.inspectorName}
          </Text>
        </View>

        {/* Client name row */}
        {inspection.clientName != null && (
          <Text variant="bodySmall" color={theme.textSecondary} style={{ marginTop: 2 }}>
            {t('inspections.client', 'Client')}: {inspection.clientName}
          </Text>
        )}

        {/* Bottom row: damage result + status */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {totalDamages === 0 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 4,
                    backgroundColor: theme.success,
                  }}
                />
                <Text variant="bodySmall" color={theme.success} style={{ fontWeight: '600' }}>
                  {t('inspections.clean', 'Clean')}
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 4,
                    backgroundColor: theme.danger,
                  }}
                />
                <Text variant="bodySmall" color={theme.danger} style={{ fontWeight: '600' }}>
                  {totalDamages} {t('inspections.damages', 'damages')}
                </Text>
              </View>
            )}
          </View>

          <Badge
            variant={inspection.status === 'draft' ? 'warning' : 'success'}
            size="sm"
          >
            {inspection.status === 'draft'
              ? t('inspections.draft', 'Draft')
              : t('inspections.completed', 'Completed')}
          </Badge>
        </View>
      </View>
    </AnimatedPressable>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function InspectionsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<InspectionType | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Sort newest first
  const sortedInspections = useMemo(
    () =>
      [...mockInspections].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [],
  );

  const filteredInspections = useMemo(() => {
    let result = sortedInspections;

    if (typeFilter != null) {
      result = result.filter((i) => i.type === typeFilter);
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (i) =>
          i.vehicleName.toLowerCase().includes(q) ||
          (i.clientName != null && i.clientName.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [sortedInspections, typeFilter, searchQuery]);

  // Counts for chips
  const counts = useMemo(() => {
    const base =
      searchQuery.trim().length > 0
        ? sortedInspections.filter((i) => {
            const q = searchQuery.trim().toLowerCase();
            return (
              i.vehicleName.toLowerCase().includes(q) ||
              (i.clientName != null && i.clientName.toLowerCase().includes(q))
            );
          })
        : sortedInspections;

    return {
      all: base.length,
      'pre-rental': base.filter((i) => i.type === 'pre-rental').length,
      'post-rental': base.filter((i) => i.type === 'post-rental').length,
      routine: base.filter((i) => i.type === 'routine').length,
    };
  }, [sortedInspections, searchQuery]);

  // Hero stats
  const heroStats = useMemo(() => {
    const total = mockInspections.length;
    const clean = mockInspections.filter(
      (i) => i.totalDamagesAI + i.totalDamagesManual === 0,
    ).length;
    const issues = total - clean;
    return { total, clean, issues };
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFilterPress = useCallback((type: InspectionType | null) => {
    setTypeFilter((prev) => (prev === type ? null : type));
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleCardPress = useCallback(
    (id: string) => {
      router.push(`/(inspections)/${id}`);
    },
    [router],
  );

  const handleNewInspection = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(inspections)/new');
  }, [router]);

  const renderItem = useCallback(
    ({ item, index }: { item: Inspection; index: number }) => (
      <InspectionCard
        inspection={item}
        index={index}
        onPress={() => handleCardPress(item.id)}
      />
    ),
    [handleCardPress],
  );

  const keyExtractor = useCallback((item: Inspection) => item.id, []);

  const ListHeaderComponent = useMemo(
    () => (
      <View>
        {/* Header row: Title + Plus button */}
        <Animated.View
          entering={FadeInDown.duration(400).springify()}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 24,
            paddingBottom: 16,
          }}
        >
          <Text
            variant="headlineLarge"
            style={{ fontFamily: 'Poppins_700Bold', fontSize: 26 }}
          >
            {t('inspections.title', 'Inspections')}
          </Text>
          <IconButton
            icon={Plus}
            variant="filled"
            size="md"
            onPress={handleNewInspection}
          />
        </Animated.View>

        {/* Hero stats card */}
        <HeroStats
          total={heroStats.total}
          clean={heroStats.clean}
          issues={heroStats.issues}
        />

        {/* Search */}
        <View style={{ marginTop: 16, marginBottom: 12 }}>
          <SearchBar
            placeholder={t('inspections.search', 'Search vehicle or client...')}
            onSearch={handleSearch}
          />
        </View>

        {/* Filter chips */}
        <ChipGroup className="mb-4">
          <Chip
            label={`${t('inspections.all', 'All')} (${counts.all})`}
            selected={typeFilter === null}
            onPress={() => handleFilterPress(null)}
          />
          <Chip
            label={`${t('inspections.preRental', 'Pre-rental')} (${counts['pre-rental']})`}
            selected={typeFilter === 'pre-rental'}
            onPress={() => handleFilterPress('pre-rental')}
          />
          <Chip
            label={`${t('inspections.postRental', 'Post-rental')} (${counts['post-rental']})`}
            selected={typeFilter === 'post-rental'}
            onPress={() => handleFilterPress('post-rental')}
          />
          <Chip
            label={`${t('inspections.routine', 'Routine')} (${counts.routine})`}
            selected={typeFilter === 'routine'}
            onPress={() => handleFilterPress('routine')}
          />
        </ChipGroup>
      </View>
    ),
    [t, counts, typeFilter, heroStats, handleSearch, handleFilterPress, handleNewInspection],
  );

  const ListEmptyComponent = useMemo(
    () => (
      <EmptyState
        icon={ScanLine}
        title={t('inspections.emptyTitle', 'Aucune inspection trouvée')}
        subtitle={t(
          'inspections.emptySubtitle',
          'Try adjusting your search or filters.',
        )}
        className="mt-16"
      />
    ),
    [t],
  );

  return (
    <ScreenWrapper>
      <FlatList
        data={filteredInspections}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 32,
          gap: 12,
        }}
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
