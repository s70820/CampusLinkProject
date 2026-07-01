import { useEffect, useState } from 'react';
import { fetchOrganizerDashboard } from '../services/organizerApi';
import { readStoredUser } from './useStoredUser';

const EMPTY_DASHBOARD = {
  fullName: '',
  clubName: '',
  faculty: '',
  totalProgrammes: 0,
  pendingApproval: 0,
  approvedProgrammes: 0,
  draftProgrammes: 0,
  totalParticipants: 0,
  activeRegistrations: 0,
  averageParticipantsPerProgramme: 0,
  recentProgrammes: [],
};

export function useOrganizerDashboard() {
  const user = readStoredUser();
  const [data, setData] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const role = (user?.role || 'STUDENT').toUpperCase();

  useEffect(() => {
    if (role !== 'ORGANIZER' || !user?.id) {
      setData(EMPTY_DASHBOARD);
      setLoading(false);
      setError('');
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchOrganizerDashboard(user.id)
      .then((dashboard) => {
        if (!cancelled) setData({ ...EMPTY_DASHBOARD, ...dashboard });
      })
      .catch((err) => {
        if (!cancelled) {
          const status = err.response?.status;
          setError(
            err.response?.data?.message
            || (status === 404
              ? 'Organizer service is unavailable. Please restart the backend server.'
              : 'Unable to load organizer dashboard.')
          );
          setData(EMPTY_DASHBOARD);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user?.id, role]);

  return { data, loading, error, user, isOrganizer: role === 'ORGANIZER' };
}

export default useOrganizerDashboard;
