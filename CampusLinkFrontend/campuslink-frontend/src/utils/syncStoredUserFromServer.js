import { fetchStudentProfile } from '../services/registrationApi';
import { readStoredUser, saveStoredUser } from '../hooks/useStoredUser';
import { initializePortalOnLogin } from './portalContext';

export async function syncStoredUserFromServer(userId) {
  const profile = await fetchStudentProfile(userId);
  const current = readStoredUser();
  const previousRole = (current.role || 'STUDENT').toUpperCase();
  const merged = { ...current, ...profile };
  const nextRole = (merged.role || 'STUDENT').toUpperCase();
  const roleChanged = previousRole !== nextRole;
  saveStoredUser(merged);
  if (roleChanged) {
    initializePortalOnLogin(merged.role);
  }
  return { user: merged, roleChanged, previousRole, nextRole };
}
