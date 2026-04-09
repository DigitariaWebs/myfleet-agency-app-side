export interface PaymentLinkConfig {
  bookingId: string;
  amount: number;           // in centimes (CHF)
  currency: 'chf';
  clientEmail: string;
  clientName: string;
  vehicleName: string;
  rentalDates: { start: string; end: string };
  expiresIn: number;        // hours until link expires (default: 72)
}

export interface PaymentLink {
  url: string;
  expiresAt: string;
  createdAt: string;
}

// Simulated — returns a mock Stripe payment link URL
export function generatePaymentLink(config: PaymentLinkConfig): PaymentLink {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.expiresIn * 60 * 60 * 1000);

  return {
    url: `https://pay.myfleet.app/booking/${config.bookingId}`,
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
  };
}
