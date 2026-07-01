import { useEffect, useState } from 'react';
import { fetchHepaDashboard } from '../services/hepaApi';
import { readStoredUser } from './useStoredUser';

const EMPTY_DASHBOARD = {
  fullName: '',
  pendingProgrammeApproval: 0,
  approvedProgrammes: 0,
  rejectedProgrammes: 0,
  pendingRoleRequests: 0,
  approvedRoleRequests: 0,
  rejectedRoleRequests: 0,
  totalStudents: 0,
  totalOrganizers: 0,
  recentPendingProgrammes: [],
  recentRoleRequests: [],
};

export function useHepaDashboard() {
  const user = readStoredUser();
  const [data, setData] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const role = (user?.role || '').toUpperCase();

  useEffect(() => {
    if (role !== 'HEPA' || !user?.id) {
      setData(EMPTY_DASHBOARD);
      setLoading(false);
      setError('');
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchHepaDashboard(user.id)
      .then((dashboard) => {
        if (!cancelled) setData({ ...EMPTY_DASHBOARD, ...dashboard });
      })
      .catch((err) => {
        if (!cancelled) {
          const status = err.response?.status;
          setError(
            err.response?.data?.message
            || (status === 404
              ? 'HEPA service is unavailable. Please restart the backend server.'
              : 'Unable to load HEPA dashboard.')
          );
          setData(EMPTY_DASHBOARD);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user?.id, role]);

  return { data, loading, error, user, isHepa: role === 'HEPA' };
}

export default useHepaDashboard;
