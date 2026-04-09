import { create } from 'zustand';
import { mockViolations } from '@/data/violations';
import type { Violation, ViolationStatus } from '@/types/violation';

// ── Types ────────────────────────────────────────────────────────────────────

interface ViolationState {
  violations: Violation[];
}

interface ViolationActions {
  addViolation: (violation: Violation) => void;
  updateViolationStatus: (id: string, status: ViolationStatus) => void;
  getTotalFines: () => number;
  getPendingCount: () => number;
}

type ViolationStore = ViolationState & ViolationActions;

// ── Store ────────────────────────────────────────────────────────────────────

export const useViolationStore = create<ViolationStore>()((set, get) => ({
  // State — pre-loaded with mock data
  violations: mockViolations,

  // Actions
  addViolation: (violation) =>
    set((state) => ({
      violations: [...state.violations, violation],
    })),

  updateViolationStatus: (id, status) =>
    set((state) => ({
      violations: state.violations.map((v) =>
        v.id === id ? { ...v, status } : v,
      ),
    })),

  getTotalFines: () =>
    get().violations.reduce((sum, v) => sum + v.totalCharge, 0),

  getPendingCount: () =>
    get().violations.filter(
      (v) => v.status === 'received' || v.status === 'client-identified',
    ).length,
}));
