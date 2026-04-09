export type RootTabParamList = {
  index: undefined;
  explore: undefined;
};

export type VehicleDetailParams = {
  vehicleId: string;
};

export type BookingDetailParams = {
  bookingId: string;
};

export type ClientDetailParams = {
  clientId: string;
};

export type InspectionParams = {
  bookingId: string;
  vehicleId: string;
  type: 'pre-rental' | 'post-rental';
};

export type ContractParams = {
  contractId: string;
};

export type ViolationParams = {
  violationId: string;
};
