import { validatePhoneNumber } from './phoneValidation';

export const getMinTeamSize = (programme) => {
  const min = programme?.minTeamSize;
  return typeof min === 'number' && min > 0 ? min : null;
};

export const getMaxTeamSize = (programme) => {
  const max = programme?.maxTeamSize;
  return typeof max === 'number' && max > 0 ? max : null;
};

/** Teammate slots the leader must fill (excludes the leader). */
export const getRequiredTeammateSlots = (programme) => {
  const min = getMinTeamSize(programme);
  if (!min) return 0;
  return Math.max(0, min - 1);
};

/** Maximum teammate invite rows allowed (excludes the leader). */
export const getMaxTeammateSlots = (programme) => {
  const max = getMaxTeamSize(programme);
  if (!max) return null;
  return Math.max(0, max - 1);
};

export const createEmptyTeammate = () => ({ matricNumber: '', phoneNumber: '' });

export const buildInitialTeammates = (programme) => {
  const required = getRequiredTeammateSlots(programme);
  const slots = required > 0 ? required : 1;
  return Array.from({ length: slots }, createEmptyTeammate);
};

const isTeammateComplete = (teammate) => (
  Boolean(teammate?.matricNumber?.trim())
  && Boolean(teammate?.phoneNumber?.trim())
  && validatePhoneNumber(teammate.phoneNumber)
);

export const countCompleteTeammates = (teammates) =>
  (teammates || []).filter(isTeammateComplete).length;

export const getTeamSizeSummary = (programme) => {
  const min = getMinTeamSize(programme);
  const max = getMaxTeamSize(programme);
  if (min && max) return `Minimum ${min} · Maximum ${max} members (including you)`;
  if (min) return `Minimum ${min} members (including you)`;
  if (max) return `Maximum ${max} members (including you)`;
  return 'Team size not specified';
};

/**
 * Returns { valid, error, completeTeammates } for team section.
 */
export const validateTeamSection = (programme, teammates, leaderMatric) => {
  const minSize = getMinTeamSize(programme);
  const maxSize = getMaxTeamSize(programme);
  const requiredSlots = getRequiredTeammateSlots(programme);
  const list = teammates || [];
  const leader = (leaderMatric || '').trim().toUpperCase();
  const seenMatrics = new Set();

  if (minSize && 1 + countCompleteTeammates(list) < minSize) {
    const needed = minSize - 1 - countCompleteTeammates(list);
    return {
      valid: false,
      error: needed > 0
        ? `This programme requires at least ${minSize} members including you. Add ${needed} more complete teammate(s) (matric number and phone) before registering.`
        : `Complete all required teammate details before registering.`,
      completeTeammates: [],
    };
  }

  for (let i = 0; i < list.length; i += 1) {
    const mate = list[i];
    const matric = (mate.matricNumber || '').trim().toUpperCase();
    const phone = (mate.phoneNumber || '').trim();
    const isRequired = i < requiredSlots;
    const hasAny = Boolean(matric || phone);

    if (isRequired || hasAny) {
      if (!matric) {
        return {
          valid: false,
          error: `Teammate ${i + 1}: matric number is required.`,
          completeTeammates: [],
        };
      }
      if (!phone) {
        return {
          valid: false,
          error: `Teammate ${i + 1}: phone number is required.`,
          completeTeammates: [],
        };
      }
      if (!validatePhoneNumber(phone)) {
        return {
          valid: false,
          error: `Teammate ${i + 1}: enter a valid phone number.`,
          completeTeammates: [],
        };
      }
      if (matric === leader) {
        return {
          valid: false,
          error: 'You cannot add yourself as a teammate.',
          completeTeammates: [],
        };
      }
      if (seenMatrics.has(matric)) {
        return {
          valid: false,
          error: `Duplicate matric number: ${matric}`,
          completeTeammates: [],
        };
      }
      seenMatrics.add(matric);
    }
  }

  const completeTeammates = list
    .filter(isTeammateComplete)
    .map((t) => ({
      matricNumber: t.matricNumber.trim().toUpperCase(),
      phoneNumber: t.phoneNumber.trim(),
    }));

  const totalMembers = 1 + completeTeammates.length;
  if (maxSize && totalMembers > maxSize) {
    return {
      valid: false,
      error: `Team cannot exceed ${maxSize} members including you.`,
      completeTeammates: [],
    };
  }

  return { valid: true, error: '', completeTeammates };
};

export const validatePaymentSection = (isPaid, paymentReference, paymentFile) => {
  if (!isPaid) return { valid: true, error: '' };
  if (!paymentReference?.trim()) {
    return { valid: false, error: 'Please enter your payment reference.' };
  }
  if (!paymentFile) {
    return { valid: false, error: 'Please upload your payment receipt before registering.' };
  }
  return { valid: true, error: '' };
};

export const isRegistrationFormComplete = ({
  programme,
  profile,
  agreeTerms,
  canRegister,
  isPaid,
  isTeam,
  teamName,
  teammates,
  paymentReference,
  paymentFile,
}) => {
  if (!canRegister || !programme) return false;
  if (!profile?.fullName || !profile?.matricNumber) return false;
  if (!agreeTerms) return false;

  const payment = validatePaymentSection(isPaid, paymentReference, paymentFile);
  if (!payment.valid) return false;

  if (isTeam) {
    if (!teamName?.trim()) return false;
    const team = validateTeamSection(programme, teammates, profile.matricNumber);
    if (!team.valid) return false;
  }

  return true;
};
