const CATEGORY_COLORS = {
  Leadership: '#2563eb',
  Culture: '#8b5cf6',
  'Religious/Spirituality': '#10b981',
  Entrepreneurship: '#f59e0b',
  Volunteerism: '#06b6d4',
  Career: '#0ea5e9',
  Sports: '#ef4444',
  'Counselling and Student Well-being': '#6366f1',
};

export const getCategoryColor = (category) => CATEGORY_COLORS[category] || '#64748b';

export default CATEGORY_COLORS;
