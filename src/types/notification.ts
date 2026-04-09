export type NotificationType =
  | 'booking_reminder'
  | 'return_due'
  | 'return_overdue'
  | 'inspection_required'
  | 'violation_received'
  | 'payment_received'
  | 'payment_overdue'
  | 'maintenance_due'
  | 'contract_pending'
  | 'marketing_campaign';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  targetRoute: string | null;
  targetId: string | null;
}
