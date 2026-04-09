import { create } from 'zustand';

interface AgencyState {
  agencyId: string;
  agencyName: string;
  agencyQrUrl: string;
}

interface AgencyActions {
  setAgencyName: (name: string) => void;
}

type AgencyStore = AgencyState & AgencyActions;

export const useAgencyStore = create<AgencyStore>()((set) => ({
  agencyId: 'agency-001',
  agencyName: 'My Fleet Agency',
  agencyQrUrl: 'myfleet.app/agency/agency-001',
  setAgencyName: (name) => set({ agencyName: name }),
}));
