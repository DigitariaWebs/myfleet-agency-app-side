import type { Contract, ContractClause, ContractParty } from '@/types/contract';

const AGENCY: ContractParty = {
  name: 'My Fleet SAS',
  address: '45 Avenue des Champs-Élysées, 75008 Paris',
  phone: '+33 1 42 56 78 90',
  email: 'contact@myfleet.fr',
};

export const CONTRACT_CLAUSES: ContractClause[] = [
  { id: 'cl1', title: 'Limitation de kilométrage', content: 'Le locataire dispose de 250 km par jour inclus. Tout kilomètre supplémentaire sera facturé à 0,25 € HT/km.' },
  { id: 'cl2', title: 'Restrictions géographiques', content: 'Le véhicule ne peut pas quitter le territoire français métropolitain sans autorisation écrite préalable du loueur.' },
  { id: 'cl3', title: 'Responsabilité en cas de dommage', content: 'Le locataire est responsable de tout dommage causé au véhicule pendant la durée de la location. La franchise applicable est de 800 € sauf souscription de l\'option assurance tous risques.' },
  { id: 'cl4', title: 'Pénalités de retard', content: 'Tout retard de restitution supérieur à 2 heures entraînera la facturation d\'une journée supplémentaire. Au-delà de 24 heures, des pénalités de 50 € par jour de retard seront appliquées.' },
  { id: 'cl5', title: 'Infractions routières', content: 'Le locataire est responsable de toutes les infractions commises pendant la durée de la location. Les amendes seront refacturées avec des frais de traitement de 20 €.' },
  { id: 'cl6', title: 'Politique carburant', content: 'Le véhicule est remis avec le réservoir plein. Il doit être restitué avec le même niveau de carburant. En cas de restitution avec un niveau inférieur, le carburant manquant sera facturé au tarif de 2,50 €/litre.' },
  { id: 'cl7', title: 'Conditions d\'annulation', content: 'Annulation gratuite jusqu\'à 48 heures avant la prise en charge. Entre 48 et 24 heures : 50 % du montant. Moins de 24 heures : 100 % du montant.' },
];

function makeContract(
  id: string,
  ref: string,
  bookingId: string | null,
  vehicleId: string,
  vehicleName: string,
  clientId: string,
  clientName: string,
  status: Contract['status'],
  createdAt: string,
  startDate: string,
  endDate: string,
  dailyRate: number,
  totalAmount: number,
  deposit: number,
  clientEmail: string,
  clientPhone: string,
  clientAddress: string,
  mileage: number,
  fuelLevel: number,
  hasSigs: boolean,
): Contract {
  return {
    id,
    reference: ref,
    bookingId,
    vehicleId,
    vehicleName,
    clientId,
    clientName,
    status,
    createdAt,
    startDate,
    endDate,
    dailyRate,
    totalAmount,
    deposit,
    pickupLocation: 'Agence Paris Centre',
    returnLocation: 'Agence Paris Centre',
    lessor: AGENCY,
    lessee: {
      name: clientName,
      address: clientAddress,
      phone: clientPhone,
      email: clientEmail,
      idNumber: 'FR' + Math.random().toString().slice(2, 12),
      licenseNumber: Math.random().toString(36).slice(2, 12).toUpperCase(),
    },
    vehicleInfo: {
      brand: vehicleName.split(' ')[0],
      model: vehicleName,
      year: 2024,
      licensePlate: 'FG-' + Math.floor(100 + Math.random() * 900) + '-HK',
      mileageAtPickup: mileage,
      fuelLevelAtPickup: fuelLevel,
      knownDamages: status === 'active' ? 'Aucun' : 'Légère rayure côté droit',
    },
    clauses: CONTRACT_CLAUSES,
    clientSignature: hasSigs
      ? { base64: 'mock-sig-client', signedAt: createdAt, signerName: clientName }
      : null,
    agentSignature: hasSigs
      ? { base64: 'mock-sig-agent', signedAt: createdAt, signerName: 'Agent Fleet' }
      : null,
    notes: '',
  };
}

