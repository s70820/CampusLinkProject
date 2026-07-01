import { resolveAssetUrl } from '../config/appConfig';
import {
  isPersonalizedOrganizerFormUrl,
  resolveRoleRequestDocumentUrl,
} from '../services/roleRequestApi';

const MPP_DOCUMENT_TYPES = [
  {
    id: 'ENDORSEMENT',
    order: 1,
    label: 'Faculty Endorsement Letter',
    description: 'Faculty endorsement supporting the MPP reviewer application.',
    patterns: [/endorsement/i, /faculty/i],
  },
  {
    id: 'APPOINTMENT_LETTER',
    order: 2,
    label: 'MPP Appointment Letter',
    description: 'Official appointment letter from the student representative council.',
    patterns: [/appointment letter/i, /surat lantikan/i],
  },
  {
    id: 'CERTIFICATE',
    order: 3,
    label: 'MPP Appointment Certificate',
    description: 'Certificate confirming MPP reviewer appointment.',
    patterns: [/certificate/i, /sijil/i, /appointment cert/i],
  },
  {
    id: 'OTHER_MPP',
    order: 4,
    label: 'Supporting Document',
    description: 'Additional MPP application supporting document.',
    patterns: [/mpp/i, /application/i],
  },
];

const ORGANIZER_DOCUMENT_TYPES = [
  {
    id: 'ORGANIZER_FORM',
    order: 1,
    label: 'UMT Club Organizer Approval Form',
    description: 'Advisor-signed club secretary (organizer) approval form.',
    patterns: [/organizer/i, /club/i, /approval/i, /ftkk/i, /form/i],
  },
];

function classifyDocument(doc, requestedRole) {
  const haystack = `${doc.name || ''} ${doc.url || ''}`;
  const types = requestedRole === 'ORGANIZER' ? ORGANIZER_DOCUMENT_TYPES : MPP_DOCUMENT_TYPES;
  for (const type of types) {
    if (type.patterns.some((pattern) => pattern.test(haystack))) {
      return type;
    }
  }
  return types[types.length - 1];
}

export function resolveDocumentUrl(path) {
  if (!path) return '';
  if (isPersonalizedOrganizerFormUrl(path)) {
    return resolveRoleRequestDocumentUrl(path);
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return resolveAssetUrl(path.startsWith('/') ? path : `/${path}`);
}

export function prepareRoleRequestDocuments(documents = [], requestedRole = 'MPP', requestMeta = {}) {
  return documents
    .map((doc, index) => {
      const type = classifyDocument(doc, requestedRole);
      const viewUrl = resolveDocumentUrl(doc.url);
      return {
        ...doc,
        key: `${type.id}-${doc.name || index}`,
        typeId: type.id,
        displayLabel: type.label,
        description: type.description,
        sortOrder: type.order,
        viewUrl,
        isPersonalizedOrganizerForm: isPersonalizedOrganizerFormUrl(doc.url),
        requestId: requestMeta.id,
        userId: requestMeta.userId,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder || (a.name || '').localeCompare(b.name || ''));
}
