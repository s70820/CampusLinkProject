import { normalizeUploadPath, resolveAssetUrl } from '../config/appConfig';
import {
  createDefaultBudgetLines,
  createEmptyTentativeRow,
  mapBudgetLinesFromApi,
  mapSpeakersFromApi,
  mapTentativeFromApi,
} from './programmeFormConstants';

function toPublicAssetUrl(storedPath) {
  if (!storedPath) return '';
  if (storedPath.startsWith('http')) return storedPath;
  return resolveAssetUrl(normalizeUploadPath(storedPath));
}

function findDocument(documents, type) {
  return (documents || []).find((doc) => doc.documentType === type);
}

const emptyMember = (id, committeeRole, extra = {}) => ({
  id,
  matric: '',
  name: '',
  faculty: '',
  committeeRole,
  ...extra,
});

function normalizeDate(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day] = value;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  return '';
}

function normalizeTime(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.length >= 5 ? value.slice(0, 5) : value;
  if (Array.isArray(value) && value.length >= 2) {
    const [hour, minute] = value;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }
  return '';
}
function parseCustomFields(programme) {
  if (!programme?.customRegistrationFieldsJson) return [];
  try {
    const parsed = JSON.parse(programme.customRegistrationFieldsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapCommittee(committeeRows = []) {
  const director = emptyMember(1, 'PENGARAH_PROGRAM');
  const mtMembers = [];
  const ajkMembers = [];
  const specialContributions = [];

  committeeRows.forEach((row, index) => {
    const base = {
      matric: row.matricNumber || '',
      name: row.fullName || '',
      faculty: row.faculty || '',
    };

    switch (row.committeeRole) {
      case 'PENGARAH_PROGRAM':
        Object.assign(director, base);
        break;
      case 'MT_PROGRAM':
        mtMembers.push({
          id: row.id || index + 1,
          ...base,
          position: row.positionLabel || '',
          committeeRole: 'MT_PROGRAM',
        });
        break;
      case 'AJK_PROGRAM':
        ajkMembers.push({
          id: row.id || index + 1,
          ...base,
          role: row.positionLabel || '',
          committeeRole: 'AJK_PROGRAM',
        });
        break;
      case 'SPECIAL_CONTRIBUTION':
        specialContributions.push({
          id: row.id || index + 1,
          ...base,
          contributionDescription: row.contributionDescription || '',
          committeeRole: 'SPECIAL_CONTRIBUTION',
        });
        break;
      default:
        break;
    }
  });

  return {
    director,
    mtMembers: mtMembers.length ? mtMembers : [emptyMember(1, 'MT_PROGRAM', { position: '' })],
    ajkMembers: ajkMembers.length ? ajkMembers : [emptyMember(1, 'AJK_PROGRAM', { role: '' })],
    specialContributions: specialContributions.length
      ? specialContributions
      : [],
  };
}

export function mapProgrammeFullToForm(fullDetails, initialFormState) {
  const programme = fullDetails?.programme || {};
  const advisor = fullDetails?.advisorApproval || {};
  const documents = fullDetails?.documents || [];
  const sdgs = [...new Set((fullDetails?.sdgs || []).map((item) => item.sdgNumber).filter(Boolean))];

  const proposalDoc = findDocument(documents, 'PROPOSAL_PAPER');
  const sponsorDoc = findDocument(documents, 'SPONSOR_LETTER');
  const riskDoc = findDocument(documents, 'RISK_ASSESSMENT');

  return {
    ...initialFormState,
    title: programme.title || '',
    category: programme.category || '',
    level: programme.programmeLevel || '',
    type: programme.programmeType || '',
    organizerClub: programme.organizerClub || '',
    description: programme.description || '',
    objectives: programme.objectives || '',
    outcomes: programme.expectedOutcomes || '',
    startDate: normalizeDate(programme.startDate),
    endDate: normalizeDate(programme.endDate),
    startTime: normalizeTime(programme.startTime),
    endTime: normalizeTime(programme.endTime),
    registrationOpenDate: normalizeDate(programme.registrationOpenDate),
    registrationCloseDate: normalizeDate(programme.registrationCloseDate),
    venue: programme.venue || '',
    googleMapsLocation: programme.googleMapsLink || '',
    communicationLink: programme.communicationLink || '',
    customRegistrationFields: parseCustomFields(programme),
    maxParticipants: programme.expectedParticipants != null ? String(programme.expectedParticipants) : '',
    expectedStudentParticipants: programme.expectedStudentParticipants != null
      ? String(programme.expectedStudentParticipants) : '',
    expectedStaffParticipants: programme.expectedStaffParticipants != null
      ? String(programme.expectedStaffParticipants) : '',
    expectedExternalParticipants: programme.expectedExternalParticipants != null
      ? String(programme.expectedExternalParticipants) : '',
    collaboratingOrganization: programme.collaboratingOrganization || '',
    sponsorshipInfo: programme.sponsorshipInfo || '',
    isPaidProgramme: Boolean(programme.isPaid),
    registrationFee: programme.registrationFee != null ? String(programme.registrationFee) : '',
    paymentInstructions: programme.paymentInstructions || '',
    paymentReferenceFormat: programme.paymentReferenceFormat || '',
    isTeamProgramme: Boolean(programme.isTeamProgramme),
    teamNameRequired: programme.teamNameRequired !== false,
    minTeamSize: programme.minTeamSize != null ? String(programme.minTeamSize) : '',
    maxTeamSize: programme.maxTeamSize != null ? String(programme.maxTeamSize) : '',
    certificateMode: programme.certificateMode || 'SYSTEM',
    certificateTemplate: programme.certificateTemplate || 'GEOMETRIC_MODERN',
    certificateOrientation: programme.certificateOrientation || 'LANDSCAPE',
    posterPreview: toPublicAssetUrl(programme.posterPath),
    paymentQrPreview: toPublicAssetUrl(programme.paymentQrPath),
    proposalPaperFile: null,
    proposalPaperName: proposalDoc?.fileName || '',
    proposalPaperPreview: proposalDoc ? toPublicAssetUrl(proposalDoc.filePath) : '',
    sponsorLetterFile: null,
    sponsorLetterName: sponsorDoc?.fileName || '',
    sponsorLetterPreview: sponsorDoc ? toPublicAssetUrl(sponsorDoc.filePath) : '',
    riskAssessmentFile: null,
    riskAssessmentName: riskDoc?.fileName || '',
    riskAssessmentPreview: riskDoc ? toPublicAssetUrl(riskDoc.filePath) : '',
    budgetLines: mapBudgetLinesFromApi(fullDetails?.budgetLines),
    tentativeSchedule: mapTentativeFromApi(fullDetails?.tentativeSchedule),
    speakers: mapSpeakersFromApi(fullDetails?.speakers, toPublicAssetUrl),
    sdgs,
    advisor: {
      advisorName: advisor.advisorName || '',
      advisorEmail: advisor.advisorEmail || '',
      approvalMethod: advisor.approvalMethod === 'ONLINE' ? 'OFFLINE' : (advisor.approvalMethod || 'OFFLINE'),
    },
    committee: mapCommittee(fullDetails?.committee || []),
  };
}

export default mapProgrammeFullToForm;
