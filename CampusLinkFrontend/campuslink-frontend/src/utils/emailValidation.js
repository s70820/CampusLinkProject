const PERSONAL_EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const personalEmailHelperText =
  'Use your personal email (Gmail, Outlook, Yahoo, etc.) — not your UMT student email';

export function validatePersonalEmail(email) {
  if (!email || !email.trim()) {
    return false;
  }
  const normalized = email.trim().toLowerCase();
  if (normalized.endsWith('@ocean.umt.edu.my')) {
    return false;
  }
  return PERSONAL_EMAIL_REGEX.test(normalized);
}

export function personalEmailErrorMessage(email) {
  if (!email || !email.trim()) {
    return 'Personal email is required.';
  }
  if (email.trim().toLowerCase().endsWith('@ocean.umt.edu.my')) {
    return 'Please use your personal email, not your UMT student email (@ocean.umt.edu.my).';
  }
  return 'Please enter a valid personal email address (e.g. you@gmail.com).';
}
