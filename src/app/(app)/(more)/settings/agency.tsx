import React, { useState } from 'react';
import { View, Pressable, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Lock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Crown,
  UserPlus,
  Clock,
  Banknote,
  Bell,
  CalendarX,
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
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/components/ui/Toast';
import { useAgencySettingsStore, type AutoCancelHours } from '@/stores/useAgencySettingsStore';

// ── Mock data ───────────────────────────────────────────────────────────────

const AGENCY_INFO = {
  name: 'My Fleet SAS',
  address: '14 Rue de la Paix, 75002 Paris',
  phone: '+33 1 42 00 00 00',
  email: 'contact@myfleet.fr',
  website: 'www.myfleet.fr',
} as const;

interface TeamMember {
  name: string;
  role: 'admin' | 'employee';
  lastActive: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  { name: 'Ahmed Admin', role: 'admin', lastActive: 'En ligne' },
  { name: 'Marie Dupont', role: 'employee', lastActive: 'Il y a 2h' },
  { name: 'Pierre Laurent', role: 'employee', lastActive: 'Il y a 1j' },
];

// ── Auto-cancel options ─────────────────────────────────────────────────────

const AUTO_CANCEL_OPTIONS: { label: string; hours: AutoCancelHours }[] = [
  { label: '24h', hours: 24 },
  { label: '48h', hours: 48 },
  { label: '3 days', hours: 72 },
  { label: '7 days', hours: 168 },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function AgencyScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const showToast = useToastStore((s) => s.show);
  const [autoReminders, setAutoReminders] = useState(true);

  const autoCancelEnabled = useAgencySettingsStore((s) => s.bookingPolicies.autoCancelUnpaid);
  const autoCancelHours = useAgencySettingsStore((s) => s.bookingPolicies.autoCancelAfterHours);
  const setAutoCancelEnabled = useAgencySettingsStore((s) => s.setAutoCancelEnabled);
  const setAutoCancelHours = useAgencySettingsStore((s) => s.setAutoCancelHours);

  const comingSoon = () => {
    showToast({
      variant: 'info',
      title: 'Coming soon',
      message: 'Cette fonctionnalité sera disponible prochainement.',
    });
  };

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
            Agence
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

  // ── Admin view ────────────────────────────────────────────────
  return (
    <ScreenWrapper scroll>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
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
          Agence
        </Text>
      </Animated.View>

      {/* Agency Info Card */}
      <Animated.View entering={FadeInDown.duration(400).delay(50)} className="mb-4">
        <Card>
          <Text variant="headlineMedium" className="mb-3">
            {AGENCY_INFO.name}
          </Text>

          <View className="flex-row items-center mb-2">
            <MapPin size={16} color={theme.textSecondary} strokeWidth={1.8} />
            <Text variant="bodyMedium" color={theme.textSecondary} className="ml-2">
              {AGENCY_INFO.address}
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Phone size={16} color={theme.textSecondary} strokeWidth={1.8} />
            <Text variant="bodyMedium" color={theme.textSecondary} className="ml-2">
              {AGENCY_INFO.phone}
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Mail size={16} color={theme.textSecondary} strokeWidth={1.8} />
            <Text variant="bodyMedium" color={theme.textSecondary} className="ml-2">
              {AGENCY_INFO.email}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Globe size={16} color={theme.textSecondary} strokeWidth={1.8} />
            <Text variant="bodyMedium" color={theme.accent} className="ml-2">
              {AGENCY_INFO.website}
            </Text>
          </View>
        </Card>
      </Animated.View>

      {/* Plan Card */}
      <Animated.View entering={FadeInDown.duration(400).delay(100)} className="mb-4">
        <Card>
          <View className="flex-row items-center mb-3">
            <Crown size={20} color={theme.accent} strokeWidth={1.8} />
            <Text variant="headlineSmall" className="ml-2 flex-1">
              Abonnement
            </Text>
            <Badge variant="accent" size="md">
              Professional
            </Badge>
          </View>
          <Divider className="mb-3" />
          <View className="flex-row justify-between mb-2">
            <Text variant="bodyMedium" color={theme.textSecondary}>
              Tarif mensuel
            </Text>
            <Text variant="titleMedium">€99/mois</Text>
          </View>
          <View className="flex-row justify-between mb-4">
            <Text variant="bodyMedium" color={theme.textSecondary}>
              Prochaine facturation
            </Text>
            <Text variant="titleMedium">1 mai 2026</Text>
          </View>
          <Button fullWidth variant="secondary" onPress={comingSoon}>
            Mettre à niveau
          </Button>
        </Card>
      </Animated.View>

      {/* Users List */}
      <Animated.View entering={FadeInDown.duration(400).delay(150)} className="mb-4">
        <Card>
          <Text variant="headlineSmall" className="mb-3">
            Équipe
          </Text>
          {TEAM_MEMBERS.map((member, index) => (
            <React.Fragment key={member.name}>
              {index > 0 && <Divider className="my-2.5" />}
              <View className="flex-row items-center">
                <Avatar
                  name={member.name}
                  size="sm"
                  online={member.lastActive === 'En ligne'}
                />
                <View className="flex-1 ml-3">
                  <Text variant="titleMedium">{member.name}</Text>
                  <Text variant="bodySmall" color={theme.textTertiary}>
                    {member.lastActive}
                  </Text>
                </View>
                <Badge
                  variant={member.role === 'admin' ? 'accent' : 'neutral'}
                  size="sm"
                >
                  {member.role === 'admin' ? 'Admin' : 'Employé'}
                </Badge>
              </View>
            </React.Fragment>
          ))}
          <View className="mt-4">
            <Button
              fullWidth
              variant="secondary"
              leftIcon={UserPlus}
              onPress={comingSoon}
            >
              Inviter un utilisateur
            </Button>
          </View>
        </Card>
      </Animated.View>

      {/* Business Settings */}
      <Animated.View entering={FadeInDown.duration(400).delay(200)} className="mb-4">
        <Card>
          <Text variant="headlineSmall" className="mb-3">
            Paramètres de l'agence
          </Text>

          <View className="flex-row items-center mb-3">
            <Banknote size={18} color={theme.textSecondary} strokeWidth={1.8} />
            <Text variant="bodyMedium" className="flex-1 ml-3">
              Frais administratifs
            </Text>
            <Text variant="titleMedium" color={theme.accent}>
              €40
            </Text>
          </View>

          <Divider className="mb-3" />

          <View className="flex-row items-center mb-3">
            <Clock size={18} color={theme.textSecondary} strokeWidth={1.8} />
            <Text variant="bodyMedium" className="flex-1 ml-3">
              Horaires de travail
            </Text>
            <Text variant="titleMedium" color={theme.textSecondary}>
              09:00 - 18:00
            </Text>
          </View>

          <Divider className="mb-3" />

          <View className="flex-row items-center">
            <Bell size={18} color={theme.textSecondary} strokeWidth={1.8} />
            <Text variant="bodyMedium" className="flex-1 ml-3">
              Rappels automatiques
            </Text>
            <Switch
              value={autoReminders}
              onValueChange={(val) => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAutoReminders(val);
              }}
              trackColor={{ false: theme.surfaceTertiary, true: theme.accentSoft }}
              thumbColor={autoReminders ? theme.accent : theme.textTertiary}
            />
          </View>
        </Card>
      </Animated.View>

      {/* Booking Policies */}
      <Animated.View entering={FadeInDown.duration(400).delay(250)} className="mb-8">
        <Card>
          <Text variant="headlineSmall" className="mb-3">
            {t('agency.bookingPolicies', { defaultValue: 'Booking Policies' })}
          </Text>

          <View className="flex-row items-center">
            <CalendarX size={18} color={theme.textSecondary} strokeWidth={1.8} />
            <Text variant="bodyMedium" className="flex-1 ml-3">
              {t('agency.autoCancelUnpaid', { defaultValue: 'Auto-cancel unpaid bookings' })}
            </Text>
            <Switch
              value={autoCancelEnabled}
              onValueChange={(val) => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAutoCancelEnabled(val);
              }}
              trackColor={{ false: theme.surfaceTertiary, true: theme.accentSoft }}
              thumbColor={autoCancelEnabled ? theme.accent : theme.textTertiary}
            />
          </View>

          {autoCancelEnabled && (
            <View className="mt-3">
              <Text variant="bodySmall" color={theme.textSecondary} className="mb-2">
                {t('agency.cancelAfter', { defaultValue: 'Cancel after' })}
              </Text>
              <View className="flex-row gap-2">
                {AUTO_CANCEL_OPTIONS.map((option) => {
                  const isActive = autoCancelHours === option.hours;
                  return (
                    <Pressable
                      key={option.hours}
                      onPress={() => {
                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setAutoCancelHours(option.hours);
                      }}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: 9999,
                        backgroundColor: isActive ? theme.accent : theme.surfaceSecondary,
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        variant="labelSmall"
                        color={isActive ? '#FFFFFF' : theme.textSecondary}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </Card>
      </Animated.View>
    </ScreenWrapper>
  );
}
