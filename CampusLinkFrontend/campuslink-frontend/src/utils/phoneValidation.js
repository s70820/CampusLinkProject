export const normalizePhoneNumber = (phone) =>
  (phone || '').replace(/[\s\-().]/g, '');

export const validatePhoneNumber = (phone) => {
  const normalized = normalizePhoneNumber(phone);
  return /^\+?\d{8,15}$/.test(normalized);
};

export const phoneValidationHelperText =
  'Malaysian or international format (e.g. 0123456789, +60123456789, +12125551234)';
