/**
 * Money helpers for the cents-based API boundary.
 *
 * The database and API always operate in the smallest currency unit
 * (cents / centimes / Rappen). UI code may work in whole units and
 * convert at the service boundary using these helpers.
 */

/** Convert integer cents to whole currency units (e.g. 18000 → 180). */
export function centsToUnits(cents: number): number {
  return cents / 100;
}

/** Convert whole currency units to integer cents (e.g. 180 → 18000). */
export function unitsToCents(units: number): number {
  return Math.round(units * 100);
}
