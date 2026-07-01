import { useCallback, useEffect, useState } from 'react';
import { fetchStudentAttendance } from '../services/studentPortalApi';
import { readStoredUser } from './useStoredUser';

export function useStudentAttendance() {
  const user = readStoredUser();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    if (!user?.id) {
      setRecords([]);
      setLoading(false);
      return Promise.resolve([]);
    }
    setLoading(true);
    return fetchStudentAttendance(user.id)
      .then((data) => {
        const next = data || [];
        setRecords(next);
        return next;
      })
      .catch(() => {
        setRecords([]);
        return [];
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { records, loading, reload };
}

export default useStudentAttendance;
