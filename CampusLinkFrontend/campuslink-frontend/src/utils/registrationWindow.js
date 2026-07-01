const toDateOnly = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const formatDate = (value) => {
  const date = toDateOnly(value);
  if (!date) return 'TBA';
  return date.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const getRegistrationWindow = (programme, referenceDate = new Date()) => {
  const today = toDateOnly(referenceDate);
  const open = toDateOnly(programme?.registrationOpenDate);
  const close = toDateOnly(programme?.registrationCloseDate);

  if (open && today < open) {
    return {
      status: 'NOT_OPEN',
      canRegister: false,
      label: 'Registration not open',
      detail: `Opens ${formatDate(open)}`,
      openLabel: formatDate(open),
      closeLabel: formatDate(close),
    };
  }

  if (close && today > close) {
    return {
      status: 'CLOSED',
      canRegister: false,
      label: 'Registration closed',
      detail: `Closed ${formatDate(close)}`,
      openLabel: formatDate(open),
      closeLabel: formatDate(close),
    };
  }

  if (programme?.registrationFull) {
    return {
      status: 'FULL',
      canRegister: false,
      label: 'Registration full',
      detail: 'All participant slots have been taken.',
      openLabel: formatDate(open),
      closeLabel: formatDate(close),
    };
  }

  return {
    status: 'OPEN',
    canRegister: true,
    label: 'Registration open',
    detail: close ? `Closes ${formatDate(close)}` : 'Open now',
    openLabel: formatDate(open),
    closeLabel: formatDate(close),
  };
};

export const buildProgrammeTerms = (programme) => {
  const sections = [];

  if (programme?.description) {
    sections.push({ title: 'Programme Overview', body: programme.description });
  }
  if (programme?.objectives) {
    sections.push({ title: 'Objectives', body: programme.objectives });
  }
  if (programme?.expectedOutcomes) {
    sections.push({ title: 'Expected Outcomes', body: programme.expectedOutcomes });
  }

  sections.push({
    title: 'General Participation Terms',
    body: [
      'Registration is binding once confirmed and cannot be cancelled.',
      'Participants must attend the full programme to be eligible for merit points and certificates.',
      'Participants must follow UMT campus rules, dress code, and organizer instructions at all times.',
      'The organizer reserves the right to reject or revoke participation for misconduct or false information.',
      programme?.isPaid || programme?.requiresPayment
        ? 'For paid programmes, you must upload a payment receipt before registering. Participation is confirmed only after payment verification by the organizer.'
        : null,
      programme?.isTeamProgramme || programme?.isTeamEvent
        ? `For team programmes, you must add all required teammates (matric number and phone) before submitting.${programme?.minTeamSize ? ` Minimum team size is ${programme.minTeamSize} including the leader.` : ''}${programme?.maxTeamSize ? ` Maximum team size is ${programme.maxTeamSize}.` : ''} Invited members must accept before the team registration becomes active.`
        : null,
    ].filter(Boolean).join('\n'),
  });

  return sections;
};
