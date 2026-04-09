import { create } from 'zustand';
import type { Vehicle, VehicleStatus, VehicleCategory } from '@/types/vehicle';

// ── Types ────────────────────────────────────────────────────────────────────

interface FleetFilters {
  status: VehicleStatus | null;
  category: VehicleCategory | null;
  search: string;
}

interface FleetState {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  filters: FleetFilters;
}

interface FleetActions {
  setVehicles: (vehicles: Vehicle[]) => void;
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  setFilter: <K extends keyof FleetFilters>(key: K, value: FleetFilters[K]) => void;
  selectVehicle: (vehicle: Vehicle | null) => void;
}

type FleetStore = FleetState & FleetActions;

// ── Store ────────────────────────────────────────────────────────────────────

export const useFleetStore = create<FleetStore>()((set) => ({
  // State
  vehicles: [],
  selectedVehicle: null,
  filters: {
    status: null,
    category: null,
    search: '',
  },

  // Actions
  setVehicles: (vehicles) => set({ vehicles }),

  addVehicle: (vehicle) =>
    set((state) => ({
      vehicles: [...state.vehicles, vehicle],
    })),

  updateVehicle: (id, updates) =>
    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        v.id === id ? { ...v, ...updates } : v,
      ),
      selectedVehicle:
        state.selectedVehicle?.id === id
          ? { ...state.selectedVehicle, ...updates }
          : state.selectedVehicle,
    })),

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  selectVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
}));
