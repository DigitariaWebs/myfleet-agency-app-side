import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteClientDocument,
  listClientDocuments,
  uploadClientDocument,
  type ClientDocumentType,
} from "@/services/clientService";
import { clientKeys } from "./useClients";

export const clientDocumentKeys = {
  all: ["client-documents"] as const,
  list: (clientId: string) =>
    [...clientDocumentKeys.all, "list", clientId] as const,
};

export function useClientDocuments(clientId: string) {
  return useQuery({
    queryKey: clientDocumentKeys.list(clientId),
    queryFn: () => listClientDocuments(clientId),
    enabled: !!clientId,
  });
}

export function useUploadClientDocument(clientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      type,
      uri,
      fileName,
    }: {
      type: ClientDocumentType;
      uri: string;
      fileName?: string;
    }) => uploadClientDocument(clientId, type, uri, fileName),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: clientDocumentKeys.list(clientId),
      });
      // Upload sets agency_client.verified_at server-side, so the client
      // detail also refetches.
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(clientId) });
    },
  });
}

export function useDeleteClientDocument(clientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => deleteClientDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: clientDocumentKeys.list(clientId),
      });
    },
  });
}
