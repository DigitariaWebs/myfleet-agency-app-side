import { create } from 'zustand';
import type { Booking, BookingStatus, BookingDraft, BookingOption } from '@/types/booking';
import { mockBookings } from '@/data/bookings';

// ── Types ────────────────────────────────────────────────────────────────────

interface BookingState {
  bookings: Booking[];
  draft: BookingDraft | null;
}

interface BookingActions {
  // Queries
  getBookingsForVehicle: (vehicleId: string) => Booking[];
  getBookingsForDate: (date: string) => Booking[];
  isVehicleAvailable: (vehicleId: string, start: string, end: string) => boolean;

  // Mutations
  createBooking: (dailyRate: number) => Booking | null;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  cancelBooking: (id: string) => void;

  // Draft
  startDraft: () => void;
  updateDraft: (updates: Partial<BookingDraft>) => void;
  toggleDraftOption: (optionId: string) => void;
  discardDraft: () => void;
}

type BookingStore = BookingState & BookingActions;

// ── Helpers ──────────────────────────────────────────────────────────────────

function datesOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
  return s1 < e2 && s2 < e1;
}

const DEFAULT_OPTIONS: BookingOption[] = [
  { id: 'ins', label: 'Insurance Plus', price: 15, enabled: false },
  { id: 'drv', label: 'Additional Driver', price: 10, enabled: false },
  { id: 'gps', label: 'GPS', price: 8, enabled: false },
  { id: 'seat', label: 'Child Seat', price: 5, enabled: false },
];

// ── Store ────────────────────────────────────────────────────────────────────

export const useBookingStore = create<BookingStore>()((set, get) => ({
  bookings: mockBookings,
  draft: null,

  // ── Queries ──────────────────────────────────────────────────────────────

  getBookingsForVehicle: (vehicleId) =>
    get().bookings.filter((b) => b.vehicleId === vehicleId && b.status !== 'cancelled'),

  getBookingsForDate: (date) =>
    get().bookings.filter(
      (b) => b.startDate <= date && b.endDate >= date && b.status !== 'cancelled',
    ),

  isVehicleAvailable: (vehicleId, start, end) => {
    const vehicleBookings = get().bookings.filter(
      (b) =>
        b.vehicleId === vehicleId &&
        b.status !== 'cancelled' &&
        b.status !== 'completed',
    );
    return !vehicleBookings.some((b) => datesOverlap(start, end, b.startDate, b.endDate));
  },

  // ── Mutations ────────────────────────────────────────────────────────────

  createBooking: (dailyRate) => {
    const { draft, bookings } = get();
    if (
      !draft ||
      !draft.vehicleId ||
      !draft.vehicleName ||
      !draft.clientId ||
      !draft.clientName ||
      !draft.startDate ||
      !draft.endDate
    )
      return null;

    const start = new Date(draft.startDate);
    const end = new Date(draft.endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
    const subtotal = dailyRate * days;
    const optionsTotal = draft.options
      .filter((o) => o.enabled)
      .reduce((s, o) => s + o.price * days, 0);

    const booking: Booking = {
      id: `bk-${Date.now()}`,
      vehicleId: draft.vehicleId,
      vehicleName: draft.vehicleName,
      clientId: draft.clientId,
      clientName: draft.clientName,
      startDate: draft.startDate,
      endDate: draft.endDate,
      status: 'confirmed',
      dailyRate,
      totalAmount: subtotal + optionsTotal,
      deposit: Math.round(subtotal * 0.4),
      pickupLocation: draft.pickupLocation,
      returnLocation: draft.returnLocation,
      pickupTime: draft.pickupTime,
      returnTime: draft.returnTime,
      options: draft.options,
      notes: draft.notes,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    set({ bookings: [booking, ...bookings], draft: null });
    return booking;
  },

  updateBookingStatus: (id, status) =>
    set((s) => ({
      bookings: s.bookings.map((b) => (b.id === id ? { ...b, status } : b)),
    })),

  cancelBooking: (id) =>
    set((s) => ({
      bookings: s.bookings.map((b) =>
        b.id === id ? { ...b, status: 'cancelled' as const } : b,
      ),
    })),

  // ── Draft ────────────────────────────────────────────────────────────────

  startDraft: () =>
    set({
      draft: {
        vehicleId: null,
        vehicleName: null,
        clientId: null,
        clientName: null,
        startDate: null,
        endDate: null,
        pickupTime: '09:00',
        returnTime: '18:00',
        pickupLocation: 'Agence Paris Centre',
        returnLocation: 'Agence Paris Centre',
        options: DEFAULT_OPTIONS.map((o) => ({ ...o })),
        notes: '',
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
