import { useEffect, useMemo, useState } from 'react';
import { fetchStudentDashboardStats } from '../services/studentPortalApi';
import { readStoredUser } from './useStoredUser';

const EMPTY_STATS = {
  meritPoints: 0,
  programsJoined: 0,
  completedPrograms: 0,
  pendingApprovals: 0,
  attendanceRate: '0%',
  certificatesReady: 0,
  sessionsAttended: 0,
};

export function useStudentStats() {
  const user = readStoredUser();
  const [stats, setStats] = useState(EMPTY_STATS);

  useEffect(() => {
    if (!user?.id) {
      setStats(EMPTY_STATS);
      return;
    }
    let cancelled = false;
    fetchStudentDashboardStats(user.id)
      .then((data) => {
        if (!cancelled) {
          setStats({
            meritPoints: data.meritPoints ?? 0,
            programsJoined: data.programsJoined ?? 0,
            completedPrograms: data.completedPrograms ?? 0,
            pendingApprovals: data.pendingApprovals ?? 0,
            attendanceRate: data.attendanceRate ?? '0%',
            certificatesReady: data.certificatesReady ?? 0,
            sessionsAttended: data.sessionsAttended ?? 0,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setStats(EMPTY_STATS);
      });
    return () => { cancelled = true; };
  }, [user?.id]);

  return useMemo(() => stats, [stats]);
}

export default useStudentStats;
