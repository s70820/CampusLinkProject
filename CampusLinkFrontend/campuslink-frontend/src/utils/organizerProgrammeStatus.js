const STATUS_LABELS = {
  DRAFT: 'Draft',
  PENDING_ADVISOR_APPROVAL: 'Draft',
  ADVISOR_APPROVED: 'Draft',
  PENDING_MPP_REVIEW: 'Pending MPP',
  PENDING_MPP: 'Pending MPP',
  PENDING_HEPA: 'Pending HEPA',
  APPROVED: 'Approved',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
  ARCHIVED: 'Archived',
};

const STATUS_STYLES = {
  DRAFT: { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
  PENDING_ADVISOR_APPROVAL: { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
  ADVISOR_APPROVED: { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
  PENDING_MPP_REVIEW: { bg: '#fef9c3', color: '#a16207', border: '#facc15' },
  PENDING_MPP: { bg: '#fef9c3', color: '#a16207', border: '#facc15' },
  PENDING_HEPA: { bg: '#ffedd5', color: '#c2410c', border: '#fdba74' },
  APPROVED: { bg: '#d1fae5', color: '#047857', border: '#6ee7b7' },
  COMPLETED: { bg: '#ede9fe', color: '#6d28d9', border: '#c4b5fd' },
  CANCELLED: { bg: '#fff7ed', color: '#c2410c', border: '#fdba74' },
  REJECTED: { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
  ARCHIVED: { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' },
};

export const getProgrammeStatusLabel = (status) => STATUS_LABELS[status] || status || 'Unknown';

export const getProgrammeStatusStyle = (status) => STATUS_STYLES[status] || STATUS_STYLES.DRAFT;

const EDITABLE_DRAFT_STATUSES = new Set(['DRAFT', 'PENDING_ADVISOR_APPROVAL', 'ADVISOR_APPROVED']);

export const isEditableOrganizerDraft = (programme) => EDITABLE_DRAFT_STATUSES.has(programme?.status);

export const isOperationalOrganizerProgramme = (programme) => {
  const status = (programme?.status || '').toUpperCase();
  return status === 'APPROVED' || status === 'COMPLETED';
};

export const formatProgrammeDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
};