export const mockContracts: Contract[] = [
  // Active (with signatures)
  makeContract('ct1', 'MF-2026-0042', 'bk1', 'v2', 'BMW X1', 'c1', 'Mehdi Benali', 'active', '2026-04-03', '2026-04-03', '2026-04-10', 130, 910, 500, 'mehdi.benali@gmail.com', '+33 6 12 34 56 78', '14 Rue de la Paix, 75002 Paris', 12100, 95, true),
  makeContract('ct2', 'MF-2026-0043', 'bk2', 'v7', 'GLC', 'c5', 'Karim Haddad', 'active', '2026-04-01', '2026-04-01', '2026-04-12', 190, 2090, 800, 'karim.haddad@laposte.net', '+33 7 12 89 45 67', '30 Rue de la République, 13001 Marseille', 15200, 90, true),
  makeContract('ct3', 'MF-2026-0044', 'bk4', 'v14', 'Range Rover', 'c4', 'Claire Martin', 'active', '2026-04-02', '2026-04-02', '2026-04-08', 250, 1500, 1000, 'claire.martin@free.fr', '+33 6 34 56 78 12', '5 Rue Victor Hugo, 69002 Lyon', 3200, 100, true),
  makeContract('ct4', 'MF-2026-0045', 'bk5', 'v15', 'Tayron R', 'c7', 'Antoine Moreau', 'active', '2026-04-06', '2026-04-06', '2026-04-13', 160, 1120, 500, 'antoine.moreau@gmail.com', '+33 6 23 78 12 56', '7 Rue des Lices, 35000 Rennes', 5100, 100, true),
  // Pending signature
  makeContract('ct5', 'MF-2026-0046', 'bk6', 'v1', 'Audi Q5', 'c2', 'Sophie Durand', 'pending-signature', '2026-04-08', '2026-04-15', '2026-04-22', 180, 1260, 600, 'sophie.durand@outlook.fr', '+33 6 98 76 54 32', '8 Avenue des Champs-Élysées, 75008 Paris', 34200, 85, false),
  makeContract('ct6', 'MF-2026-0047', 'bk7', 'v5', 'Classe V', 'c3', 'Youssef El Amrani', 'pending-signature', '2026-04-08', '2026-04-18', '2026-04-25', 200, 1400, 700, 'youssef.elamrani@yahoo.fr', '+33 7 45 23 67 89', '22 Boulevard Gambetta, 06000 Nice', 27600, 90, false),
  makeContract('ct7', 'MF-2026-0048', 'bk8', 'v12', 'Kodiaq 7 Seater', 'c6', 'Isabelle Leroy', 'pending-signature', '2026-04-08', '2026-04-20', '2026-04-28', 145, 1160, 500, 'isabelle.leroy@sfr.fr', '+33 6 67 45 23 98', '18 Place Bellecour, 69002 Lyon', 9700, 100, false),
  // Draft
  makeContract('ct8', 'MF-2026-0049', 'bk9', 'v10', 'Karoq', 'c8', 'Fatima Zahra', 'draft', '2026-04-08', '2026-04-12', '2026-04-14', 100, 200, 200, 'fatima.zahra@hotmail.fr', '+33 7 56 34 12 90', '12 Avenue Jean Jaurès, 31000 Toulouse', 29800, 80, false),
  // Expired
  makeContract('ct9', 'MF-2026-0030', 'bk14', 'v3', 'BMW X3', 'c7', 'Antoine Moreau', 'expired', '2026-03-28', '2026-03-28', '2026-04-03', 170, 1020, 600, 'antoine.moreau@gmail.com', '+33 6 23 78 12 56', '7 Rue des Lices, 35000 Rennes', 40200, 85, true),
  makeContract('ct10', 'MF-2026-0031', 'bk15', 'v8', 'GLC Coupé', 'c6', 'Isabelle Leroy', 'expired', '2026-03-01', '2026-03-01', '2026-03-08', 210, 1470, 700, 'isabelle.leroy@sfr.fr', '+33 6 67 45 23 98', '18 Place Bellecour, 69002 Lyon', 31200, 90, true),
  makeContract('ct11', 'MF-2026-0032', 'bk19', 'v14', 'Range Rover', 'c3', 'Youssef El Amrani', 'expired', '2026-03-18', '2026-03-18', '2026-03-25', 250, 1750, 1000, 'youssef.elamrani@yahoo.fr', '+33 7 45 23 67 89', '22 Boulevard Gambetta, 06000 Nice', 3100, 100, true),
  // Terminated
  makeContract('ct12', 'MF-2026-0033', 'bk21', 'v13', 'Mini', 'c4', 'Claire Martin', 'terminated', '2026-02-25', '2026-03-01', '2026-03-05', 75, 300, 150, 'claire.martin@free.fr', '+33 6 34 56 78 12', '5 Rue Victor Hugo, 69002 Lyon', 22600, 80, false),
];
