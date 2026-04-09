import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Lock,
  TrendingUp,
  Download,
  Car,
  Wrench,
  PauseCircle,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { Avatar } from '@/components/ui/Avatar';
import { Chip, ChipGroup } from '@/components/ui/Chip';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/components/ui/Toast';

// ── Mock data ───────────────────────────────────────────────────────────────

const PERIODS = ['Aujourd\'hui', 'Cette semaine', 'Ce mois', 'Ce trimestre'] as const;

const BOOKING_STATS = [
  { label: 'Total Bookings', value: '22' },
  { label: 'Durée moyenne', value: '5.2 jours' },
  { label: 'Tarif moyen', value: '€152/jour' },
  { label: 'Taux d\'annulation', value: '9%' },
] as const;

const TOP_CLIENTS = [
  { name: 'Youssef El Amrani', amount: 4780 },
  { name: 'Karim Haddad', amount: 3120 },
  { name: 'Isabelle Leroy', amount: 2890 },
  { name: 'Mehdi Benali', amount: 2340 },
  { name: 'Olivier Dupont', amount: 1860 },
] as const;

// ── Donut Chart ─────────────────────────────────────────────────────────────

function DonutChart({
  percentage,
  activeCount,
  totalCount,
}: {
  percentage: number;
  activeCount: number;
  totalCount: number;
}) {
  const theme = useTheme();
  const outerSize = 160;
  const innerSize = 110;
  const fillDeg = (percentage / 100) * 360;

  return (
    <View className="items-center">
      <View
        style={{
          width: outerSize,
          height: outerSize,
          borderRadius: outerSize / 2,
          backgroundColor: theme.surfaceTertiary,
          overflow: 'hidden',
        }}
        className="items-center justify-center"
      >
        {/* Filled arc — we use a trick: 4 quadrants clipped to simulate progress */}
        {/* First half (0-180 deg) */}
        {fillDeg > 0 && (
          <View
            style={{
              position: 'absolute',
              width: outerSize / 2,
              height: outerSize,
              left: outerSize / 2,
              top: 0,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: outerSize,
                height: outerSize,
                borderRadius: outerSize / 2,
                borderWidth: outerSize / 4,
                borderColor: 'transparent',
                borderTopColor: theme.accent,
                borderRightColor: fillDeg > 90 ? theme.accent : 'transparent',
                position: 'absolute',
                right: 0,
                top: 0,
                transform: [{ rotate: '0deg' }],
              }}
            />
          </View>
        )}

        {/* Background ring */}
        <View
          style={{
            position: 'absolute',
            width: outerSize,
            height: outerSize,
            borderRadius: outerSize / 2,
            borderWidth: 14,
            borderColor: theme.border,
          }}
        />

        {/* Accent ring overlay representing percentage */}
        <View
          style={{
            position: 'absolute',
            width: outerSize,
            height: outerSize,
            borderRadius: outerSize / 2,
            borderWidth: 14,
            borderColor: theme.accent,
            borderBottomColor: fillDeg > 270 ? theme.accent : 'transparent',
            borderLeftColor: fillDeg > 180 ? theme.accent : 'transparent',
            borderRightColor: fillDeg > 90 ? theme.accent : 'transparent',
            borderTopColor: theme.accent,
            transform: [{ rotate: '-90deg' }],
          }}
        />

        {/* Inner circle — the hole */}
        <View
          style={{
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: theme.surface,
          }}
          className="items-center justify-center"
        >
          <Text variant="displayMedium" color={theme.accent}>
            {percentage}%
          </Text>
          <Text variant="bodySmall" color={theme.textSecondary}>
            {activeCount}/{totalCount} actifs
          </Text>
        </View>
      </View>

      {/* Legend */}
      <View className="flex-row items-center mt-4" style={{ gap: 16 }}>
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <Badge variant="success" dot size="sm" />
          <Text variant="bodySmall" color={theme.textSecondary}>Actif</Text>
        </View>
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <Badge variant="info" dot size="sm" />
          <Text variant="bodySmall" color={theme.textSecondary}>Disponible</Text>
        </View>
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <Badge variant="warning" dot size="sm" />
          <Text variant="bodySmall" color={theme.textSecondary}>Maintenance</Text>
        </View>
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <Badge variant="danger" dot size="sm" />
          <Text variant="bodySmall" color={theme.textSecondary}>Inactif</Text>
        </View>
      </View>
    </View>
  );
}

// ── Main Screen ─────────────────────────────────────────────────────────────

