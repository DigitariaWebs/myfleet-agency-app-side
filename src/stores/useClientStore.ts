import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { Client } from '@/types/client';

// ── Types ────────────────────────────────────────────────────────────────────

interface ClientState {
  selectedClient: Client | null;
  searchQuery: string;
}

interface ClientActions {
  selectClient: (client: Client | null) => void;
  setSearchQuery: (query: string) => void;
}

type ClientStore = ClientState & ClientActions;

// ── Store ────────────────────────────────────────────────────────────────────

export const useClientStore = create<ClientStore>()((set) => ({
  // State
  selectedClient: null,
  searchQuery: '',

  // Actions
  selectClient: (client) => set({ selectedClient: client }),

  setSearchQuery: (query) => set({ searchQuery: query }),
}));

// ── Selectors ────────────────────────────────────────────────────────────────

export function useClientSearchQuery(): string {
  return useClientStore(useShallow((state) => state.searchQuery));
}
