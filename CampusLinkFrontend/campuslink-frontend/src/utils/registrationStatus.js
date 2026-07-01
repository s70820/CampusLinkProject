export const REGISTRATION_STATUS_LABELS = {
  ACTIVE: 'Registered',
  PENDING_PAYMENT_VERIFICATION: 'Pending Approval',
  PENDING_TEAM: 'Pending Team',
  PAYMENT_REJECTED: 'Payment Rejected',
  PENDING_INVITE: 'Invitation Pending',
  PENDING_PAYMENT: 'Pending Approval',
};

export const PENDING_REGISTRATION_STATUSES = [
  'PENDING_PAYMENT_VERIFICATION',
  'PENDING_TEAM',
  'PENDING_PAYMENT',
  'PENDING_INVITE',
];

export function registrationStatusLabel(status) {
  return REGISTRATION_STATUS_LABELS[status] || status;
}
