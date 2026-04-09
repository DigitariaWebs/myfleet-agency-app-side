import { delay, type ApiResponse } from '@/services/api';
import type { Inspection, DamageAnnotation } from '@/types/inspection';
import { mockInspections } from '@/data/inspections';

export async function getInspections(): Promise<ApiResponse<Inspection[]>> {
  await delay();
  return { data: mockInspections, success: true };
}

export async function getInspectionById(
  id: string
): Promise<ApiResponse<Inspection | null>> {
  await delay();
  const inspection = mockInspections.find((i) => i.id === id) ?? null;
  if (!inspection) {
    return { data: null, success: false, message: `Inspection "${id}" not found` };
  }
  return { data: inspection, success: true };
}

export async function createInspection(
  data: Omit<Inspection, 'id'>
): Promise<ApiResponse<Inspection>> {
  await delay();
  const newInspection: Inspection = { ...data, id: `insp-${Date.now()}` };
  return { data: newInspection, success: true, message: 'Inspection created' };
}

export async function addAnnotation(
  inspectionId: string,
  photoIndex: number,
  annotation: DamageAnnotation
): Promise<ApiResponse<Inspection>> {
  await delay();
  const existing = mockInspections.find((i) => i.id === inspectionId);
  if (!existing) {
    return { data: {} as Inspection, success: false, message: `Inspection "${inspectionId}" not found` };
  }
  const photos = existing.photos.map((p, i) =>
    i === photoIndex ? { ...p, annotations: [...p.annotations, annotation] } : p
  );
  const updated: Inspection = { ...existing, photos };
  return { data: updated, success: true, message: 'Annotation added' };
}
