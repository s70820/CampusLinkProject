import { useCallback, useEffect, useState } from 'react';
import { fetchOrganizerProgrammes } from '../services/organizerApi';
import { useStoredUser } from './useStoredUser';

export function useOrganizerProgrammes(options = {}) {
  const { operationalOnly = false } = options;
  const { user } = useStoredUser();
  const role = (user?.role || 'STUDENT').toUpperCase();
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (role !== 'ORGANIZER' || !user?.id) {
      setProgrammes([]);
      setLoading(false);
      setError('');
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    fetchOrganizerProgrammes(user.id, { operationalOnly })
      .then((data) => {
        if (!cancelled) setProgrammes(data || []);
      })
      .catch((err) => {
        if (!cancelled) {
          const status = err.response?.status;
          const message = err.response?.data?.message
            || (status === 404
              ? 'Organizer service is unavailable. Please restart the backend server.'
              : 'Unable to load your programmes.');
          setError(message);
          setProgrammes([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [user?.id, role, reloadToken, operationalOnly]);

  return { programmes, loading, error, user, isOrganizer: role === 'ORGANIZER', refetch };
}

export default useOrganizerProgrammes;
