import { generateProgrammeFormPdf } from './generateProgrammeFormPdf';
import { mapProgrammeFullToForm } from './mapProgrammeFullToForm';

const PLACEHOLDER_DOC_PATTERNS = [
  /demo-docs\/advisor-signed-form\.pdf/i,
  /demo-docs\/mystar-application-form\.pdf/i,
];

export function isPlaceholderProgrammeDocument(path) {
  if (!path) return false;
  const normalized = String(path).replace(/\\/g, '/');
  return PLACEHOLDER_DOC_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function buildProgrammeFormDataFromFullDetails(fullDetails) {
  const programme = fullDetails?.programme || {};
  const supportingDocumentCount = (fullDetails?.documents || [])
    .filter((doc) => doc.documentType === 'SUPPORTING').length;

  return {
    ...mapProgrammeFullToForm(fullDetails, {}),
    supportingDocumentCount,
    isPaidProgramme: Boolean(programme.isPaid),
    isTeamProgramme: Boolean(programme.isTeamProgramme),
  };
}

export function getProgrammeOrganizerName(fullDetails, fallback = '') {
  return fullDetails?.programme?.organizer?.fullName
    || fullDetails?.programme?.organizerName
    || fallback
    || '';
}

export async function generateProgrammeFormPreview(fullDetails, fallbackOrganizerName = '') {
  const formData = buildProgrammeFormDataFromFullDetails(fullDetails);
  const organizerName = getProgrammeOrganizerName(fullDetails, fallbackOrganizerName);
  return generateProgrammeFormPdf(
    formData,
    organizerName,
    fullDetails?.meritPreview || null,
    { download: false }
  );
}

export async function downloadProgrammeFormPreview(fullDetails, fallbackOrganizerName = '') {
  const { blob, fileName } = await generateProgrammeFormPreview(fullDetails, fallbackOrganizerName);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
