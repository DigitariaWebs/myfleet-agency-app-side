import React, { useState, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ChevronLeft } from 'lucide-react-native';

import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Chip, ChipGroup } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { useTheme } from '@/hooks/useTheme';
import { useToastStore } from '@/components/ui/Toast';
import { useClientStore } from '@/stores/useClientStore';
import type { Client, ClientTag, IDType } from '@/types/client';

// ── ID Type options ────────────────────────────────────────────────────────

interface IDTypeOption {
  key: IDType;
  label: string;
}

const ID_TYPE_OPTIONS: IDTypeOption[] = [
  { key: 'passport', label: 'Passeport' },
  { key: 'national-id', label: 'CNI' },
  { key: 'driving-license', label: 'Permis' },
];

// ── Tag options ────────────────────────────────────────────────────────────

interface TagOption {
  key: ClientTag;
  label: string;
}

const TAG_OPTIONS: TagOption[] = [
  { key: 'vip', label: 'VIP' },
  { key: 'corporate', label: 'Corporate' },
  { key: 'frequent', label: 'Fréquent' },
];

// ── Section Header ─────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  index: number;
}

function SectionHeader({ title, index }: SectionHeaderProps) {
  const theme = useTheme();
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(400).springify()}
      className="mt-6 mb-3"
    >
      <Text variant="titleMedium" color={theme.textSecondary}>
        {title}
      </Text>
    </Animated.View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────

export default function NewClientScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const showToast = useToastStore((s) => s.show);
  const addClient = useClientStore((s) => s.addClient);

  // Personal info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // Identity
  const [idType, setIdType] = useState<IDType>('national-id');
  const [idNumber, setIdNumber] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [driverLicenseExpiry, setDriverLicenseExpiry] = useState('');

  // Tags
  const [selectedTags, setSelectedTags] = useState<ClientTag[]>([]);

  // Notes
  const [notes, setNotes] = useState('');

  const handleToggleTag = useCallback((tag: ClientTag) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const handleSubmit = useCallback(() => {
    if (!firstName.trim() || !lastName.trim()) {
      showToast({
        variant: 'error',
        title: 'Champs requis',
        message: 'Le prénom et le nom sont obligatoires.',
      });
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newClient: Client = {
      id: `c-${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      dateOfBirth: dateOfBirth.trim(),
      idType,
      idNumber: idNumber.trim(),
      driverLicense: driverLicense.trim(),
      driverLicenseExpiry: driverLicenseExpiry.trim(),
      tags: selectedTags,
      flagReason: null,
      totalBookings: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      notes: notes.trim(),
    };

    addClient(newClient);

    showToast({
      variant: 'success',
      title: 'Client ajouté',
      message: `${newClient.firstName} ${newClient.lastName} a été ajouté avec succès.`,
    });

    router.back();
  }, [
    firstName,
    lastName,
    email,
    phone,
    address,
    dateOfBirth,
    idType,
    idNumber,
    driverLicense,
    driverLicenseExpiry,
    selectedTags,
    notes,
    addClient,
    showToast,
    router,
  ]);

  return (
    <ScreenWrapper scroll>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="flex-row items-center pt-6 pb-4"
      >
        <Pressable onPress={() => router.back()} className="mr-3">
          <ChevronLeft size={24} color={theme.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text variant="headlineLarge" className="flex-1">
          {t('clients.new', { defaultValue: 'Nouveau client' })}
        </Text>
      </Animated.View>

      {/* ── Section: Informations personnelles ────────────────────── */}
      <SectionHeader title="Informations personnelles" index={0} />

      <Animated.View entering={FadeInDown.delay(100).duration(400).springify()}>
        <Input
          label="Prénom"
          placeholder="Jean"
          value={firstName}
          onChangeText={setFirstName}
          className="mb-3"
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(140).duration(400).springify()}>
        <Input
          label="Nom"
          placeholder="Dupont"
          value={lastName}
          onChangeText={setLastName}
          className="mb-3"
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180).duration(400).springify()}>
        <Input
          label="Email"
          placeholder="jean.dupont@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          className="mb-3"
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(220).duration(400).springify()}>
        <Input
          label="Téléphone"
          placeholder="+33 6 12 34 56 78"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          className="mb-3"
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(260).duration(400).springify()}>
        <Input
          label="Adresse"
          placeholder="14 Rue de la Paix, 75002 Paris"
          value={address}
          onChangeText={setAddress}
          className="mb-3"
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400).springify()}>
        <Input
          label="Date de naissance"
          placeholder="1990-01-15"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          className="mb-3"
        />
      </Animated.View>

      {/* ── Section: Pièce d'identité ─────────────────────────────── */}
      <SectionHeader title="Pièce d'identité" index={1} />

      <Animated.View entering={FadeInDown.delay(360).duration(400).springify()}>
        <Text variant="bodySmall" color={theme.textSecondary} className="mb-2">
          Type de pièce
        </Text>
        <ChipGroup className="mb-3">
          {ID_TYPE_OPTIONS.map((opt) => (
            <Chip
              key={opt.key}
              label={opt.label}
              selected={idType === opt.key}
              onPress={() => setIdType(opt.key)}
            />
          ))}
        </ChipGroup>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400).springify()}>
        <Input
          label="Numéro de pièce"
          placeholder="880315 123 456 78"
          value={idNumber}
          onChangeText={setIdNumber}
          className="mb-3"
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(440).duration(400).springify()}>
        <Input
          label="Permis de conduire"
          placeholder="12AB34567"
          value={driverLicense}
          onChangeText={setDriverLicense}
          className="mb-3"
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(480).duration(400).springify()}>
        <Input
          label="Expiration du permis"
          placeholder="2030-01-15"
          value={driverLicenseExpiry}
          onChangeText={setDriverLicenseExpiry}
          className="mb-3"
        />
      </Animated.View>

      {/* ── Section: Tags ─────────────────────────────────────────── */}
      <SectionHeader title="Tags" index={2} />

      <Animated.View entering={FadeInDown.delay(540).duration(400).springify()}>
        <ChipGroup className="mb-3">
          {TAG_OPTIONS.map((opt) => (
            <Chip
              key={opt.key}
              label={opt.label}
              selected={selectedTags.includes(opt.key)}
              onPress={() => handleToggleTag(opt.key)}
            />
          ))}
        </ChipGroup>
      </Animated.View>

      {/* ── Section: Notes ────────────────────────────────────────── */}
      <SectionHeader title="Notes" index={3} />

      <Animated.View entering={FadeInDown.delay(600).duration(400).springify()}>
        <Input
          placeholder="Notes sur le client..."
          value={notes}
          onChangeText={setNotes}
          multiline
          className="mb-6"
        />
      </Animated.View>

      <Divider className="mb-6" />

      {/* Submit button */}
      <Animated.View
        entering={FadeInDown.delay(660).duration(400).springify()}
        className="mb-8"
      >
        <Button variant="primary" fullWidth onPress={handleSubmit}>
          Ajouter le client
        </Button>
      </Animated.View>
    </ScreenWrapper>
  );
}
