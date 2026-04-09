import { delay, type ApiResponse } from '@/services/api';
import type { Booking } from '@/types/booking';
import { mockBookings } from '@/data/bookings';

export async function getBookings(): Promise<ApiResponse<Booking[]>> {
  await delay();
  return { data: mockBookings, success: true };
}

export async function getBookingById(id: string): Promise<ApiResponse<Booking | null>> {
  await delay();
  const booking = mockBookings.find((b) => b.id === id) ?? null;
  if (!booking) {
    return { data: null, success: false, message: `Booking "${id}" not found` };
  }
  return { data: booking, success: true };
}

export async function createBooking(data: Omit<Booking, 'id'>): Promise<ApiResponse<Booking>> {
  await delay();
  return { data: { ...data, id: `bk-${Date.now()}` }, success: true, message: 'Booking created' };
}

export async function updateBooking(
  id: string,
  data: Partial<Omit<Booking, 'id'>>
): Promise<ApiResponse<Booking>> {
  await delay();
  const existing = mockBookings.find((b) => b.id === id);
  if (!existing) {
    return { data: {} as Booking, success: false, message: `Booking "${id}" not found` };
  }
  return { data: { ...existing, ...data }, success: true, message: 'Updated' };
}

export async function cancelBooking(id: string): Promise<ApiResponse<Booking>> {
  await delay();
  const existing = mockBookings.find((b) => b.id === id);
  if (!existing) {
    return { data: {} as Booking, success: false, message: `Booking "${id}" not found` };
  }
  return { data: { ...existing, status: 'cancelled' }, success: true, message: 'Cancelled' };
}
