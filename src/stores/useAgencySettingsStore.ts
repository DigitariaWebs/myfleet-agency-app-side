import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AutoCancelHours = 24 | 48 | 72 | 168;

interface BookingPolicies {
  autoCancelUnpaid: boolean;
  autoCancelAfterHours: AutoCancelHours;
}

interface AgencySettingsState {
  bookingPolicies: BookingPolicies;
}

interface AgencySettingsActions {
  setAutoCancelEnabled: (enabled: boolean) => void;
  setAutoCancelHours: (hours: AutoCancelHours) => void;
}

type AgencySettingsStore = AgencySettingsState & AgencySettingsActions;

export const useAgencySettingsStore = create<AgencySettingsStore>()(
  persist(
    (set) => ({
      bookingPolicies: {
        autoCancelUnpaid: true,
        autoCancelAfterHours: 72,
      },
      setAutoCancelEnabled: (enabled) =>
        set((s) => ({
          bookingPolicies: { ...s.bookingPolicies, autoCancelUnpaid: enabled },
        })),
      setAutoCancelHours: (hours) =>
        set((s) => ({
          bookingPolicies: { ...s.bookingPolicies, autoCancelAfterHours: hours },
        })),
    }),
    {
      name: 'my-fleet-agency-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
