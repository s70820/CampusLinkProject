export const CERTIFICATE_ISSUANCE_WINDOW_DAYS = 21;

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getProgrammeEndDate = (programme) => parseDate(programme?.endDate || programme?.startDate);

export const isProgrammeEnded = (programme) => {
  const endDate = getProgrammeEndDate(programme);
  if (!endDate) return false;
  const endOfDay = new Date(endDate);
  endOfDay.setHours(23, 59, 59, 999);
  return Date.now() > endOfDay.getTime();
};

export const getCertificateDeadline = (programme) => {
  const endDate = getProgrammeEndDate(programme);
  if (!endDate) return null;
  const deadline = new Date(endDate);
  deadline.setDate(deadline.getDate() + CERTIFICATE_ISSUANCE_WINDOW_DAYS);
  deadline.setHours(23, 59, 59, 999);
  return deadline;
};

export const isWithinCertificateWindow = (programme) => {
  if (!isProgrammeEnded(programme)) return false;
  const deadline = getCertificateDeadline(programme);
  return deadline ? Date.now() <= deadline.getTime() : false;
};

export const getCertificateWindowStatus = (programme) => {
  if (!programme) return 'unknown';
  if ((programme.certificateMode || 'SYSTEM').toUpperCase() === 'MANUAL') return 'manual';
  if (!isProgrammeEnded(programme)) return 'not_ended';
  if (!isWithinCertificateWindow(programme)) return 'expired';
  return 'open';
};

export const formatCertificateDeadline = (programme) => {
  const deadline = getCertificateDeadline(programme);
  if (!deadline) return '';
  return deadline.toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getDaysRemainingInCertificateWindow = (programme) => {
  const deadline = getCertificateDeadline(programme);
  if (!deadline) return null;
  const ms = deadline.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};
