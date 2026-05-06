import type { Booking } from "@/types/booking";

export const PICKUP_EARLY_WINDOW_MS = 2 * 60 * 60 * 1000;

export type PickupEligibility =
  | { kind: "ok" }
  | { kind: "already-handed-off"; pickupCompletedAt: string }
  | { kind: "too-early"; earliestAt: Date }
  | { kind: "closed"; status: Booking["status"] };

export function getPickupEligibility(
  booking: Pick<Booking, "status" | "startDate" | "workflow">,
  now: Date = new Date(),
): PickupEligibility {
  if (booking.status === "completed" || booking.status === "cancelled") {
    return { kind: "closed", status: booking.status };
  }
  if (booking.workflow?.pickupCompletedAt) {
    return {
      kind: "already-handed-off",
      pickupCompletedAt: booking.workflow.pickupCompletedAt,
    };
  }
  const startMs = Date.parse(`${booking.startDate}T00:00:00`);
  if (!Number.isFinite(startMs)) return { kind: "ok" };
  const earliestMs = startMs - PICKUP_EARLY_WINDOW_MS;
  if (now.getTime() < earliestMs) {
    return { kind: "too-early", earliestAt: new Date(earliestMs) };
  }
  return { kind: "ok" };
}