export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const showToast = useToastStore((s) => s.show);
  const [selectedPeriod, setSelectedPeriod] = useState(2);

  // ── Admin guard ───────────────────────────────────────────────
  if (role !== 'admin') {
    return (
      <ScreenWrapper>
        <View className="flex-row items-center pt-6 pb-4">
          <Pressable
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            className="mr-3"
          >
            <ChevronLeft size={24} color={theme.textPrimary} strokeWidth={2} />
          </Pressable>
          <Text variant="headlineLarge" className="flex-1">
            Analytique
          </Text>
        </View>

        <View className="flex-1 items-center justify-center pb-20">
          <Lock size={64} color={theme.danger} strokeWidth={1} />
          <Text variant="headlineMedium" color={theme.danger} className="mt-4">
            Accès administrateur requis
          </Text>
          <Text
            variant="bodyMedium"
            color={theme.textSecondary}
            align="center"
            className="mt-2 px-8"
          >
            Cette section est réservée aux administrateurs.
          </Text>
          <View className="mt-6">
            <Button variant="secondary" onPress={() => router.back()}>
              Retour
            </Button>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  // ── Admin dashboard ───────────────────────────────────────────
  return (
    <ScreenWrapper scroll>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(0)}
        className="flex-row items-center pt-6 pb-4"
      >
        <Pressable
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          className="mr-3"
        >
          <ChevronLeft size={24} color={theme.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text variant="headlineLarge" className="flex-1">
          Analytique
        </Text>
      </Animated.View>

      {/* Period Selector */}
      <Animated.View entering={FadeInDown.duration(400).delay(50)} className="mb-4">
        <ChipGroup>
          {PERIODS.map((period, index) => (
            <Chip
              key={period}
              label={period}
              selected={selectedPeriod === index}
              onPress={() => setSelectedPeriod(index)}
            />
          ))}
        </ChipGroup>
      </Animated.View>

      {/* Revenue Hero Card */}
      <Animated.View entering={FadeInDown.duration(400).delay(100)} className="mb-4">
        <Card>
          <View className="flex-row items-center justify-between">
            <View>
              <Text variant="bodySmall" color={theme.textSecondary}>
                Revenu total
              </Text>
              <Text variant="displayLarge" color={theme.accent} className="mt-1">
                €12,450
              </Text>
            </View>
            <View
              style={{ backgroundColor: theme.successSoft }}
              className="rounded-full px-3 py-1.5 flex-row items-center"
            >
              <TrendingUp size={14} color={theme.success} strokeWidth={2} />
              <Text variant="bodySmall" color={theme.success} className="ml-1">
                +15% vs mois précédent
              </Text>
            </View>
          </View>
        </Card>
      </Animated.View>

      {/* Fleet Utilization */}
      <Animated.View entering={FadeInDown.duration(400).delay(150)} className="mb-4">
        <Card>
          <Text variant="headlineSmall" className="mb-4">
            Utilisation de la flotte
          </Text>
          <DonutChart percentage={78} activeCount={12} totalCount={16} />
        </Card>
      </Animated.View>

      {/* Booking Stats — 2x2 Grid */}
      <Animated.View entering={FadeInDown.duration(400).delay(200)} className="mb-4">
        <Text variant="headlineSmall" className="mb-3">
          Statistiques des réservations
        </Text>
        <View className="flex-row flex-wrap -mx-1">
          {BOOKING_STATS.map((stat) => (
            <View key={stat.label} className="w-1/2 px-1 mb-2">
              <Card>
                <Text variant="bodySmall" color={theme.textSecondary}>
                  {stat.label}
                </Text>
                <Text variant="headlineMedium" className="mt-1">
                  {stat.value}
                </Text>
              </Card>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Top Clients */}
      <Animated.View entering={FadeInDown.duration(400).delay(250)} className="mb-4">
        <Card>
          <Text variant="headlineSmall" className="mb-3">
            Top clients par revenu
          </Text>
          {TOP_CLIENTS.map((client, index) => (
            <React.Fragment key={client.name}>
              {index > 0 && <Divider className="my-2" />}
              <View className="flex-row items-center py-1">
                <Text
                  variant="bodySmall"
                  color={theme.textTertiary}
                  className="mr-3"
                >
                  {index + 1}
                </Text>
                <Avatar name={client.name} size="sm" />
                <Text variant="titleMedium" className="flex-1 ml-3">
                  {client.name}
                </Text>
                <Text variant="titleMedium" color={theme.accent}>
                  €{client.amount.toLocaleString()}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </Card>
      </Animated.View>

      {/* Violations Summary */}
      <Animated.View entering={FadeInDown.duration(400).delay(300)} className="mb-4">
        <Card>
          <Text variant="headlineSmall" className="mb-3">
            Résumé des infractions
          </Text>
          <View className="flex-row" style={{ gap: 12 }}>
            <View
              style={{ backgroundColor: theme.dangerSoft }}
              className="flex-1 rounded-xl p-3 items-center"
            >
              <AlertTriangle size={20} color={theme.danger} strokeWidth={1.5} />
              <Text variant="headlineMedium" className="mt-1">12</Text>
              <Text variant="bodySmall" color={theme.textSecondary}>Total</Text>
            </View>
            <View
              style={{ backgroundColor: theme.warningSoft }}
              className="flex-1 rounded-xl p-3 items-center"
            >
              <Text variant="headlineMedium" className="mt-1">€1,840</Text>
              <Text variant="bodySmall" color={theme.textSecondary}>Amendes</Text>
            </View>
            <View
              style={{ backgroundColor: theme.successSoft }}
              className="flex-1 rounded-xl p-3 items-center"
            >
              <Text variant="headlineMedium" className="mt-1">75%</Text>
              <Text variant="bodySmall" color={theme.textSecondary}>Recouvrement</Text>
            </View>
          </View>
        </Card>
      </Animated.View>

      {/* Export Button */}
      <Animated.View entering={FadeInDown.duration(400).delay(350)} className="mb-8">
        <Button
          fullWidth
          leftIcon={Download}
          onPress={() => {
            showToast({ variant: 'info', title: 'Coming soon', message: 'L\'export sera disponible prochainement.' });
          }}
        >
          Exporter le rapport
        </Button>
      </Animated.View>
    </ScreenWrapper>
  );
}
