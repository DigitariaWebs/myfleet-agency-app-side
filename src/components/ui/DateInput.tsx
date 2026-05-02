import React, { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';

import { Text } from './Text';
import { useTheme } from '@/hooks/useTheme';

interface DateInputProps {
  label: string;
  value: string; // ISO date string (YYYY-MM-DD) or empty
  onChange: (isoDate: string) => void;
  placeholder?: string;
}

function parseDate(value: string): Date {
  if (!value) return new Date();
  const d = new Date(value + 'T00:00:00');
  return isNaN(d.getTime()) ? new Date() : d;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function DateInput({ label, value, onChange, placeholder }: DateInputProps) {
  const theme = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const date = parseDate(value);
  const displayValue = value
    ? date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';

  const handleChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selected) {
      onChange(formatDate(selected));
    }
  };

  return (
    <View className="mb-3">
      <Text variant="caption" color={theme.textSecondary} className="mb-1.5">
        {label}
      </Text>
      <Pressable
        onPress={() => setShowPicker(true)}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: theme.borderLight,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: theme.surface,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text
          color={displayValue ? theme.textPrimary : theme.textTertiary}
        >
          {displayValue || placeholder || 'Sélectionner une date'}
        </Text>
        <Calendar size={18} color={theme.textTertiary} strokeWidth={1.8} />
      </Pressable>

      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleChange}
        />
      )}

      {showPicker && Platform.OS === 'ios' && (
        <DateTimePicker
          value={date}
          mode="date"
          display="spinner"
          onChange={handleChange}
        />
      )}
    </View>
  );
}
