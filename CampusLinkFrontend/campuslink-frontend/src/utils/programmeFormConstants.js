export const BUDGET_INCOME_ITEMS = [
  { category: 'UNIVERSITY_ALLOCATION', label: 'University allocation' },
  { category: 'SPONSOR_CONTRIBUTION', label: 'Sponsor contribution' },
  { category: 'PARTICIPANT_FEE', label: 'Participant fee' },
  { category: 'OTHER_INCOME', label: 'Other income' },
];

export const BUDGET_EXPENSE_ITEMS = [
  { category: 'FOOD', label: 'Food' },
  { category: 'PRINTING', label: 'Printing' },
  { category: 'EQUIPMENT', label: 'Equipment' },
  { category: 'TRANSPORTATION', label: 'Transportation' },
  { category: 'SPEAKER', label: 'Speaker' },
  { category: 'PRIZE', label: 'Prize' },
  { category: 'SOUVENIR', label: 'Souvenir' },
  { category: 'MISCELLANEOUS', label: 'Miscellaneous' },
];

export const BUDGET_CATEGORY_LABELS = Object.fromEntries(
  [...BUDGET_INCOME_ITEMS, ...BUDGET_EXPENSE_ITEMS].map((item) => [item.category, item.label])
);

export const createDefaultBudgetLines = () => [
  ...BUDGET_INCOME_ITEMS.map((item, index) => ({
    lineType: 'INCOME',
    category: item.category,
    label: item.label,
    amount: '',
    sortOrder: index,
  })),
  ...BUDGET_EXPENSE_ITEMS.map((item, index) => ({
    lineType: 'EXPENSE',
    category: item.category,
    label: item.label,
    amount: '',
    sortOrder: BUDGET_INCOME_ITEMS.length + index,
  })),
];

export const createEmptyTentativeRow = (id = Date.now()) => ({
  id,
  timeSlot: '',
  activity: '',
  personInCharge: '',
});

export const createEmptySpeakerRow = (id = Date.now()) => ({
  id,
  speakerName: '',
  position: '',
  organization: '',
  email: '',
  phone: '',
  cvFile: null,
  cvFileName: '',
  cvPath: '',
  cvStoredPath: '',
});

export const calculateBudgetTotals = (budgetLines = []) => {
  const totals = budgetLines.reduce(
    (acc, line) => {
      const amount = Number(line.amount) || 0;
      if (line.lineType === 'INCOME') {
        acc.totalIncome += amount;
      } else if (line.lineType === 'EXPENSE') {
        acc.totalExpense += amount;
      }
      return acc;
    },
    { totalIncome: 0, totalExpense: 0 }
  );
  return {
    ...totals,
    balance: totals.totalIncome - totals.totalExpense,
  };
};

export const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return `RM ${num.toFixed(2)}`;
};

export const mapBudgetLinesFromApi = (lines = []) => {
  const defaults = createDefaultBudgetLines();
  const byCategory = new Map(
    (lines || []).map((line) => [line.category, line])
  );
  return defaults.map((defaultLine) => {
    const existing = byCategory.get(defaultLine.category);
    return {
      ...defaultLine,
      amount: existing?.amount != null ? String(existing.amount) : '',
      sortOrder: existing?.sortOrder ?? defaultLine.sortOrder,
    };
  });
};

export const mapTentativeFromApi = (items = []) => {
  if (!items.length) {
    return [createEmptyTentativeRow(1)];
  }
  return items.map((item, index) => ({
    id: item.id || index + 1,
    timeSlot: item.timeSlot || '',
    activity: item.activity || '',
    personInCharge: item.personInCharge || '',
  }));
};

export const mapSpeakersFromApi = (speakers = [], toPublicAssetUrl) => {
  if (!speakers.length) {
    return [];
  }
  return speakers.map((speaker, index) => ({
    id: speaker.id || index + 1,
    speakerName: speaker.speakerName || '',
    position: speaker.position || '',
    organization: speaker.organization || '',
    email: speaker.email || '',
    phone: speaker.phone || '',
    cvFile: null,
    cvFileName: speaker.cvPath ? 'Uploaded CV' : '',
    cvPath: speaker.cvPath ? toPublicAssetUrl(speaker.cvPath) : '',
    cvStoredPath: speaker.cvPath || '',
  }));
};

export const buildBudgetLinesPayload = (budgetLines = []) =>
  budgetLines.map((line, index) => ({
    lineType: line.lineType,
    category: line.category,
    amount: line.amount !== '' && line.amount != null ? Number(line.amount) : 0,
    sortOrder: index,
  }));

export const buildTentativePayload = (rows = []) =>
  rows
    .filter((row) => row.timeSlot?.trim() || row.activity?.trim() || row.personInCharge?.trim())
    .map((row, index) => ({
      timeSlot: row.timeSlot?.trim() || '',
      activity: row.activity?.trim() || '',
      personInCharge: row.personInCharge?.trim() || '',
      sortOrder: index,
    }));

export const buildSpeakersPayload = (speakers = []) =>
  speakers.map((speaker, index) => ({
    speakerName: speaker.speakerName?.trim() || '',
    position: speaker.position?.trim() || null,
    organization: speaker.organization?.trim() || null,
    email: speaker.email?.trim() || null,
    phone: speaker.phone?.trim() || null,
    cvPath: speaker.cvStoredPath || null,
    sortOrder: index,
  }));

export function buildProgrammeFormFileName(programmeTitle = '') {
  const safeTitle = String(programmeTitle || 'programme')
    .trim()
    .replace(/[^\w\-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 60);

  return `CampusLink_Programme_Form_${safeTitle || 'programme'}.pdf`;
}
