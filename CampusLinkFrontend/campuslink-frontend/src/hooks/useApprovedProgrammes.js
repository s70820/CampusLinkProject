import { useCallback, useEffect, useState } from 'react';
import { fetchApprovedProgrammes } from '../services/studentProgrammeApi';
import { readStoredUser, USER_UPDATED_EVENT } from './useStoredUser';

export function useApprovedProgrammes() {
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reloadProgrammes = useCallback(() => {
    const userId = readStoredUser()?.id;
    setLoading(true);
    setError(null);
    return fetchApprovedProgrammes(userId)
      .then((data) => {
        setProgrammes(data);
        return data;
      })
      .catch((err) => {
        setProgrammes([]);
        setError(err?.response?.data?.message || 'Failed to load programmes.');
        return [];
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;

    reloadProgrammes().then(() => {
      if (cancelled) return;
    });

    const handleUserUpdated = () => {
      if (!cancelled) reloadProgrammes();
    };
    window.addEventListener(USER_UPDATED_EVENT, handleUserUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener(USER_UPDATED_EVENT, handleUserUpdated);
    };
  }, [reloadProgrammes]);

  return { programmes, loading, error, setProgrammes, reloadProgrammes };
}

export default useApprovedProgrammes;
