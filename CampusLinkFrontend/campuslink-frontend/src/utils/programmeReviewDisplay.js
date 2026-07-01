import { formatMeritRoleType } from './meritRulesDisplay';
import { resolveAssetUrl } from '../config/appConfig';
import { isPlaceholderProgrammeDocument } from './programmeFormPreview';
import { buildProgrammeFormFileName } from './programmeFormConstants';

const SUBMITTED_REVIEW_STATUSES = new Set([
  'PENDING_MPP_REVIEW',
  'PENDING_MPP',
  'PENDING_HEPA',
  'APPROVED',
  'COMPLETED',
  'REJECTED',
]);

export const SDG_LABELS = {
  1: 'No Poverty',
  2: 'Zero Hunger',
  3: 'Good Health and Well-being',
  4: 'Quality Education',
  5: 'Gender Equality',
  6: 'Clean Water and Sanitation',
  7: 'Affordable and Clean Energy',
  8: 'Decent Work and Economic Growth',
  9: 'Industry, Innovation and Infrastructure',
  10: 'Reduced Inequalities',
  11: 'Sustainable Cities and Communities',
  12: 'Responsible Consumption and Production',
  13: 'Climate Action',
  14: 'Life Below Water',
  15: 'Life on Land',
  16: 'Peace, Justice and Strong Institutions',
  17: 'Partnerships for the Goals',
};

export const COMMITTEE_ROLE_LABELS = {
  PENGARAH_PROGRAM: 'Programme Director',
  MT_PROGRAM: 'Program Management Team',
  AJK_PROGRAM: 'Program Committee Member',
  SPECIAL_CONTRIBUTION: 'Special Contribution',
};

export const DOCUMENT_TYPE_LABELS = {
  POSTER: 'Programme Poster',
  APPLICATION_PDF: 'Generated Programme Form (Reference)',
  ADVISOR_SIGNED: 'Advisor-Signed Programme Form',
  SUPPORTING: 'Additional Supporting Document',
  PROPOSAL_PAPER: 'Proposal Paper',
  SPONSOR_LETTER: 'Sponsor Letter',
  RISK_ASSESSMENT: 'Risk Assessment',
  PAYMENT_QR: 'Payment QR Code',
};

const DOCUMENT_TYPE_ORDER = {
  ADVISOR_SIGNED: 1,
  SUPPORTING: 2,
  PROPOSAL_PAPER: 3,
  SPONSOR_LETTER: 4,
  RISK_ASSESSMENT: 5,
  APPLICATION_PDF: 6,
  POSTER: 7,
  PAYMENT_QR: 8,
};

const DOCUMENT_TYPE_DESCRIPTIONS = {
  APPLICATION_PDF: 'Auto-generated programme form from organizer submission (unsigned reference copy).',
  ADVISOR_SIGNED: 'The exact programme form signed by the club advisor — required for MPP/HEPA review.',
  POSTER: 'Programme publicity poster uploaded by the organizer.',
  PROPOSAL_PAPER: 'Detailed programme proposal paper (optional).',
  SPONSOR_LETTER: 'Sponsor confirmation or support letter.',
  RISK_ASSESSMENT: 'Programme risk assessment document (optional).',
  PAYMENT_QR: 'Payment QR code for programme fees (if applicable).',
  SUPPORTING: 'Optional supporting document supplied by the organizer.',
};

export function formatCommitteeRole(role) {
  return COMMITTEE_ROLE_LABELS[role] || role?.replace(/_/g, ' ') || '—';
}

export function formatTime(value) {
  if (!value) return '';
  if (typeof value === 'string' && value.length >= 5) return value.slice(0, 5);
  return String(value);
}

export function formatDateTimeRange(programme) {
  if (!programme) return '—';
  const start = programme.startDate || '';
  const end = programme.endDate && programme.endDate !== programme.startDate ? ` – ${programme.endDate}` : '';
  const time = programme.startTime || programme.endTime
    ? ` (${formatTime(programme.startTime)}${programme.endTime ? ` – ${formatTime(programme.endTime)}` : ''})`
    : '';
  return `${start}${end}${time}`.trim() || '—';
}

export function resolveProgrammeFileUrl(path) {
  return resolveAssetUrl(path);
}

export function groupCommitteeMembers(committee = []) {
  return {
    director: committee.filter((m) => m.committeeRole === 'PENGARAH_PROGRAM'),
    mt: committee.filter((m) => m.committeeRole === 'MT_PROGRAM'),
    ajk: committee.filter((m) => m.committeeRole === 'AJK_PROGRAM'),
    special: committee.filter((m) => m.committeeRole === 'SPECIAL_CONTRIBUTION'),
  };
}

export function isProgrammeSubmittedForReview(programme) {
  const status = String(programme?.status || '').toUpperCase();
  return SUBMITTED_REVIEW_STATUSES.has(status);
}

