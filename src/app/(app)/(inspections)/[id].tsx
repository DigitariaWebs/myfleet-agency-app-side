import React, { useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import {
  ChevronLeft,
  Camera,
  CheckCircle,
  AlertTriangle,
  Share2,
  Play,
  Gauge,
  Fuel,
  ScanLine,
  PenTool,
  FileText,
} from 'lucide-react-native';

import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { shadows } from '@/theme/shadows';
import { useTheme } from '@/hooks/useTheme';
import { useToastStore } from '@/components/ui/Toast';
import { formatDate, formatMileage } from '@/utils/format';
import { useInspectionStore } from '@/stores/useInspectionStore';
import { getVehicleImage } from '@/data/vehicleImages';
import type { Inspection, CapturedPhoto, DamageSeverity } from '@/types/inspection';
import { PHOTO_ANGLES } from '@/types/inspection';

// ── Constants ─────────────────────────────────────────────────────────────────

const ACCENT = '#7C3AED';
const ACCENT_END = '#A855F7';
const SUCCESS = '#10B981';
const DANGER = '#EF4444';
const WARNING = '#F59E0B';
const INFO = '#3B82F6';

// ── Helpers ─────────────────────────────────────────────────────────────────

type TypeBadgeVariant = 'info' | 'warning' | 'accent';

function getTypeBadge(type: Inspection['type']): { label: string; variant: TypeBadgeVariant } {
  switch (type) {
    case 'pre-rental':
      return { label: 'Pre-rental', variant: 'info' };
    case 'post-rental':
      return { label: 'Post-rental', variant: 'warning' };
    case 'routine':
      return { label: 'Routine', variant: 'accent' };
  }
}

function severityVariant(severity: DamageSeverity): 'info' | 'warning' | 'danger' {
  const map: Record<DamageSeverity, 'info' | 'warning' | 'danger'> = {
    minor: 'info',
    moderate: 'warning',
    severe: 'danger',
  };
  return map[severity];
}

function severityColor(severity: DamageSeverity): string {
  const map: Record<DamageSeverity, string> = {
    minor: INFO,
    moderate: WARNING,
    severe: DANGER,
  };
  return map[severity];
}

function severityOrder(severity: DamageSeverity): number {
  const order: Record<DamageSeverity, number> = {
    severe: 0,
    moderate: 1,
    minor: 2,
  };
  return order[severity];
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

interface DamageEntry {
  angleLabel: string;
  severity: DamageSeverity;
  description: string;
}

function collectDamages(inspection: Inspection): DamageEntry[] {
  const damages: DamageEntry[] = [];

  for (const photo of inspection.photos) {
    const angleInfo = PHOTO_ANGLES.find((a) => a.key === photo.angle);
    const angleLabel = angleInfo?.label ?? photo.angle;

    // Manual annotations
    for (const annotation of photo.annotations) {
      damages.push({
        angleLabel,
        severity: annotation.severity,
        description: annotation.description,
      });
    }

    // AI detections (not covered by manual annotations)
    if (photo.aiResult && photo.aiResult.damagesFound > 0) {
      const aiOnly = photo.aiResult.damagesFound - photo.annotations.length;
      for (let i = 0; i < Math.max(0, aiOnly); i++) {
        damages.push({
          angleLabel,
          severity: 'moderate',
          description: 'AI detected',
        });
      }
    }
  }

  // Sort by severity: severe first
  damages.sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity));

  return damages;
}

// ── Main Screen ─────────────────────────────────────────────────────────────

