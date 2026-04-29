import { apiRequest } from "@/services/api";

export interface UploadedSignupDocument {
  key: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export async function uploadSignupDocument(file: {
  uri: string;
  name: string;
  mimeType: string;
}): Promise<UploadedSignupDocument> {
  const formData = new FormData();
  formData.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  } as unknown as Blob);

  return apiRequest<UploadedSignupDocument>("/storage/signup-upload", {
    method: "POST",
    body: formData,
  });
}
