import { create } from 'zustand';
import type { Vehicle, VehicleStatus, VehicleCategory } from '@/types/vehicle';

// ── Types ────────────────────────────────────────────────────────────────────

interface FleetFilters {
  status: VehicleStatus | null;
  category: VehicleCategory | null;
  search: string;
}

interface FleetState {
  selectedVehicle: Vehicle | null;
  filters: FleetFilters;
}

interface FleetActions {
  setFilter: <K extends keyof FleetFilters>(key: K, value: FleetFilters[K]) => void;
  selectVehicle: (vehicle: Vehicle | null) => void;
}

type FleetStore = FleetState & FleetActions;

// ── Store ────────────────────────────────────────────────────────────────────

export const useFleetStore = create<FleetStore>()((set) => ({
  // State
  selectedVehicle: null,
  filters: {
    status: null,
    category: null,
    search: '',
  },

  // Actions
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  selectVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
}));
