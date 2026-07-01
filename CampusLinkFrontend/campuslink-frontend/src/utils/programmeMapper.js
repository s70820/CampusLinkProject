import { BROWSE_CATEGORY_OPTIONS } from '../constants/programmeCategories';
import { fileUrl } from '../services/registrationApi';
import { getRegistrationWindow } from './registrationWindow';

const DEFAULT_POSTER =
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80';

const CATEGORY_POSTERS = {
  Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80',
  Culture: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
  Career: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
  Entrepreneurship: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
  Volunteerism: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  Leadership: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=80',
  Religious: 'https://images.unsplash.com/photo-1564769662533-4f00a6b40b7f?auto=format&fit=crop&w=900&q=80',
};

export const resolveProgrammePoster = (programme) => {
  const resolved = programme?.posterPath ? fileUrl(programme.posterPath) : '';
  if (resolved) return resolved;
  return CATEGORY_POSTERS[programme?.category] || DEFAULT_POSTER;
};

const formatDate = (value) => {
  if (!value) return 'TBA';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTime = (value) => {
  if (!value) return '';
  const [hours, minutes] = String(value).split(':');
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return date.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const formatTimeRange = (startTime, endTime) => {
  const start = formatTime(startTime);
  const end = formatTime(endTime);
  if (start && end) return `${start} - ${end}`;
  return start || end || 'TBA';
};

export const mapProgrammeFromApi = (programme) => {
  const mapped = {
  id: programme.id,
  title: programme.title,
  category: programme.category,
  description: programme.description || '',
  objectives: programme.objectives || '',
  expectedOutcomes: programme.expectedOutcomes || '',
  image: resolveProgrammePoster(programme),
  posterPath: programme.posterPath ? fileUrl(programme.posterPath) : '',
  posterFallback: CATEGORY_POSTERS[programme.category] || DEFAULT_POSTER,
  merit: programme.meritPoints ?? 0,
  date: formatDate(programme.startDate),
  endDate: formatDate(programme.endDate),
  time: formatTimeRange(programme.startTime, programme.endTime),
  location: programme.venue || 'TBA',
  customRegistrationFields: programme.customRegistrationFields || [],
  maxParticipants: programme.maxParticipants ?? programme.expectedParticipants,
  slotsRemaining: programme.slotsRemaining,
  registrationFull: Boolean(programme.registrationFull),
  programmeLevel: programme.programmeLevel,
  level: programme.programmeLevel,
  organizerClub: programme.organizerClub,
  programmeType: programme.programmeType,
  expectedParticipants: programme.expectedParticipants,
  registrationCloseDate: programme.registrationCloseDate,
  registrationOpenDate: programme.registrationOpenDate,
  sdgNumbers: programme.sdgNumbers || [],
  startDateRaw: programme.startDate,
  endDateRaw: programme.endDate,
  status: programme.status,
  isPaid: Boolean(programme.isPaid),
  registrationFee: programme.registrationFee,
  paymentInstructions: programme.paymentInstructions || '',
  paymentReferenceFormat: programme.paymentReferenceFormat || '',
  paymentQrPath: fileUrl(programme.paymentQrPath),
  isTeamProgramme: Boolean(programme.isTeamProgramme),
  teamNameRequired: programme.teamNameRequired !== false,
  minTeamSize: programme.minTeamSize,
  maxTeamSize: programme.maxTeamSize,
  requiresPayment: Boolean(programme.isPaid),
  bankQrCode: fileUrl(programme.paymentQrPath),
  isTeamEvent: Boolean(programme.isTeamProgramme),
  };

  const window = getRegistrationWindow(mapped);
  const alreadyRegistered = Boolean(programme.alreadyRegistered);
  const eligibleToRegister = programme.eligibleToRegister !== false && !alreadyRegistered;
  const registrationRestrictionReason = programme.registrationRestrictionReason || null;
  const canRegister = window.canRegister && eligibleToRegister && !alreadyRegistered;

  return {
    ...mapped,
    registrationWindow: window,
    alreadyRegistered,
    userRegistrationStatus: programme.userRegistrationStatus || null,
    eligibleToRegister,
    registrationRestrictionReason,
    canRegister,
    registrationStatusLabel: alreadyRegistered
      ? 'Registered'
      : !eligibleToRegister
        ? 'Not eligible'
        : window.label,
    registrationDateRange: window.openLabel && window.closeLabel
      ? `${window.openLabel} – ${window.closeLabel}`
      : window.openLabel || window.closeLabel || 'Dates TBA',
  };
};

export const getUpcomingProgrammes = (programmes, daysAhead = 14, limit = 3) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + daysAhead);

  return programmes
    .filter((programme) => {
      if (!programme.startDateRaw) return false;
      const start = new Date(programme.startDateRaw);
      return start >= today && start <= cutoff;
    })
    .sort((a, b) => new Date(a.startDateRaw) - new Date(b.startDateRaw))
    .slice(0, limit);
};

export const getFeaturedProgrammes = (programmes, limit = 3) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const future = programmes
    .filter((p) => !p.startDateRaw || new Date(p.startDateRaw) >= today)
    .sort((a, b) => new Date(a.startDateRaw || 0) - new Date(b.startDateRaw || 0));

  return (future.length ? future : programmes).slice(0, limit);
};

export const extractCategories = () => BROWSE_CATEGORY_OPTIONS;
