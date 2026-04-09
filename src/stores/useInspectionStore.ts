import { create } from 'zustand';
import type {
  Inspection,
  InspectionDraft,
  InspectionType,
  CapturedPhoto,
  DamageAnnotation,
  PhotoAngle,
  AIDetectionResult,
} from '@/types/inspection';
import { PHOTO_ANGLES } from '@/types/inspection';
import { mockInspections } from '@/data/inspections';

// ── Types ────────────────────────────────────────────────────────────────────

interface InspectionState {
  inspections: Inspection[];
  draft: InspectionDraft | null;
}

interface InspectionActions {
  setInspections: (inspections: Inspection[]) => void;
  addInspection: (inspection: Inspection) => void;

  // Draft flow
  startInspection: (
    vehicleId: string,
    vehicleName: string,
    type: InspectionType,
    bookingId?: string,
    clientName?: string,
  ) => void;
  capturePhoto: (
    angle: PhotoAngle,
    uri: string,
    aiResult: AIDetectionResult | null,
  ) => void;
  retakePhoto: (angleIndex: number) => void;
  nextAngle: () => void;
  addAnnotation: (photoIndex: number, annotation: DamageAnnotation) => void;
  removeAnnotation: (photoIndex: number, annotationId: string) => void;
  updateDraftNotes: (notes: string) => void;
  updateDraftMileage: (mileage: number) => void;
  updateDraftFuelLevel: (level: number) => void;
  submitInspection: () => Inspection | null;
  saveDraft: () => void;
  discardDraft: () => void;
}

type InspectionStore = InspectionState & InspectionActions;

// ── Store ────────────────────────────────────────────────────────────────────

export const useInspectionStore = create<InspectionStore>()((set, get) => ({
  inspections: mockInspections,
  draft: null,

  setInspections: (inspections) => set({ inspections }),

  addInspection: (inspection) =>
    set((s) => ({ inspections: [inspection, ...s.inspections] })),

  startInspection: (vehicleId, vehicleName, type, bookingId, clientName) =>
    set({
      draft: {
        vehicleId,
        vehicleName,
        bookingId: bookingId ?? null,
        clientName: clientName ?? null,
        type,
        currentAngleIndex: 0,
        photos: [],
        mileage: 0,
        fuelLevel: 100,
        notes: '',
      },
    }),

  capturePhoto: (angle, uri, aiResult) =>
    set((s) => {
      if (!s.draft) return s;
      const photo: CapturedPhoto = {
        angle,
        uri,
        timestamp: new Date().toISOString(),
        aiResult,
        annotations: [],
      };
      // Replace if same angle exists, otherwise append
      const existing = s.draft.photos.findIndex((p) => p.angle === angle);
      const photos =
        existing >= 0
          ? s.draft.photos.map((p, i) => (i === existing ? photo : p))
          : [...s.draft.photos, photo];
      return { draft: { ...s.draft, photos } };
    }),

  retakePhoto: (angleIndex) =>
    set((s) => {
      if (!s.draft) return s;
      const photos = s.draft.photos.filter((_, i) => i !== angleIndex);
      return { draft: { ...s.draft, photos } };
    }),

  nextAngle: () =>
    set((s) => {
      if (!s.draft) return s;
      const next = Math.min(
        s.draft.currentAngleIndex + 1,
        PHOTO_ANGLES.length - 1,
      );
      return { draft: { ...s.draft, currentAngleIndex: next } };
    }),

  addAnnotation: (photoIndex, annotation) =>
    set((s) => {
      if (!s.draft) return s;
      const photos = s.draft.photos.map((p, i) =>
        i === photoIndex
          ? { ...p, annotations: [...p.annotations, annotation] }
          : p,
      );
      return { draft: { ...s.draft, photos } };
    }),

  removeAnnotation: (photoIndex, annotationId) =>
    set((s) => {
      if (!s.draft) return s;
      const photos = s.draft.photos.map((p, i) =>
        i === photoIndex
          ? {
              ...p,
              annotations: p.annotations.filter((a) => a.id !== annotationId),
            }
          : p,
      );
      return { draft: { ...s.draft, photos } };
    }),

  updateDraftNotes: (notes) =>
    set((s) => (s.draft ? { draft: { ...s.draft, notes } } : s)),

  updateDraftMileage: (mileage) =>
    set((s) => (s.draft ? { draft: { ...s.draft, mileage } } : s)),

  updateDraftFuelLevel: (level) =>
    set((s) => (s.draft ? { draft: { ...s.draft, fuelLevel: level } } : s)),

  submitInspection: () => {
    const { draft, inspections } = get();
    if (!draft) return null;

    const totalAI = draft.photos.reduce(
      (sum, p) => sum + (p.aiResult?.damagesFound ?? 0),
      0,
    );
    const totalManual = draft.photos.reduce(
      (sum, p) => sum + p.annotations.length,
      0,
    );

    const inspection: Inspection = {
      id: `insp-${Date.now()}`,
      vehicleId: draft.vehicleId,
      vehicleName: draft.vehicleName,
      bookingId: draft.bookingId,
      clientName: draft.clientName,
      type: draft.type,
      status: 'completed',
      date: new Date().toISOString().slice(0, 10),
      inspectorName: 'Agent Fleet',
      photos: draft.photos,
      mileage: draft.mileage,
      fuelLevel: draft.fuelLevel,
      notes: draft.notes,
      totalDamagesAI: totalAI,
      totalDamagesManual: totalManual,
    };

    set({ inspections: [inspection, ...inspections], draft: null });
    return inspection;
  },

  saveDraft: () => {
    // In a real app, persist to AsyncStorage
    // For now, just keep the draft in state
  },

  discardDraft: () => set({ draft: null }),
}));
