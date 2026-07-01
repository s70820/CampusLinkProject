export const MERIT_STAR_ROWS = [
  { stars: 0, label: 'No Stars', range: '1 – 199' },
  { stars: 1, label: '1 Star', range: '200 – 399' },
  { stars: 2, label: '2 Stars', range: '400 – 599' },
  { stars: 3, label: '3 Stars', range: '600 – 799' },
  { stars: 4, label: '4 Stars', range: '800 – 999' },
  { stars: 4, label: '4 Stars', range: '1,000+ (organizer/committee merit < 300)' },
  { stars: 5, label: '5 Stars', range: '1,000+ (organizer/committee merit ≥ 300)' },
];

export function calculateMeritStars(totalPoints, committeePoints = 0) {
  const total = Number(totalPoints) || 0;
  const committee = Number(committeePoints) || 0;
  if (total < 200) return 0;
  if (total < 400) return 1;
  if (total < 600) return 2;
  if (total < 800) return 3;
  if (total < 1000) return 4;
  return committee >= 300 ? 5 : 4;
}

export function isMeritRecordCompleted(status) {
  return status === 'Completed' || status === 'COMPLETED';
}
