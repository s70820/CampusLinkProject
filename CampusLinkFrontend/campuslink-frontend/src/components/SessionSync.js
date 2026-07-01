import { useEffect } from 'react';
import { readStoredUser } from '../hooks/useStoredUser';
import { syncStoredUserFromServer } from '../utils/syncStoredUserFromServer';

/**
 * Keeps localStorage user role in sync with the database after HEPA approvals.
 */
export default function SessionSync() {
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = readStoredUser();
    if (!token || !user?.id) return undefined;

    let cancelled = false;
    syncStoredUserFromServer(user.id).catch(() => {
      if (!cancelled) {
        // Profile sync is best-effort; stale session will be corrected on next login.
      }
    });

    return () => { cancelled = true; };
  }, []);

  return null;
}
