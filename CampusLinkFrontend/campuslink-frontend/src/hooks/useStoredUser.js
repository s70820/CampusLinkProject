import { useCallback, useEffect, useState } from 'react';

export const USER_UPDATED_EVENT = 'campuslink-user-updated';

const PROFILE_FIELDS = ['id', 'fullName', 'email', 'matricNumber', 'role', 'faculty', 'studyLevel', 'phoneNumber', 'avatarIndex', 'approvalStatus', 'clubName'];

const EMPTY_USER_STATS = {
  meritPoints: 0,
  programsJoined: 0,
  completedPrograms: 0,
  pendingApprovals: 0,
  attendanceRate: '0%',
};

const GUEST_USER = {
  ...EMPTY_USER_STATS,
  fullName: 'Student',
  email: '',
  matricNumber: '',
  role: 'STUDENT',
  faculty: '',
  studyLevel: '',
  phoneNumber: '',
  clubName: '',
  avatarIndex: 0,
};

/** Keep only identity/profile fields from stored JSON — never restore demo stats from localStorage. */
export function sanitizeStoredUser(raw) {
  if (!raw || typeof raw !== 'object') return {};
  return PROFILE_FIELDS.reduce((acc, key) => {
    if (raw[key] !== undefined && raw[key] !== null) acc[key] = raw[key];
    return acc;
  }, {});
}

export function readStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return { ...GUEST_USER };
    const stored = sanitizeStoredUser(JSON.parse(raw));
    return { ...GUEST_USER, ...stored, ...EMPTY_USER_STATS };
  } catch {
    return { ...GUEST_USER };
  }
}

export function saveStoredUser(user) {
  const profileOnly = sanitizeStoredUser(user);
  if (user.avatarIndex !== undefined) profileOnly.avatarIndex = user.avatarIndex;
  localStorage.setItem('user', JSON.stringify(profileOnly));
  window.dispatchEvent(new CustomEvent(USER_UPDATED_EVENT, { detail: readStoredUser() }));
}

export function useStoredUser() {
  const [user, setUser] = useState(readStoredUser);

  const refresh = useCallback(() => {
    setUser(readStoredUser());
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      setUser(readStoredUser());
    };
    window.addEventListener(USER_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(USER_UPDATED_EVENT, handleUpdate);
  }, []);

  return { user, setUser, refresh };
}

export default useStoredUser;
