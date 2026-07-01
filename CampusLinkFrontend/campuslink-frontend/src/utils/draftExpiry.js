const EDITABLE_DRAFT_STATUSES = new Set(['DRAFT', 'PENDING_ADVISOR_APPROVAL', 'ADVISOR_APPROVED']);

const isEditableDraft = (programme) => EDITABLE_DRAFT_STATUSES.has(programme?.status);

export const DRAFT_RETENTION_DAYS = 14;
export const DRAFT_WARNING_DAYS = 7;

export function getDraftExpiryLabel(programme) {
  if (!isEditableDraft(programme)) return null;
  const days = programme.draftDaysRemaining;
  if (days == null) return null;
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires in 1 day';
  return `Expires in ${days} days`;
}

export function isDraftExpiringSoon(programme) {
  return isEditableDraft(programme) && Boolean(programme.draftExpiringSoon);
}
