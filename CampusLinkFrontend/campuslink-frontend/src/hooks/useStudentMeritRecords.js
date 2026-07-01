import { useEffect, useState } from 'react';
import { fetchStudentMeritRecords } from '../services/studentPortalApi';
import { readStoredUser } from './useStoredUser';
import { isMeritRecordCompleted } from '../utils/meritStars';

function mapMeritType(roleType) {
  if (!roleType) return 'participant';
  const normalized = roleType.toLowerCase();
  if (normalized.includes('special')) return 'special';
  if (normalized.includes('director') || normalized.includes('mt') || normalized.includes('ajk')) {
    return 'committee';
  }
  return 'participant';
}

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
};

export function useStudentMeritRecords() {
  const user = readStoredUser();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setRecords([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchStudentMeritRecords(user.id)
      .then((data) => {
        if (cancelled) return;
        setRecords((data || []).map((row) => {
          const status = isMeritRecordCompleted(row.status) ? 'Completed' : (row.status || 'Pending');
          return {
            id: row.id,
            programmeTitle: row.programmeTitle,
            programmeLevel: row.programmeLevel,
            category: row.category || 'Co-curricular',
            role: row.role,
            meritAwarded: row.meritAwarded ?? 0,
            academicYear: row.academicYear,
            semester: row.semester,
            status,
            awardedAt: row.awardedAt,
            startDate: formatDate(row.startDate || row.awardedAt),
            endDate: formatDate(row.endDate || row.awardedAt),
            meritType: mapMeritType(row.meritRoleType),
          };
        }));
      })
      .catch(() => {
        if (!cancelled) setRecords([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user?.id]);

  return { records, loading };
}

export default useStudentMeritRecords;
