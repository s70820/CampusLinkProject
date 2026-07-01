export const REPORT_COLORS = {
  primary: [0, 45, 98],
  primaryLight: [30, 64, 175],
  text: [15, 23, 42],
  muted: [100, 116, 139],
  border: [203, 213, 225],
  rowAlt: [245, 248, 252],
  white: [255, 255, 255],
  successBg: [230, 244, 234],
  successText: [22, 101, 52],
  warningBg: [254, 243, 199],
  warningText: [161, 98, 7],
  neutralBg: [241, 245, 249],
  neutralText: [71, 85, 105],
};

export const REPORT_SUBTITLE = 'Programme Discovery & Merit Portal';

export const REPORT_TYPE_TITLES = {
  'Registration Report': 'REGISTRATION REPORT',
  'Attendance Summary': 'ATTENDANCE SUMMARY',
  'Merit Summary': 'MERIT SUMMARY',
};

export function getReportTitle(reportType) {
  return REPORT_TYPE_TITLES[reportType] || String(reportType || 'PROGRAMME REPORT').toUpperCase();
}

export function buildReportId(programmeId) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const suffix = String(now.getTime()).slice(-3);
  const programmePart = programmeId ? String(programmeId).padStart(4, '0') : '0000';
  return `RPT-${y}${m}${d}-${programmePart}-${suffix}`;
}

export function formatReportDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toLocaleDateString('en-MY', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    return value;
  }
  return date.toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatReportDateTime(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatCellDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}
