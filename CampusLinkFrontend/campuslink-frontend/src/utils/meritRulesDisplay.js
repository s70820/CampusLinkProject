/** UMT MyStar merit programme levels (API values match backend merit_rule.programme_level). */
export const MERIT_PROGRAMME_LEVELS = [
  { value: 'Faculty/Club', label: 'Faculty / Club / Uniform Body' },
  { value: 'University', label: 'University' },
  { value: 'State', label: 'State' },
  { value: 'National', label: 'National' },
  { value: 'International', label: 'International' },
];

/** Display order for merit rules within each level. */
export const MERIT_ROLE_ORDER = [
  'DIRECTOR',
  'MT',
  'AJK',
  'PARTICIPANT',
  'SPECIAL_CONTRIBUTION',
];

const MERIT_ROLE_LABELS = {
  DIRECTOR: 'Program Director',
  MT: 'Program Management Team',
  AJK: 'Program Committee Member',
  PARTICIPANT: 'Program Participant',
  SPECIAL_CONTRIBUTION: 'Special Contribution',
};

export function formatMeritRoleType(roleType) {
  if (!roleType) return '—';
  return MERIT_ROLE_LABELS[roleType] || roleType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function sortMeritRules(rules = []) {
  return [...rules].sort((a, b) => {
    const aIndex = MERIT_ROLE_ORDER.indexOf(a.roleType);
    const bIndex = MERIT_ROLE_ORDER.indexOf(b.roleType);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });
}

export function getMeritLevelLabel(value) {
  return MERIT_PROGRAMME_LEVELS.find((level) => level.value === value)?.label || value;
}
