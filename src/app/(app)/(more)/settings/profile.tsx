import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { ChevronLeft, Camera } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/components/ui/Toast';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const showToast = useToastStore((s) => s.show);

  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] ?? '');
  const [lastName, setLastName] = useState(
    user?.name?.split(' ').slice(1).join(' ') ?? '',
  );
  const [phone, setPhone] = useState('+33 6 12 34 56 78');

  const handleSave = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showToast({
      variant: 'success',
      title: 'Profil mis à jour',
      message: 'Vos informations ont été enregistrées.',
    });
  };

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
          Profil
        </Text>
      </Animated.View>

      {/* Avatar with camera overlay */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(50)}
        className="items-center mb-6"
      >
        <Pressable
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            showToast({
              variant: 'info',
              title: 'Coming soon',
              message: 'Le changement de photo sera disponible prochainement.',
            });
          }}
        >
          <Avatar name={user?.name} size="xl" />
          <View
            style={{ backgroundColor: theme.accent }}
            className="absolute bottom-0 right-0 rounded-full p-1.5"
          >
            <Camera size={14} color="#0A0A0F" strokeWidth={2} />
          </View>
        </Pressable>
      </Animated.View>

      {/* Form */}
      <Animated.View entering={FadeInDown.duration(400).delay(100)} className="mb-4">
        <Input
          label="Prénom"
          placeholder="Votre prénom"
          value={firstName}
          onChangeText={setFirstName}
          className="mb-4"
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(150)} className="mb-4">
        <Input
          label="Nom"
          placeholder="Votre nom"
          value={lastName}
          onChangeText={setLastName}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(200)} className="mb-4">
        <Input
          label="Email"
          placeholder="Email"
          value={user?.email ?? ''}
          disabled
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(250)} className="mb-4">
        <Input
          label="Téléphone"
          placeholder="+33 6 00 00 00 00"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </Animated.View>

      {/* Role badge */}
      <Animated.View entering={FadeInDown.duration(400).delay(300)} className="mb-6">
        <Text
          variant="titleSmall"
          color={theme.textSecondary}
          className="mb-1.5 px-1"
        >
          Rôle
        </Text>
        <Badge variant="accent" size="lg">
          {user?.role === 'admin' ? 'Administrateur' : 'Employé'}
        </Badge>
      </Animated.View>

      {/* Save Button */}
      <Animated.View entering={FadeInDown.duration(400).delay(350)} className="mb-8">
        <Button fullWidth onPress={handleSave}>
          Enregistrer
        </Button>
      </Animated.View>
    </ScreenWrapper>
  );
}
