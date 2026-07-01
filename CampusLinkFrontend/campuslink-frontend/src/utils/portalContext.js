export const PORTAL_UPDATED_EVENT = 'campuslink-portal-updated';
const STORAGE_KEY = 'campuslink-active-portal';

export const PORTAL_LABELS = {
  student: 'Student Portal',
  organizer: 'Organizer Portal',
  mpp: 'MPP Portal',
  hepa: 'HEPA Portal',
};

export function getAccountRole() {
  try {
    const raw = localStorage.getItem('user');
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.role?.toString()?.toUpperCase() || 'STUDENT';
  } catch {
    return 'STUDENT';
  }
}

export function getDefaultPortal(accountRole) {
  const role = (accountRole || 'STUDENT').toUpperCase();
  if (role === 'HEPA') return 'hepa';
  if (role === 'MPP') return 'mpp';
  if (role === 'ORGANIZER') return 'organizer';
  return 'student';
}

export function getAvailablePortals(accountRole) {
  const role = (accountRole || 'STUDENT').toUpperCase();
  if (role === 'ORGANIZER') return ['organizer', 'student'];
  if (role === 'MPP') return ['mpp', 'student'];
  if (role === 'HEPA') return ['hepa'];
  return ['student'];
}

export function canSwitchPortal(accountRole) {
  return getAvailablePortals(accountRole).length > 1;
}

export function getActivePortal(accountRole = getAccountRole()) {
  const role = (accountRole || 'STUDENT').toUpperCase();
  const available = getAvailablePortals(role);
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && available.includes(stored)) return stored;
  const defaultPortal = getDefaultPortal(role);
  if (stored && !available.includes(stored)) {
    localStorage.setItem(STORAGE_KEY, defaultPortal);
  }
  return defaultPortal;
}

export function getActivePortalLabel(accountRole = getAccountRole()) {
  const portal = getActivePortal(accountRole);
  return PORTAL_LABELS[portal] || PORTAL_LABELS.student;
}

export function setActivePortal(portal) {
  const accountRole = getAccountRole();
  const available = getAvailablePortals(accountRole);
  if (!available.includes(portal)) return;
  localStorage.setItem(STORAGE_KEY, portal);
  window.dispatchEvent(new CustomEvent(PORTAL_UPDATED_EVENT, { detail: portal }));
}

export function getPortalDashboardPath(portal) {
  switch (portal) {
    case 'hepa': return '/admin/dashboard';
    case 'mpp': return '/mpp/dashboard';
    case 'organizer': return '/organizer/dashboard';
    default: return '/student/dashboard';
  }
}

export function clearActivePortal() {
  localStorage.removeItem(STORAGE_KEY);
}

export function initializePortalOnLogin(accountRole) {
  const portal = getDefaultPortal(accountRole);
  localStorage.setItem(STORAGE_KEY, portal);
  window.dispatchEvent(new CustomEvent(PORTAL_UPDATED_EVENT, { detail: portal }));
  return portal;
}
