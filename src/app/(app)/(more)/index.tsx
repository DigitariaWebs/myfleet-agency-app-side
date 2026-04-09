import React from 'react';
import { View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import {
  FileText,
  AlertTriangle,
  Users,
  Receipt,
  BarChart3,
  QrCode,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/useAuthStore';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

export default function MoreScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const menuItems: MenuItem[] = [
    {
      icon: FileText,
      label: t('more.contracts', { defaultValue: 'Contrats' }),
      onPress: () => router.push('/(app)/(more)/contracts'),
    },
    {
      icon: AlertTriangle,
      label: t('more.violations', { defaultValue: 'Infractions' }),
      onPress: () => router.push('/(app)/(more)/violations'),
    },
    {
      icon: Users,
      label: t('more.clients', { defaultValue: 'Clients' }),
      onPress: () => router.push('/(app)/(more)/clients'),
    },
    {
      icon: Receipt,
      label: t('more.billing', { defaultValue: 'Facturation' }),
      onPress: () => router.push('/(app)/(more)/billing'),
    },
    {
      icon: BarChart3,
      label: t('more.analytics', { defaultValue: 'Analytique' }),
      onPress: () => router.push('/(app)/(more)/analytics'),
    },
    {
      icon: QrCode,
      label: t('more.qrCode', { defaultValue: 'My QR Code' }),
      onPress: () => router.push('/(app)/(more)/agency-qr'),
    },
    {
      icon: Settings,
      label: t('more.settings', { defaultValue: 'Paramètres' }),
      onPress: () => router.push('/(app)/(more)/settings'),
    },
    {
      icon: Bell,
      label: t('more.notifications', { defaultValue: 'Notifications' }),
      onPress: () => router.push('/(app)/(more)/notifications'),
    },
    {
      icon: LogOut,
      label: t('more.logout', { defaultValue: 'Déconnexion' }),
      danger: true,
      onPress: () => {
        logout();
        router.replace('/');
      },
    },
  ];

  return (
    <ScreenWrapper scroll>
      <View className="pt-6 pb-4">
        <Text variant="headlineLarge">
          {t('more.title', { defaultValue: 'Plus' })}
        </Text>
      </View>

      <View
        style={{ backgroundColor: theme.surface }}
        className="rounded-2xl overflow-hidden"
      >
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isLast = index === menuItems.length - 1;
          const iconColor = item.danger ? theme.danger : theme.textSecondary;
          const labelColor = item.danger ? theme.danger : theme.textPrimary;

          return (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              className="flex-row items-center py-4 px-4"
              style={
                !isLast
                  ? { borderBottomWidth: 1, borderBottomColor: theme.border }
                  : undefined
              }
            >
              <Icon size={22} color={iconColor} strokeWidth={1.8} />
              <Text
                variant="bodyLarge"
                color={labelColor}
                className="flex-1 ml-4"
              >
                {item.label}
              </Text>
              {!item.danger && (
                <ChevronRight
                  size={20}
                  color={theme.textTertiary}
                  strokeWidth={1.8}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </ScreenWrapper>
  );
}