export default function InspectionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const showToast = useToastStore((s) => s.show);

  const inspection = useInspectionStore((s) => s.inspections.find((i) => i.id === id));

  // ── Not found ───────────────────────────────────────────────────────────
  if (!inspection) {
    return (
      <ScreenWrapper scroll>
        <View className="flex-1 items-center justify-center py-20">
          <EmptyState
            icon={ScanLine}
            title={t('inspections.detail.notFound', 'Inspection not found')}
            subtitle={t(
              'inspections.detail.notFoundDesc',
              'The inspection you are looking for does not exist.',
            )}
            actionLabel={t('common.back', 'Back')}
            onAction={() => router.back()}
          />
        </View>
      </ScreenWrapper>
    );
  }

  const typeBadge = getTypeBadge(inspection.type);
  const totalDamages = inspection.totalDamagesAI + inspection.totalDamagesManual;
  const damages = useMemo(() => collectDamages(inspection), [inspection]);
  const severityCounts = useMemo(() => {
    const counts: Record<DamageSeverity, number> = { minor: 0, moderate: 0, severe: 0 };
    for (const d of damages) {
      counts[d.severity]++;
    }
    return counts;
  }, [damages]);

  // Map captured photos by angle for quick lookup
  const photoByAngle = useMemo(() => {
    const map = new Map<string, CapturedPhoto>();
    for (const p of inspection.photos) {
      map.set(p.angle, p);
    }
    return map;
  }, [inspection.photos]);

  const vehicleImageUri = getVehicleImage(inspection.vehicleId);

  return (
    <ScreenWrapper scroll padded>
      {/* ================================================================
          HEADER
          ================================================================ */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="flex-row items-center justify-between pt-4 pb-4"
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.surfaceSecondary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={20} color={theme.textPrimary} />
        </Pressable>

        <Text variant="headlineLarge">
          {t('inspections.detail.title', 'Inspection Report')}
        </Text>

        <Pressable
          onPress={() => {
            showToast({
              variant: 'info',
              title: t('inspections.detail.comingSoon', 'Coming soon'),
              message: t(
                'inspections.detail.shareMessage',
                'Report sharing will be available soon.',
              ),
            });
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 1.5,
            borderColor: theme.border,
            backgroundColor: theme.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Share2 size={18} color={theme.textSecondary} />
        </Pressable>
      </Animated.View>

      {/* ================================================================
          HERO SUMMARY CARD
          ================================================================ */}
      <Animated.View entering={FadeInDown.duration(400).delay(100)}>
        <View
          style={{
            backgroundColor: theme.surface,
            borderRadius: 20,
            padding: 20,
            ...shadows.md,
          }}
        >
          {/* Vehicle photo */}
          {vehicleImageUri && (
            <View
              style={{
                width: '100%',
                height: 160,
                borderRadius: 16,
                overflow: 'hidden',
                marginBottom: 16,
                backgroundColor: theme.surfaceTertiary,
              }}
            >
              <Image
                source={vehicleImageUri}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={300}
              />
            </View>
          )}

          {/* Vehicle name + ID */}
          <Text variant="headlineMedium">{inspection.vehicleName}</Text>
          <Text variant="caption" color={theme.textTertiary} className="mt-0.5">
            {inspection.vehicleId}
          </Text>

          {/* Type + Status badges */}
          <View className="flex-row items-center mt-3" style={{ gap: 8 }}>
            <Badge variant={typeBadge.variant} size="md">
              {typeBadge.label}
            </Badge>
            <Badge
              variant={inspection.status === 'draft' ? 'warning' : 'success'}
              size="md"
            >
              {inspection.status === 'draft'
                ? t('inspections.draft', 'Draft')
                : t('inspections.completed', 'Completed')}
            </Badge>
          </View>

          {/* Date + Inspector + Client info row */}
          <View className="flex-row items-center flex-wrap mt-3">
            <Text variant="bodySmall" color={theme.textSecondary}>
              {formatDate(inspection.date, 'long')}
            </Text>
            <Text variant="bodySmall" color={theme.textTertiary} className="mx-1.5">
              {'\u00B7'}
            </Text>
            <Text variant="bodySmall" color={theme.textSecondary}>
              {inspection.inspectorName}
            </Text>
            {inspection.clientName != null && (
              <>
                <Text variant="bodySmall" color={theme.textTertiary} className="mx-1.5">
                  {'\u00B7'}
                </Text>
                <Text variant="bodySmall" color={theme.textSecondary}>
                  {inspection.clientName}
                </Text>
              </>
            )}
          </View>

          <Divider className="my-4" />

          {/* 3-column stats row */}
          <View className="flex-row">
            {/* Photos */}
            <View className="flex-1 items-center">
              <View className="flex-row items-center" style={{ gap: 4 }}>
                <Camera size={14} color={theme.textTertiary} />
                <Text variant="caption" color={theme.textTertiary}>
                  {t('inspections.detail.photos', 'Photos')}
                </Text>
              </View>
              <Text variant="headlineSmall" className="mt-1">
                {inspection.photos.length}/8
              </Text>
            </View>

            {/* AI Damages */}
            <View className="flex-1 items-center">
              <View className="flex-row items-center" style={{ gap: 4 }}>
                <ScanLine
                  size={14}
                  color={inspection.totalDamagesAI > 0 ? DANGER : SUCCESS}
                />
                <Text variant="caption" color={theme.textTertiary}>
                  {t('inspections.detail.aiDamages', 'AI')}
                </Text>
              </View>
              <Text
                variant="headlineSmall"
                color={inspection.totalDamagesAI > 0 ? DANGER : SUCCESS}
                className="mt-1"
              >
                {inspection.totalDamagesAI}
              </Text>
            </View>

            {/* Manual */}
            <View className="flex-1 items-center">
              <View className="flex-row items-center" style={{ gap: 4 }}>
                <PenTool size={14} color={theme.textTertiary} />
                <Text variant="caption" color={theme.textTertiary}>
                  {t('inspections.detail.manual', 'Manual')}
                </Text>
              </View>
              <Text variant="headlineSmall" className="mt-1">
                {inspection.totalDamagesManual}
              </Text>
            </View>
          </View>

          {/* Total damage banner */}
          <View
            className="flex-row items-center mt-4"
            style={{
              backgroundColor: totalDamages === 0 ? '#10B98115' : '#EF444415',
              borderRadius: 16,
              padding: 14,
              width: '100%',
            }}
          >
            {totalDamages === 0 ? (
              <>
                <CheckCircle size={20} color={SUCCESS} />
                <Text variant="titleMedium" color={SUCCESS} className="ml-2">
                  {t('inspections.detail.clean', 'Clean inspection')}
                </Text>
              </>
            ) : (
              <>
                <AlertTriangle size={20} color={DANGER} />
                <Text variant="titleMedium" color={DANGER} className="ml-2">
                  {totalDamages} {t('inspections.detail.damagesFound', 'damages found')}
                </Text>
              </>
            )}
          </View>
        </View>
      </Animated.View>

      {/* ================================================================
          MILEAGE & FUEL CARD
          ================================================================ */}
      <Animated.View entering={FadeInDown.duration(400).delay(200)} className="mt-4">
        <View
          style={{
            backgroundColor: theme.surface,
            borderRadius: 20,
            padding: 20,
            ...shadows.sm,
          }}
        >
          <View className="flex-row">
            {/* Mileage */}
            <View className="flex-1">
              <View className="flex-row items-center" style={{ gap: 6 }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: '#7C3AED15',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Gauge size={14} color={ACCENT} />
                </View>
                <Text variant="caption" color={theme.textTertiary}>
                  {t('inspections.detail.mileage', 'Mileage')}
                </Text>
              </View>
              <Text variant="headlineSmall" className="mt-2">
                {formatMileage(inspection.mileage)}
              </Text>
            </View>

            {/* Fuel */}
            <View className="flex-1">
              <View className="flex-row items-center" style={{ gap: 6 }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor:
                      inspection.fuelLevel <= 25
                        ? '#EF444415'
                        : inspection.fuelLevel <= 50
                          ? '#F59E0B15'
                          : '#10B98115',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Fuel
                    size={14}
                    color={
                      inspection.fuelLevel <= 25
                        ? DANGER
                        : inspection.fuelLevel <= 50
                          ? WARNING
                          : SUCCESS
                    }
                  />
                </View>
                <Text variant="caption" color={theme.textTertiary}>
                  {t('inspections.detail.fuel', 'Fuel Level')}
                </Text>
              </View>
              <Text variant="headlineSmall" className="mt-2">
                {inspection.fuelLevel}%
              </Text>
              <ProgressBar
                progress={inspection.fuelLevel / 100}
                color={
                  inspection.fuelLevel <= 25
                    ? DANGER
                    : inspection.fuelLevel <= 50
                      ? WARNING
                      : SUCCESS
                }
                height={6}
                className="mt-2"
              />
            </View>
          </View>
        </View>
      </Animated.View>

      {/* ================================================================
          PHOTO GRID
          ================================================================ */}
      <Animated.View entering={FadeInDown.duration(400).delay(300)} className="mt-6">
        {/* Section title + count badge */}
        <View className="flex-row items-center justify-between mb-3">
          <Text variant="headlineSmall">
            {t('inspections.detail.photosSection', 'Photos')}
          </Text>
          <Badge variant="accent" size="sm">
            {inspection.photos.length}/8
          </Badge>
        </View>

        {/* 2-column grid */}
        <View className="flex-row flex-wrap" style={{ gap: 10 }}>
          {PHOTO_ANGLES.map((angle) => {
            const photo = photoByAngle.get(angle.key);
            const hasDamages = photo?.aiResult && photo.aiResult.damagesFound > 0;
            const annotationCount = photo?.annotations.length ?? 0;

            return (
              <View
                key={angle.key}
                style={{
                  width: '48.5%',
                  aspectRatio: 4 / 3,
                  borderRadius: 16,
                  overflow: 'hidden',
                  backgroundColor: theme.surface,
                  ...shadows.sm,
                }}
              >
                {/* Photo area */}
                <View
                  className="flex-1"
                  style={{ backgroundColor: theme.surfaceTertiary }}
                >
                  {/* Center icon */}
                  <View className="flex-1 items-center justify-center">
                    <Camera
                      size={28}
                      color={photo ? theme.textTertiary : theme.border}
                      strokeWidth={photo ? 1.5 : 1}
                    />
                  </View>

                  {/* Top-left: angle label pill */}
                  <View
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      backgroundColor: 'rgba(0,0,0,0.45)',
                      borderRadius: 9999,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                    }}
                  >
                    <Text
                      variant="labelSmall"
                      color="#FFFFFF"
                      numberOfLines={1}
                      style={{ fontSize: 9 }}
                    >
                      {angle.label}
                    </Text>
                  </View>

                  {/* Bottom-right: AI result badge */}
                  {photo && (
                    <View
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                      }}
                    >
                      {hasDamages ? (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#EF444420',
                            borderRadius: 9999,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            gap: 3,
                          }}
                        >
                          <AlertTriangle size={10} color={DANGER} />
                          <Text variant="labelSmall" color={DANGER} style={{ fontSize: 9 }}>
                            {photo.aiResult!.damagesFound}
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#10B98120',
                            borderRadius: 9999,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            gap: 3,
                          }}
                        >
                          <CheckCircle size={10} color={SUCCESS} />
                          <Text variant="labelSmall" color={SUCCESS} style={{ fontSize: 9 }}>
                            OK
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Bottom-left: annotation indicator */}
                  {annotationCount > 0 && (
                    <View
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.45)',
                        borderRadius: 9999,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        gap: 3,
                      }}
                    >
                      <PenTool size={9} color="#FFFFFF" />
                      <Text variant="labelSmall" color="#FFFFFF" style={{ fontSize: 9 }}>
                        {annotationCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </Animated.View>

      {/* ================================================================
          DAMAGE SUMMARY
          ================================================================ */}
      <Animated.View entering={FadeInDown.duration(400).delay(400)} className="mt-6">
        <Text variant="headlineSmall" className="mb-3">
          {t('inspections.detail.damageSummary', 'Damage Summary')}
        </Text>

        {damages.length === 0 ? (
          <View className="py-8">
            <EmptyState
              icon={CheckCircle}
              title={t('inspections.detail.noDamage', 'No damage detected')}
              subtitle="All angles passed AI inspection"
            />
          </View>
        ) : (
          <View>
            {/* Severity breakdown badges */}
            <View className="flex-row items-center mb-4" style={{ gap: 8 }}>
              {severityCounts.severe > 0 && (
                <Badge variant="danger" size="md">
                  {severityCounts.severe} {t('inspections.detail.severe', 'Severe')}
                </Badge>
              )}
              {severityCounts.moderate > 0 && (
                <Badge variant="warning" size="md">
                  {severityCounts.moderate} {t('inspections.detail.moderate', 'Moderate')}
                </Badge>
              )}
              {severityCounts.minor > 0 && (
                <Badge variant="info" size="md">
                  {severityCounts.minor} {t('inspections.detail.minor', 'Minor')}
                </Badge>
              )}
            </View>

            {/* Damage list */}
            {damages.map((damage, index) => (
              <View
                key={`${damage.angleLabel}-${damage.severity}-${index}`}
                style={{
                  backgroundColor: theme.surface,
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  ...shadows.sm,
                }}
              >
                {/* Severity dot */}
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: severityColor(damage.severity),
                    marginRight: 12,
                  }}
                />

                {/* Content */}
                <View className="flex-1 mr-2">
                  <Text variant="titleSmall" numberOfLines={1}>
                    {damage.angleLabel}
                  </Text>
                  <Text
                    variant="bodySmall"
                    color={theme.textSecondary}
                    className="mt-0.5"
                    numberOfLines={2}
                  >
                    {damage.description}
                  </Text>
                </View>

                {/* Severity badge */}
                <Badge variant={severityVariant(damage.severity)} size="sm">
                  {capitalize(damage.severity)}
                </Badge>
              </View>
            ))}
          </View>
        )}
      </Animated.View>

      {/* ================================================================
          NOTES
          ================================================================ */}
      <Animated.View entering={FadeInDown.duration(400).delay(500)} className="mt-6">
        <Text variant="headlineSmall" className="mb-3">
          {t('inspections.detail.notes', 'Notes')}
        </Text>

        <View
          style={{
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 16,
            ...shadows.sm,
          }}
        >
          <View className="flex-row items-start" style={{ gap: 10 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: theme.surfaceSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 1,
              }}
            >
              <FileText size={16} color={theme.textTertiary} />
            </View>
            <View className="flex-1">
              {inspection.notes.trim().length > 0 ? (
                <Text variant="bodyMedium" color={theme.textSecondary}>
                  {inspection.notes}
                </Text>
              ) : (
                <Text variant="bodyMedium" color={theme.textTertiary}>
                  {t('inspections.detail.noNotes', 'No notes added')}
                </Text>
              )}
            </View>
          </View>
        </View>
      </Animated.View>

      {/* ================================================================
          ACTION BUTTONS
          ================================================================ */}
      <Animated.View entering={FadeInDown.duration(400).delay(600)} className="mt-8 mb-8">
        <Pressable
          onPress={() => {
            showToast({
              variant: 'info',
              title: t('inspections.detail.comingSoon', 'Coming soon'),
              message: t(
                'inspections.detail.shareMessage',
                'Report sharing will be available soon.',
              ),
            });
          }}
          style={{ borderRadius: 9999, overflow: 'hidden', ...shadows.accent }}
        >
          <LinearGradient
            colors={[ACCENT, ACCENT_END]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 9999,
              height: 52,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Share2 size={18} color="#FFFFFF" />
            <Text variant="bodyLarge" color="#FFFFFF" className="font-semibold">
              {t('inspections.detail.shareReport', 'Share Report')}
            </Text>
          </LinearGradient>
        </Pressable>

        {inspection.status === 'draft' && (
          <Button
            variant="secondary"
            fullWidth
            size="lg"
            leftIcon={Play}
            className="mt-3"
            onPress={() => router.push('/(inspections)/new')}
          >
            {t('inspections.detail.resume', 'Resume Inspection')}
          </Button>
        )}
      </Animated.View>
    </ScreenWrapper>
  );
}
