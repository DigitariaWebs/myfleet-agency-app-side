/**
 * Auto-generated from scanning assets/Photos-fleet/ and assets/Videos-fleet/
 * Vehicle folder name → list of local image requires + optional video path
 *
 * Photos are bundled via require() (small files, ~1-2MB each).
 * Videos are NOT bundled — they are 67-359MB MOV files and must be loaded
 * at runtime via expo-asset or expo-file-system. We store relative paths
 * as strings here; the VideoPlayer component handles loading.
 */

type AssetRequire = ReturnType<typeof require>;

export interface VehicleAssetEntry {
  photos: AssetRequire[];
  /** Relative paths to video files (NOT require'd — too large to bundle) */
  videoPaths: string[];
  hasVideo: boolean;
  thumbnail: AssetRequire;
}

export const vehicleAssets: Record<string, VehicleAssetEntry> = {
  // ── Audi Q5 ─────────────────────────────────────────────────────────────────
  'audi-q5': {
    photos: [
      require('../../assets/Photos-fleet/Audi Q5/Audi Q5 - 1.jpg'),
      require('../../assets/Photos-fleet/Audi Q5/Audi Q5 - 2.jpg'),
      require('../../assets/Photos-fleet/Audi Q5/Audi Q5 - 3.jpg'),
      require('../../assets/Photos-fleet/Audi Q5/Audi Q5 - 4.jpg'),
      require('../../assets/Photos-fleet/Audi Q5/Audi Q5 - 5.jpg'),
    ],
    videoPaths: ['Videos-fleet/Audi Q5/interior.MOV'],
    hasVideo: true,
    thumbnail: require('../../assets/Photos-fleet/Audi Q5/Audi Q5 - 1.jpg'),
  },

  // ── BMW X1 ──────────────────────────────────────────────────────────────────
  'bmw-x1': {
    photos: [
      require('../../assets/Photos-fleet/BMW X1/X1 - 1.jpg'),
      require('../../assets/Photos-fleet/BMW X1/X1 - 2.jpg'),
      require('../../assets/Photos-fleet/BMW X1/X1 - 3.jpg'),
      require('../../assets/Photos-fleet/BMW X1/X1 - 4.jpg'),
    ],
    videoPaths: ['Photos-fleet/BMW X1/interior.MOV'],
    hasVideo: true,
    thumbnail: require('../../assets/Photos-fleet/BMW X1/X1 - 1.jpg'),
  },

  // ── BMW X3 ──────────────────────────────────────────────────────────────────
  'bmw-x3': {
    photos: [
      require('../../assets/Photos-fleet/BMW X3/BMW X3 - 1.jpg'),
      require('../../assets/Photos-fleet/BMW X3/BMW X3 - 2.jpg'),
      require('../../assets/Photos-fleet/BMW X3/BMW X3 - 3.jpg'),
      require('../../assets/Photos-fleet/BMW X3/BMW X3 - 4.jpg'),
      require('../../assets/Photos-fleet/BMW X3/BMW X3 - 5.jpg'),
    ],
    videoPaths: ['Videos-fleet/BMW X3/interior.MOV'],
    hasVideo: true,
    thumbnail: require('../../assets/Photos-fleet/BMW X3/BMW X3 - 1.jpg'),
  },

  // ── Classe A (Mercedes-Benz A-Class) ────────────────────────────────────────
  'classe-a': {
    photos: [
      require('../../assets/Photos-fleet/Classe A/Classe A - 1.jpg'),
      require('../../assets/Photos-fleet/Classe A/Classe A - 2.jpg'),
      require('../../assets/Photos-fleet/Classe A/Classe A - 3.jpg'),
      require('../../assets/Photos-fleet/Classe A/Classe A - 4.jpg'),
      require('../../assets/Photos-fleet/Classe A/Classe A - 5.jpg'),
      require('../../assets/Photos-fleet/Classe A/Classe A - 6.jpg'),
      require('../../assets/Photos-fleet/Classe A/Classe A - 7.jpg'),
      require('../../assets/Photos-fleet/Classe A/Classe A - 8.jpg'),
    ],
    videoPaths: ['Photos-fleet/Classe A/interior.MOV'],
    hasVideo: true,
    thumbnail: require('../../assets/Photos-fleet/Classe A/Classe A - 1.jpg'),
  },

  // ── Classe V (Mercedes-Benz V-Class) ────────────────────────────────────────
  'classe-v': {
    photos: [
      require('../../assets/Photos-fleet/Classe V/Classe V - 1.jpg'),
      require('../../assets/Photos-fleet/Classe V/Classe V - 2.jpg'),
      require('../../assets/Photos-fleet/Classe V/Classe V - 3.jpg'),
      require('../../assets/Photos-fleet/Classe V/Classe V - 4.jpg'),
      require('../../assets/Photos-fleet/Classe V/Classe V - 5.jpg'),
      require('../../assets/Photos-fleet/Classe V/Classe V - 6.jpg'),
      require('../../assets/Photos-fleet/Classe V/Classe V - 7.jpg'),
      require('../../assets/Photos-fleet/Classe V/Classe V - 8.jpg'),
      require('../../assets/Photos-fleet/Classe V/Classe V - 9.jpg'),
    ],
    videoPaths: ['Photos-fleet/Classe V/interior.MOV'],
    hasVideo: true,
    thumbnail: require('../../assets/Photos-fleet/Classe V/Classe V - 1.jpg'),
  },

  // ── Fabia (Škoda) ──────────────────────────────────────────────────────────
  'fabia': {
    photos: [
      require('../../assets/Photos-fleet/Fabia/Fabia - 1.jpg'),
      require('../../assets/Photos-fleet/Fabia/Fabia - 2.jpg'),
      require('../../assets/Photos-fleet/Fabia/Fabia - 3.jpg'),
      require('../../assets/Photos-fleet/Fabia/Fabia - 4.jpg'),
    ],
    videoPaths: ['Photos-fleet/Fabia/interior.MOV'],
    hasVideo: true,
    thumbnail: require('../../assets/Photos-fleet/Fabia/Fabia - 1.jpg'),
  },

  // ── GLC (Mercedes-Benz) ────────────────────────────────────────────────────
  'glc': {
    photos: [
      require('../../assets/Photos-fleet/GLC/GLC - 1.jpg'),
      require('../../assets/Photos-fleet/GLC/GLC - 2.jpg'),
      require('../../assets/Photos-fleet/GLC/GLC - 3.jpg'),
      require('../../assets/Photos-fleet/GLC/GLC - 4.jpg'),
      require('../../assets/Photos-fleet/GLC/GLC - 5.jpg'),
    ],
    videoPaths: ['Photos-fleet/GLC/interior.MOV'],
    hasVideo: true,
    thumbnail: require('../../assets/Photos-fleet/GLC/GLC - 1.jpg'),
  },

  // ── GLC Coupe (Mercedes-Benz) ──────────────────────────────────────────────
  'glc-coupe': {
    photos: [
      require('../../assets/Photos-fleet/GLC Coupe/GLC Coupe - 1.jpg'),
      require('../../assets/Photos-fleet/GLC Coupe/GLC Coupe - 2.jpg'),
      require('../../assets/Photos-fleet/GLC Coupe/GLC Coupe - 3.jpg'),
      require('../../assets/Photos-fleet/GLC Coupe/GLC Coupe - 4.jpg'),
      require('../../assets/Photos-fleet/GLC Coupe/GLC Coupe - 5.jpg'),
    ],
    videoPaths: ['Videos-fleet/GLC Coupe/interior.MOV'],
    hasVideo: true,
    thumbnail: require('../../assets/Photos-fleet/GLC Coupe/GLC Coupe - 1.jpg'),
  },

  // ── Golf (Volkswagen) ──────────────────────────────────────────────────────
  'golf': {
    photos: [
      require('../../assets/Photos-fleet/Golf/Golf - 1.jpg'),
      require('../../assets/Photos-fleet/Golf/Golf - 2.jpg'),
      require('../../assets/Photos-fleet/Golf/Golf - 3.jpg'),
      require('../../assets/Photos-fleet/Golf/Golf - 4.jpg'),
      require('../../assets/Photos-fleet/Golf/Golf - 5.jpg'),
    ],
    videoPaths: ['Photos-fleet/Golf/interior.MOV'],
    hasVideo: true,
    thumbnail: require('../../assets/Photos-fleet/Golf/Golf - 1.jpg'),
  },

  // ── Karoq (Škoda) ─────────────────────────────────────────────────────────
  'karoq': {
    photos: [
      require('../../assets/Photos-fleet/Karoq/Karoq - 1.jpg'),
      require('../../assets/Photos-fleet/Karoq/Karoq - 2.jpg'),
      require('../../assets/Photos-fleet/Karoq/Karoq - 3.jpg'),
      require('../../assets/Photos-fleet/Karoq/Karoq - 4.jpg'),
      require('../../assets/Photos-fleet/Karoq/Karoq - 5.jpg'),
    ],
    videoPaths: ['Photos-fleet/Karoq/interior.MOV'],
    hasVideo: true,
    thumbnail: require('../../assets/Photos-fleet/Karoq/Karoq - 1.jpg'),
  },

  // ── Kodiaq (Škoda) ─────────────────────────────────────────────────────────
  'kodiaq': {
    photos: [
      require('../../assets/Photos-fleet/Kodiaq/Kodiaq - 1.jpg'),
      require('../../assets/Photos-fleet/Kodiaq/Kodiaq - 2.jpg'),
      require('../../assets/Photos-fleet/Kodiaq/Kodiaq - 3.jpg'),
      require('../../assets/Photos-fleet/Kodiaq/Kodiaq - 4.jpg'),
      require('../../assets/Photos-fleet/Kodiaq/Kodiaq - 5.jpg'),
    ],
    videoPaths: ['Photos-fleet/Kodiaq/interior.MOV'],
    hasVideo: true,
    thumbnail: require('../../assets/Photos-fleet/Kodiaq/Kodiaq - 1.jpg'),
  },

  // ── Kodiaq 7 seater (Škoda) ────────────────────────────────────────────────
  'kodiaq-7-seater': {
    photos: [
      require('../../assets/Photos-fleet/Kodiaq 7 seater/Kodiaq 7 seater - 1.jpg'),
      require('../../assets/Photos-fleet/Kodiaq 7 seater/Kodiaq 7 seater - 2.jpg'),
      require('../../assets/Photos-fleet/Kodiaq 7 seater/Kodiaq 7 seater - 3.jpg'),
      require('../../assets/Photos-fleet/Kodiaq 7 seater/Kodiaq 7 seater - 4.jpg'),
      require('../../assets/Photos-fleet/Kodiaq 7 seater/Kodiaq 7 seater - 5.jpg'),
    ],
    videoPaths: ['Videos-fleet/Kodiaq 7 seater/interior.MOV'],
    hasVideo: true,
    thumbnail: require('../../assets/Photos-fleet/Kodiaq 7 seater/Kodiaq 7 seater - 1.jpg'),
  },

  // ── Mini (Mini Cooper) ─────────────────────────────────────────────────────
  'mini': {
    photos: [
      require('../../assets/Photos-fleet/Mini/Mini - 1.jpg'),
      require('../../assets/Photos-fleet/Mini/Mini - 2.jpg'),
      require('../../assets/Photos-fleet/Mini/Mini - 3.jpg'),
      require('../../assets/Photos-fleet/Mini/Mini - 4.jpg'),
      require('../../assets/Photos-fleet/Mini/Mini - 5.jpg'),
    ],
    videoPaths: ['Photos-fleet/Mini/interior.MOV'],
    hasVideo: true,
    thumbnail: require('../../assets/Photos-fleet/Mini/Mini - 1.jpg'),
  },

  // ── Range Rover (Land Rover) ───────────────────────────────────────────────
  'range-rover': {
    photos: [
      require('../../assets/Photos-fleet/Range Rover/Range Rover - 1.jpg'),
      require('../../assets/Photos-fleet/Range Rover/Range Rover - 2.jpg'),
      require('../../assets/Photos-fleet/Range Rover/Range Rover - 3.jpg'),
      require('../../assets/Photos-fleet/Range Rover/Range Rover - 4.jpg'),
      require('../../assets/Photos-fleet/Range Rover/Range Rover - 5.jpg'),
      require('../../assets/Photos-fleet/Range Rover/Range Rover - 6.jpg'),
      require('../../assets/Photos-fleet/Range Rover/Range Rover - 7.jpg'),
      require('../../assets/Photos-fleet/Range Rover/Range Rover - 8.jpg'),
    ],
    videoPaths: ['Photos-fleet/Range Rover/interior.MOV'],
    hasVideo: true,
    thumbnail: require('../../assets/Photos-fleet/Range Rover/Range Rover - 1.jpg'),
  },

  // ── Tayron R (Volkswagen) ──────────────────────────────────────────────────
  'tayron-r': {
    photos: [
      require('../../assets/Photos-fleet/Tayron R/Tayron R - 1.jpg'),
      require('../../assets/Photos-fleet/Tayron R/Tayron R - 2.jpg'),
      require('../../assets/Photos-fleet/Tayron R/Tayron R - 3.jpg'),
      require('../../assets/Photos-fleet/Tayron R/Tayron R - 4.jpg'),
      require('../../assets/Photos-fleet/Tayron R/Tayron R - 5.jpg'),
    ],
    videoPaths: ['Videos-fleet/Tayron R/interior.MOV'],
    hasVideo: true,
    thumbnail: require('../../assets/Photos-fleet/Tayron R/Tayron R - 1.jpg'),
  },

  // ── Vito (Mercedes-Benz) ───────────────────────────────────────────────────
  'vito': {
    photos: [
      require('../../assets/Photos-fleet/Vito/Vito - 1.jpg'),
      require('../../assets/Photos-fleet/Vito/Vito - 2.jpg'),
      require('../../assets/Photos-fleet/Vito/Vito - 3.jpg'),
      require('../../assets/Photos-fleet/Vito/Vito - 4.jpg'),
      require('../../assets/Photos-fleet/Vito/Vito - 5.jpg'),
      require('../../assets/Photos-fleet/Vito/Vito - 6.jpg'),
      require('../../assets/Photos-fleet/Vito/Vito - 7.jpg'),
      require('../../assets/Photos-fleet/Vito/Vito - 8.jpg'),
      require('../../assets/Photos-fleet/Vito/Vito - 9.jpg'),
      require('../../assets/Photos-fleet/Vito/Vito - 10.jpg'),
    ],
    videoPaths: ['Photos-fleet/Vito/interior.MOV'],
    hasVideo: true,
    thumbnail: require('../../assets/Photos-fleet/Vito/Vito - 1.jpg'),
  },

  // ── NEW VEHICLES (no local assets yet — use placeholder images) ────────────

  'mercedes-s-class-2024-01': {
    photos: [],
    videoPaths: [],
    hasVideo: false,
    thumbnail: null as unknown as AssetRequire,
  },

  'mercedes-s-class-2024-02': {
    photos: [],
    videoPaths: [],
    hasVideo: false,
    thumbnail: null as unknown as AssetRequire,
  },

  'mercedes-v-class-2025-01': {
    photos: [],
    videoPaths: [],
    hasVideo: false,
    thumbnail: null as unknown as AssetRequire,
  },

  'mercedes-v-class-2025-02': {
    photos: [],
    videoPaths: [],
    hasVideo: false,
    thumbnail: null as unknown as AssetRequire,
  },

  'mercedes-v-class-2026': {
    photos: [],
    videoPaths: [],
    hasVideo: false,
    thumbnail: null as unknown as AssetRequire,
  },

  'mercedes-cla-2024': {
    photos: [],
    videoPaths: [],
    hasVideo: false,
    thumbnail: null as unknown as AssetRequire,
  },
};

/** Lookup helper — returns asset entry or null */
export function getVehicleAssets(slug: string): VehicleAssetEntry | null {
  return vehicleAssets[slug] ?? null;
}

// New vehicles (v17-v22) have no dedicated photos yet.
// vehicleImages.ts aliases them to similar existing vehicles' photos.
