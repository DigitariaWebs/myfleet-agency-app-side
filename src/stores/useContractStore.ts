import { create } from 'zustand';
import type { Contract, ContractStatus, SignatureData } from '@/types/contract';
import { mockContracts, CONTRACT_CLAUSES } from '@/data/contracts';
import { mockBookings } from '@/data/bookings';
import { mockClients } from '@/data/clients';

// ── Types ────────────────────────────────────────────────────────────────────

interface ContractState {
  contracts: Contract[];
}

interface ContractActions {
  createContractFromBooking: (bookingId: string) => Contract | null;
  signContract: (
    contractId: string,
    clientSig: SignatureData,
    agentSig: SignatureData,
  ) => void;
  updateContractStatus: (id: string, status: ContractStatus) => void;
}

type ContractStore = ContractState & ContractActions;

// ── Store ────────────────────────────────────────────────────────────────────

export const useContractStore = create<ContractStore>()((set, get) => ({
  contracts: mockContracts,

  createContractFromBooking: (bookingId) => {
    const booking = mockBookings.find((b) => b.id === bookingId);
    if (!booking) return null;

    const client = mockClients.find((c) => c.id === booking.clientId);
    const seq = get().contracts.length + 1;
    const ref = `MF-2026-${String(seq).padStart(4, '0')}`;

    const contract: Contract = {
      id: `ct-${Date.now()}`,
      reference: ref,
      bookingId,
      vehicleId: booking.vehicleId,
      vehicleName: booking.vehicleName,
      clientId: booking.clientId,
      clientName: booking.clientName,
      status: 'draft',
      createdAt: new Date().toISOString().slice(0, 10),
      startDate: booking.startDate,
      endDate: booking.endDate,
      dailyRate: booking.dailyRate,
      totalAmount: booking.totalAmount,
      deposit: booking.deposit,
      pickupLocation: booking.pickupLocation,
      returnLocation: booking.returnLocation,
      lessor: {
        name: 'My Fleet SAS',
        address: '45 Avenue des Champs-Élysées, 75008 Paris',
        phone: '+33 1 42 56 78 90',
        email: 'contact@myfleet.fr',
      },
      lessee: {
        name: booking.clientName,
        address: client?.address ?? '',
        phone: client?.phone ?? '',
        email: client?.email ?? '',
        idNumber: client?.driverLicense,
        licenseNumber: client?.driverLicense,
      },
      vehicleInfo: {
        brand: booking.vehicleName.split(' ')[0],
        model: booking.vehicleName,
        year: 2024,
        licensePlate: '',
        mileageAtPickup: 0,
        fuelLevelAtPickup: 100,
        knownDamages: 'Aucun',
      },
      clauses: CONTRACT_CLAUSES,
      clientSignature: null,
      agentSignature: null,
      notes: '',
    };

    set((s) => ({ contracts: [contract, ...s.contracts] }));
    return contract;
  },

  signContract: (contractId, clientSig, agentSig) =>
    set((s) => ({
      contracts: s.contracts.map((c) =>
        c.id === contractId
          ? { ...c, clientSignature: clientSig, agentSignature: agentSig, status: 'active' as ContractStatus }
          : c,
      ),
    })),

  updateContractStatus: (id, status) =>
    set((s) => ({
      contracts: s.contracts.map((c) => (c.id === id ? { ...c, status } : c)),
    })),
}));
