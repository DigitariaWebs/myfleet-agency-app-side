import {
  ApiClientError,
  authedRequest,
  type ApiResponse,
} from "@/services/api";
import { ok, toQuery } from "@/services/_helpers";
import type { Booking } from "@/types/booking";

interface CreateBookingPayload {
  vehicleId: string;
  clientId: string;
  startDate: string;
  endDate: string;
  pickupTime?: string;
  returnTime?: string;
  pickupLocation?: string;
  returnLocation?: string;
  notes?: string;
  options?: Booking["options"];
  insurance?: { tier: "basic" | "all_inclusive" };
  deposit?: number;
  paymentMethod?: "online" | "cash";
  force?: boolean;
}

export interface BookingFilters {
  status?: Booking["status"];
  vehicleId?: string;
  clientId?: string;
  paymentStatus?: NonNullable<Booking["paymentStatus"]>;
  source?: NonNullable<Booking["source"]>;
  from?: string;
  to?: string;
  conflict?: boolean;
}

export async function getBookings(
  filters: BookingFilters = {},
): Promise<ApiResponse<Booking[]>> {
  const data = await authedRequest<Booking[]>(`/bookings${toQuery(filters)}`);
  return ok(data);
}

export async function getActiveRentals(): Promise<ApiResponse<Booking[]>> {
  const data = await authedRequest<Booking[]>("/bookings/active-rentals");
  return ok(data);
}

export async function getUpcomingReturns(
  date?: string,
): Promise<ApiResponse<Booking[]>> {
  const qs = date ? `?date=${encodeURIComponent(date)}` : "";
  const data = await authedRequest<Booking[]>(
    `/bookings/upcoming-returns${qs}`,
  );
  return ok(data);
}

export async function getBookingConflicts(): Promise<ApiResponse<Booking[]>> {
  const data = await authedRequest<Booking[]>("/bookings/conflicts");
  return ok(data);
}

export async function getBookingById(
  id: string,
): Promise<ApiResponse<Booking>> {
  const data = await authedRequest<Booking>(`/bookings/${id}`);
  return ok(data);
}

export interface CreateBookingResult {
  booking?: Booking;
  conflict?: { conflictingBookingIds: string[] };
}

export async function createBooking(
  payload: CreateBookingPayload,
): Promise<ApiResponse<CreateBookingResult>> {
  try {
    const booking = await authedRequest<Booking>("/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return ok({ booking });
  } catch (err) {
    if (err instanceof ApiClientError && err.status === 409) {
      const details = err.details as
        | { conflictingBookingIds?: string[] }
        | undefined;
      return ok({
        conflict: {
          conflictingBookingIds: details?.conflictingBookingIds ?? [],
        },
      });
    }
    throw err;
  }
}

export async function updateBooking(
  id: string,
  patch: Partial<
    Pick<
      Booking,
      | "notes"
      | "pickupLocation"
      | "returnLocation"
      | "pickupTime"
      | "returnTime"
      | "workflow"
      | "status"
    >
  >,
): Promise<ApiResponse<Booking>> {
  const data = await authedRequest<Booking>(`/bookings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return ok(data);
}

export async function cancelBooking(id: string): Promise<ApiResponse<Booking>> {
  const data = await authedRequest<Booking>(`/bookings/${id}/cancel`, {
    method: "POST",
  });
  return ok(data);
}

export async function startPickup(id: string): Promise<ApiResponse<Booking>> {
  const data = await authedRequest<Booking>(`/bookings/${id}/start-pickup`, {
    method: "POST",
  });
  return ok(data);
}

export async function recordStartMileage(
  id: string,
  km: number,
): Promise<ApiResponse<Booking>> {
  const data = await authedRequest<Booking>(
    `/bookings/${id}/record-start-mileage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ km }),
    },
  );
  return ok(data);
}

export interface CloseBookingPayload {
  returnMileage: number;
  fuelLevel?: number;
  notes?: string;
  postInspectionId?: string;
}

export async function closeBooking(
  id: string,
  payload: CloseBookingPayload,
): Promise<ApiResponse<{ booking: Booking; invoiceId: string | null }>> {
  const data = await authedRequest<{
    booking: Booking;
    invoiceId: string | null;
  }>(`/bookings/${id}/close`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return ok(data);
}

export interface ExtendBookingPayload {
  newEndDate: string;
  newReturnLocation?: string;
  newReturnTime?: string;
}

export interface ExtendBookingResult {
  booking?: Booking;
  conflict?: { conflictingBookingIds: string[] };
}

export async function extendBooking(
  id: string,
  payload: ExtendBookingPayload,
): Promise<ApiResponse<ExtendBookingResult>> {
  try {
    const booking = await authedRequest<Booking>(`/bookings/${id}/extend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return ok({ booking });
  } catch (err) {
    if (err instanceof ApiClientError && err.status === 409) {
      const details = err.details as
        | { conflictingBookingIds?: string[] }
        | undefined;
      return ok({
        conflict: {
          conflictingBookingIds: details?.conflictingBookingIds ?? [],
        },
      });
    }
    throw err;
  }
}

export async function getVehicleAvailability(
  vehicleId: string,
  from: string,
  to: string,
): Promise<
  ApiResponse<{ available: boolean; conflictingBookingIds: string[] }>
> {
  const data = await authedRequest<{
    available: boolean;
    conflictingBookingIds: string[];
  }>(
    `/bookings/${vehicleId}/availability?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
  );
  return ok(data);
}

export async function createPaymentLink(
  id: string,
): Promise<ApiResponse<Booking>> {
  const data = await authedRequest<Booking>(`/bookings/${id}/payment-link`, {
    method: "POST",
  });
  return ok(data);
}

export async function markCashPaid(id: string): Promise<ApiResponse<Booking>> {
  const data = await authedRequest<Booking>(`/bookings/${id}/mark-cash-paid`, {
    method: "POST",
  });
  return ok(data);
}

export async function deleteBooking(
  id: string,
): Promise<ApiResponse<{ id: string; deleted: true }>> {
  const data = await authedRequest<{ id: string; deleted: true }>(
    `/bookings/${id}`,
    { method: "DELETE" },
  );
  return ok(data);
}
