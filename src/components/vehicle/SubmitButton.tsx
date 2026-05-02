import React from "react";
import { Button } from "@/components/ui/Button";
import type { ManagedPhoto } from "./useVehiclePhotoUploads";

interface SubmitButtonProps {
  photos: ManagedPhoto[];
  isSaving: boolean;
  defaultLabel: string;
  onPress: () => void;
}

export function SubmitButton({
  photos,
  isSaving,
  defaultLabel,
  onPress,
}: SubmitButtonProps) {
  const uploadingCount = photos.filter((p) => p.status === "uploading").length;
  const failedCount = photos.filter((p) => p.status === "failed").length;
  const uploadedCount = photos.filter((p) => p.status === "uploaded").length;
  const total = photos.length;
  const hasFailed = failedCount > 0;
  const isUploading = uploadingCount > 0;

  const label = isSaving
    ? "Saving vehicle…"
    : isUploading
      ? `Uploading photos (${uploadedCount}/${total})…`
      : hasFailed
        ? `${failedCount} upload${failedCount > 1 ? "s" : ""} failed — tap to retry`
        : defaultLabel;

  return (
    <Button
      variant="primary"
      size="lg"
      fullWidth
      loading={isSaving}
      disabled={isSaving || hasFailed || isUploading}
      onPress={onPress}
    >
      {label}
    </Button>
  );
}
