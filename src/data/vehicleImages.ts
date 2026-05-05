/**
 * Vehicle image resolution.
 *
 * For existing vehicles (v1-v16): uses local require() assets from Photos-fleet/.
 * For new vehicles (v17-v22): reuses photos from similar existing vehicles
 * until dedicated photos are added.
 */

import type { Vehicle } from "@/types/vehicle";
import { vehicleAssets } from "./vehicleAssets";

/**
 * A source value that can be passed directly to the `Image` component.
 * Either a remote `{ uri }` (preferred — backend-served) or a bundled
 * `require()` asset number (legacy fallback for the v1–v22 mock fleet).
 */
export type VehicleImageSource = { uri: string } | number;

/**
 * Resolve the best image source for a vehicle.
 * Prefers the backend's `thumbnailUrl`, then `images[0].url`, then the
 * legacy bundled photo via `getVehicleImage(id)`. Returns null if none.
 */
export function resolveVehicleImageSource(
  vehicle: Pick<Vehicle, "id" | "thumbnailUrl" | "images"> | null | undefined,
): VehicleImageSource | null {
  if (!vehicle) return null;
  const remote = vehicle.thumbnailUrl ?? vehicle.images?.[0]?.url ?? null;
  if (remote) return { uri: remote };
  const local = getVehicleImage(vehicle.id);
  return local ?? null;
}

/**
 * Maps new vehicle slugs to an existing vehicle's slug whose photos
 * should be shared (same brand / similar model).
 */
const photoAliases: Record<string, string> = {
  // S-Class 2024 → reuse Classe A photos (best Mercedes sedan we have)
  "mercedes-s-class-2024-01": "classe-a",
  "mercedes-s-class-2024-02": "classe-a",
  // V-Class 2025/2026 → reuse Classe V photos (same model line)
  "mercedes-v-class-2025-01": "classe-v",
  "mercedes-v-class-2025-02": "classe-v",
  "mercedes-v-class-2026": "classe-v",
  // CLA 2024 → reuse GLC Coupe photos (closest sporty Mercedes)
  "mercedes-cla-2024": "glc-coupe",
};

/**
 * Vehicle slug → vehicle ID mapping (for reverse lookup).
 */
const slugToId: Record<string, string> = {
  "audi-q5": "v1",
  "bmw-x1": "v2",
  "bmw-x3": "v3",
  "classe-a": "v4",
  "classe-v": "v5",
  fabia: "v6",
  glc: "v7",
  "glc-coupe": "v8",
  golf: "v9",
  karoq: "v10",
  kodiaq: "v11",
  "kodiaq-7-seater": "v12",
  mini: "v13",
  "range-rover": "v14",
  "tayron-r": "v15",
  vito: "v16",
  "mercedes-s-class-2024-01": "v17",
  "mercedes-s-class-2024-02": "v18",
  "mercedes-v-class-2025-01": "v19",
  "mercedes-v-class-2025-02": "v20",
  "mercedes-v-class-2026": "v21",
  "mercedes-cla-2024": "v22",
};

const idToSlug: Record<string, string> = Object.fromEntries(
  Object.entries(slugToId).map(([slug, id]) => [id, slug]),
);

/**
 * Get the local thumbnail require() for a vehicle by ID.
 * Returns the bundled asset number (from require()) or null.
 */
export function getVehicleThumbnail(vehicleId: string): number | null {
  const slug = idToSlug[vehicleId];
  if (!slug) return null;

  // Direct assets
  const assets = vehicleAssets[slug];
  if (assets?.thumbnail) return assets.thumbnail as number;

  // Alias → use another vehicle's photos
  const aliasSlug = photoAliases[slug];
  if (aliasSlug) {
    const aliasAssets = vehicleAssets[aliasSlug];
    if (aliasAssets?.thumbnail) return aliasAssets.thumbnail as number;
  }

  return null;
}

/**
 * Get all local photo require() assets for a vehicle by ID.
 */
export function getVehiclePhotos(vehicleId: string): number[] {
  const slug = idToSlug[vehicleId];
  if (!slug) return [];

  const assets = vehicleAssets[slug];
  if (assets && assets.photos.length > 0) return assets.photos as number[];

  const aliasSlug = photoAliases[slug];
  if (aliasSlug) {
    const aliasAssets = vehicleAssets[aliasSlug];
    if (aliasAssets && aliasAssets.photos.length > 0)
      return aliasAssets.photos as number[];
  }

  return [];
}

/**
 * Legacy API — returns a bundled asset number (not a URL string).
 * Components using this should render with `source={value}` not `source={{ uri: value }}`.
 */
export function getVehicleImage(vehicleId: string): number | null {
  return getVehicleThumbnail(vehicleId);
}