function buildGeneratedAdvisorSignedEntry(programme, fileNameOverride = '') {
  const fileName = fileNameOverride || buildProgrammeFormFileName(programme?.title);
  return {
    type: 'ADVISOR_SIGNED',
    label: DOCUMENT_TYPE_LABELS.ADVISOR_SIGNED,
    description: DOCUMENT_TYPE_DESCRIPTIONS.ADVISOR_SIGNED,
    name: fileName,
    isGenerated: true,
    sortOrder: 1,
  };
}
function mapDocumentRecord(doc, overrides = {}) {
  const type = doc.documentType || 'OTHER';
  return {
    id: doc.id,
    type,
    label: overrides.label || DOCUMENT_TYPE_LABELS[type] || doc.fileName || type,
    description: overrides.description || DOCUMENT_TYPE_DESCRIPTIONS[type] || 'Programme document.',
    name: doc.fileName || type,
    url: resolveProgrammeFileUrl(doc.filePath),
    sortOrder: overrides.sortOrder ?? DOCUMENT_TYPE_ORDER[type] ?? 99,
  };
}

export function getProgrammeReviewDocumentGroups(fullDetails, programme) {
  const docs = fullDetails?.documents || [];
  const seen = new Set();
  const submitted = isProgrammeSubmittedForReview(programme);

  let advisorSigned = docs
    .filter((doc) => doc.documentType === 'ADVISOR_SIGNED')
    .map((doc) => {
      if (isPlaceholderProgrammeDocument(doc.filePath)) {
        return submitted
          ? buildGeneratedAdvisorSignedEntry(programme, buildProgrammeFormFileName(programme?.title))
          : null;
      }
      return mapDocumentRecord(doc, { sortOrder: 1 });
    })
    .filter(Boolean);

  if (!advisorSigned.length && programme?.advisorSignedFormPath) {
    if (isPlaceholderProgrammeDocument(programme.advisorSignedFormPath)) {
      if (submitted) {
        advisorSigned = [buildGeneratedAdvisorSignedEntry(programme)];
      }
    } else {
      advisorSigned = [{
        type: 'ADVISOR_SIGNED',
        label: DOCUMENT_TYPE_LABELS.ADVISOR_SIGNED,
        description: DOCUMENT_TYPE_DESCRIPTIONS.ADVISOR_SIGNED,
        name: buildProgrammeFormFileName(programme?.title),
        url: resolveProgrammeFileUrl(programme.advisorSignedFormPath),
        sortOrder: 1,
      }];
    }
  }

  if (!advisorSigned.length && submitted) {
    advisorSigned = [buildGeneratedAdvisorSignedEntry(programme)];
  }

  const additionalSupporting = docs
    .filter((doc) => doc.documentType === 'SUPPORTING')
    .map((doc, index) => mapDocumentRecord(doc, {
      label: `Additional Supporting Document ${index + 1}`,
      sortOrder: 2,
    }));

  const referenceMaterials = [];

  docs.forEach((doc) => {
    if (doc.documentType === 'ADVISOR_SIGNED' || doc.documentType === 'SUPPORTING') return;
    if (isPlaceholderProgrammeDocument(doc.filePath)) return;
    const key = `${doc.documentType}-${doc.filePath}`;
    if (seen.has(key)) return;
    seen.add(key);
    referenceMaterials.push(mapDocumentRecord(doc));
  });

  if (programme?.posterPath && !seen.has(`poster-${programme.posterPath}`)) {
    referenceMaterials.push({
      type: 'POSTER',
      label: DOCUMENT_TYPE_LABELS.POSTER,
      description: DOCUMENT_TYPE_DESCRIPTIONS.POSTER,
      name: 'Poster',
      url: resolveProgrammeFileUrl(programme.posterPath),
      sortOrder: DOCUMENT_TYPE_ORDER.POSTER,
    });
  }
  if (programme?.paymentQrPath && !seen.has(`payment-${programme.paymentQrPath}`)) {
    referenceMaterials.push({
      type: 'PAYMENT_QR',
      label: DOCUMENT_TYPE_LABELS.PAYMENT_QR || 'Payment QR Code',
      description: DOCUMENT_TYPE_DESCRIPTIONS.PAYMENT_QR,
      name: 'Payment QR',
      url: resolveProgrammeFileUrl(programme.paymentQrPath),
      sortOrder: DOCUMENT_TYPE_ORDER.PAYMENT_QR,
    });
  }

  referenceMaterials.sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));

  return { advisorSigned, additionalSupporting, referenceMaterials };
}

export function getProgrammeDocuments(fullDetails, programme) {
  const { advisorSigned, additionalSupporting, referenceMaterials } = getProgrammeReviewDocumentGroups(
    fullDetails,
    programme
  );
  return [...advisorSigned, ...additionalSupporting, ...referenceMaterials]
    .filter((doc) => doc.url);
}

export function formatMeritBreakdown(meritPreview) {
  if (!meritPreview?.breakdown?.length) return [];
  return meritPreview.breakdown.map((item) => ({
    label: item.positionLabel || formatMeritRoleType(item.meritRoleType),
    matric: item.matricNumber,
    points: item.meritPoints,
  }));
}
