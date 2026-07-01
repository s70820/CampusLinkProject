export const CERTIFICATE_ORIENTATIONS = [
  { id: 'PORTRAIT', label: 'Portrait' },
  { id: 'LANDSCAPE', label: 'Landscape' },
];

export const CERTIFICATE_TEMPLATES = [
  {
    id: 'GEOMETRIC_MODERN',
    name: 'UMT Modern',
    description: 'Clean geometric navy and gold corners with a refined gold frame.',
    preview: { primary: '#062E59', accent: '#D4AF37', style: 'geometric' },
  },
  {
    id: 'LAUREL_AWARD',
    name: 'UMT Prestige',
    description: 'Formal laurel accent with elegant gold border and award styling.',
    preview: { primary: '#062E59', accent: '#D4AF37', style: 'laurel' },
  },
];

const LEGACY_TEMPLATE_MAP = {
  CLASSIC_GOLD: 'GEOMETRIC_MODERN',
  MINIMAL_GEO: 'GEOMETRIC_MODERN',
  FORMAL_FRAME: 'GEOMETRIC_MODERN',
  ELEGANT_BORDER: 'GEOMETRIC_MODERN',
  ELEGANT_RIBBON: 'LAUREL_AWARD',
  MODERN_SEAL: 'GEOMETRIC_MODERN',
  DIAGONAL_CONTEMPORARY: 'LAUREL_AWARD',
};

export const DEFAULT_CERTIFICATE_TEMPLATE = 'GEOMETRIC_MODERN';
export const DEFAULT_CERTIFICATE_ORIENTATION = 'PORTRAIT';

export function normalizeCertificateTemplate(value) {
  const normalized = (value || DEFAULT_CERTIFICATE_TEMPLATE).toUpperCase();
  const mapped = LEGACY_TEMPLATE_MAP[normalized] || normalized;
  return CERTIFICATE_TEMPLATES.some((item) => item.id === mapped)
    ? mapped
    : DEFAULT_CERTIFICATE_TEMPLATE;
}

export function normalizeCertificateOrientation(value) {
  const normalized = (value || DEFAULT_CERTIFICATE_ORIENTATION).toUpperCase();
  return CERTIFICATE_ORIENTATIONS.some((item) => item.id === normalized)
    ? normalized
    : DEFAULT_CERTIFICATE_ORIENTATION;
}

export function getCertificateTemplateLabel(templateId) {
  const resolved = normalizeCertificateTemplate(templateId);
  return CERTIFICATE_TEMPLATES.find((item) => item.id === resolved)?.name || resolved;
}
