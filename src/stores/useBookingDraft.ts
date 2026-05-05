import { create } from "zustand";
import type { BookingDraft, BookingOption } from "@/types/booking";

interface BookingDraftState {
  draft: BookingDraft | null;
  startDraft: () => void;
  updateDraft: (updates: Partial<BookingDraft>) => void;
  toggleDraftOption: (optionId: string) => void;
  discardDraft: () => void;
}

const DEFAULT_OPTIONS: BookingOption[] = [
  { id: "ins", label: "Insurance Plus", price: 15, enabled: false },
  { id: "drv", label: "Additional Driver", price: 10, enabled: false },
  { id: "foreign-use", label: "Foreign Use Pass", price: 25, enabled: false },
  { id: "seat", label: "Child Seat", price: 5, enabled: false },
];

export const useBookingDraft = create<BookingDraftState>()((set) => ({
  draft: null,

  startDraft: () =>
    set({
      draft: {
        vehicleId: null,
        vehicleName: null,
        clientId: null,
        clientName: null,
        startDate: null,
        endDate: null,
        pickupTime: "09:00",
        returnTime: "18:00",
        pickupLocation: "Agence Paris Centre",
        returnLocation: "Agence Paris Centre",
        options: DEFAULT_OPTIONS.map((o) => ({ ...o })),
        notes: "",
      },
    }),

  updateDraft: (updates) =>
    set((s) => (s.draft ? { draft: { ...s.draft, ...updates } } : s)),

  toggleDraftOption: (optionId) =>
    set((s) => {
      if (!s.draft) return s;
      const options = s.draft.options.map((o) =>
        o.id === optionId ? { ...o, enabled: !o.enabled } : o,
      );
      return { draft: { ...s.draft, options } };
    }),

  discardDraft: () => set({ draft: null }),
}));
