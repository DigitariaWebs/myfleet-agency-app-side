import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelBooking,
  closeBooking,
  createBooking,
  createPaymentLink,
  extendBooking,
  getActiveRentals,
  getBookingById,
  getBookingConflicts,
  getBookings,
  getUpcomingReturns,
  getVehicleAvailability,
  recordStartMileage,
  startPickup,
  updateBooking,
  type BookingFilters,
  type CloseBookingPayload,
  type CreateBookingResult,
  type ExtendBookingPayload,
  type ExtendBookingResult,
} from "@/services/bookingService";
import type { Booking } from "@/types/booking";

export const bookingKeys = {
  all: ["bookings"] as const,
  list: (filters?: BookingFilters) =>
    [...bookingKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...bookingKeys.all, "detail", id] as const,
  activeRentals: () => [...bookingKeys.all, "active-rentals"] as const,
  upcomingReturns: (date?: string) =>
    [...bookingKeys.all, "upcoming-returns", date ?? "today"] as const,
  conflicts: () => [...bookingKeys.all, "conflicts"] as const,
  availability: (vehicleId: string, from: string, to: string) =>
    [...bookingKeys.all, "availability", vehicleId, from, to] as const,
};

// ── Queries ─────────────────────────────────────────────────────────────────

export function useBookings(filters?: BookingFilters) {
  return useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: async () => (await getBookings(filters)).data ?? [],
    staleTime: 30_000,
  });
}

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.detail(id ?? "_"),
    queryFn: async () => (await getBookingById(id as string)).data,
    enabled: typeof id === "string" && id.length > 0,
    staleTime: 10_000,
  });
}

export function useActiveRentals() {
  return useQuery({
    queryKey: bookingKeys.activeRentals(),
    queryFn: async () => (await getActiveRentals()).data ?? [],
    staleTime: 30_000,
  });
}

export function useUpcomingReturns(date?: string) {
  return useQuery({
    queryKey: bookingKeys.upcomingReturns(date),
    queryFn: async () => (await getUpcomingReturns(date)).data ?? [],
    staleTime: 30_000,
  });
}

export function useBookingConflicts() {
  return useQuery({
    queryKey: bookingKeys.conflicts(),
    queryFn: async () => (await getBookingConflicts()).data ?? [],
    staleTime: 30_000,
  });
}

export function useBookingAvailability(
  vehicleId: string | undefined,
  from: string | undefined,
  to: string | undefined,
) {
  return useQuery({
    queryKey: bookingKeys.availability(
      vehicleId ?? "_",
      from ?? "_",
      to ?? "_",
    ),
    queryFn: async () =>
      (
        await getVehicleAvailability(
          vehicleId as string,
          from as string,
          to as string,
        )
      ).data,
    enabled: Boolean(vehicleId && from && to),
    staleTime: 5_000,
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

function invalidateBookings(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: bookingKeys.all });
}

function setBookingDetail(
  qc: ReturnType<typeof useQueryClient>,
  booking: Booking,
) {
  qc.setQueryData(bookingKeys.detail(booking.id), booking);
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: Parameters<typeof createBooking>[0],
    ): Promise<CreateBookingResult> => {
      const res = await createBooking(payload);
      if (!res.data) throw new Error("Failed to create booking");
      return res.data;
    },
    onSuccess: (result) => {
      invalidateBookings(qc);
      if (result.booking) setBookingDetail(qc, result.booking);
    },
  });
}

export function useUpdateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Parameters<typeof updateBooking>[1];
    }) => {
      const res = await updateBooking(id, patch);
      if (!res.data) throw new Error("Failed to update booking");
      return res.data;
    },
    onSuccess: (booking) => {
      invalidateBookings(qc);
      setBookingDetail(qc, booking);
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await cancelBooking(id);
      if (!res.data) throw new Error("Failed to cancel booking");
      return res.data;
    },
    onSuccess: (booking) => {
      invalidateBookings(qc);
      setBookingDetail(qc, booking);
    },
  });
}

export function useStartPickup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await startPickup(id);
      if (!res.data) throw new Error("Failed to start pickup");
      return res.data;
    },
    onSuccess: (booking) => {
      invalidateBookings(qc);
      setBookingDetail(qc, booking);
    },
  });
}

export function useRecordStartMileage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, km }: { id: string; km: number }) => {
      const res = await recordStartMileage(id, km);
      if (!res.data) throw new Error("Failed to record start mileage");
      return res.data;
    },
    onSuccess: (booking) => {
      invalidateBookings(qc);
      setBookingDetail(qc, booking);
    },
  });
}

export function useCloseBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: CloseBookingPayload;
    }) => {
      const res = await closeBooking(id, payload);
      if (!res.data) throw new Error("Failed to close booking");
      return res.data;
    },
    onSuccess: ({ booking }) => {
      invalidateBookings(qc);
      setBookingDetail(qc, booking);
    },
  });
}

export function useExtendBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: ExtendBookingPayload;
    }): Promise<ExtendBookingResult> => {
      const res = await extendBooking(id, payload);
      if (!res.data) throw new Error("Failed to extend booking");
      return res.data;
    },
    onSuccess: (result) => {
      invalidateBookings(qc);
      if (result.booking) setBookingDetail(qc, result.booking);
    },
  });
}

export function useCreatePaymentLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await createPaymentLink(id);
      if (!res.data) throw new Error("Failed to create payment link");
      return res.data;
    },
    onSuccess: (booking) => {
      invalidateBookings(qc);
      setBookingDetail(qc, booking);
    },
  });
}
