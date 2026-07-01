import { useEffect, useState } from 'react';
import { fetchMppDashboard } from '../services/mppApi';
import { readStoredUser } from './useStoredUser';

const EMPTY_DASHBOARD = {
  fullName: '',
  faculty: '',
  pendingReview: 0,
  mppApproved: 0,
  mppRejected: 0,
  forwardedToHepa: 0,
  totalProgrammes: 0,
  recentPending: [],
};

export function useMppDashboard() {
  const user = readStoredUser();
  const [data, setData] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const role = (user?.role || '').toUpperCase();

  useEffect(() => {
    if (role !== 'MPP' || !user?.id) {
      setData(EMPTY_DASHBOARD);
      setLoading(false);
      setError('');
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchMppDashboard(user.id)
      .then((dashboard) => {
        if (!cancelled) setData({ ...EMPTY_DASHBOARD, ...dashboard });
      })
      .catch((err) => {
        if (!cancelled) {
          const status = err.response?.status;
          setError(
            err.response?.data?.message
            || (status === 404
              ? 'MPP service is unavailable. Please restart the backend server.'
              : 'Unable to load MPP dashboard.')
          );
          setData(EMPTY_DASHBOARD);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user?.id, role]);

  return { data, loading, error, user, isMpp: role === 'MPP' };
}

export default useMppDashboard;
