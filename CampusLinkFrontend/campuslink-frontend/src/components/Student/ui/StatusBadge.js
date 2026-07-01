import React from 'react';
import { Chip } from '@mui/material';

const ROLE_REQUEST_LABELS = {
  PENDING_HEPA_APPROVAL: 'Pending HEPA Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  REVOKED: 'Revoked',
};

const STATUS_STYLES = {
  Pending: { bg: '#fef9c3', color: '#a16207', border: '#facc15' },
  'Pending Approval': { bg: '#fef9c3', color: '#a16207', border: '#facc15' },
  'Pending HEPA Approval': { bg: '#fef9c3', color: '#a16207', border: '#facc15' },
  PENDING_HEPA_APPROVAL: { bg: '#fef9c3', color: '#a16207', border: '#facc15' },
  Registered: { bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' },
  Approved: { bg: '#d1fae5', color: '#047857', border: '#6ee7b7' },
  APPROVED: { bg: '#d1fae5', color: '#047857', border: '#6ee7b7' },
  Attended: { bg: '#d1fae5', color: '#047857', border: '#6ee7b7' },
  Completed: { bg: '#ede9fe', color: '#6d28d9', border: '#c4b5fd' },
  Rejected: { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
  REVOKED: { bg: '#ffedd5', color: '#c2410c', border: '#fdba74' },
  Revoked: { bg: '#ffedd5', color: '#c2410c', border: '#fdba74' },
  Ready: { bg: '#d1fae5', color: '#047857', border: '#6ee7b7' },
  Processing: { bg: '#fef3c7', color: '#b45309', border: '#fcd34d' },
  'Registration Open': { bg: '#d1fae5', color: '#047857', border: '#6ee7b7' },
  'Registration closed': { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
  'Registration not open': { bg: '#fef3c7', color: '#b45309', border: '#fcd34d' },
};

const normalizeStatus = (status, variant) => {
  if (variant === 'roleRequest') {
    return ROLE_REQUEST_LABELS[status] || status;
  }
  if (status === 'Approved') return 'Registered';
  return status;
};

const StatusBadge = ({ status, size = 'small', variant }) => {
  const label = normalizeStatus(status, variant);
  const style = STATUS_STYLES[label] || STATUS_STYLES[status] || STATUS_STYLES.Pending;

  return (
    <Chip
      label={label}
      size={size}
      sx={{
        bgcolor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontWeight: 700,
        fontSize: size === 'small' ? '0.75rem' : '0.8125rem',
      }}
    />
  );
};

export default StatusBadge;
