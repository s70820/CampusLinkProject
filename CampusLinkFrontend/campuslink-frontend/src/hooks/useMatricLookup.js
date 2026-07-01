import { useEffect, useState } from 'react';
import { lookupStudentByMatric } from '../services/programmeWorkflowApi';

export const MATRIC_PATTERN = /^S\d{5}$/i;

export const MATRIC_NOT_FOUND_MESSAGE =
  'This student is not registered on CampusLink+. Please ask them to register first.';

export const MATRIC_FOUND_MESSAGE = 'Student found on CampusLink+.';

export const MATRIC_INVALID_MESSAGE = 'Enter a valid matric number (e.g. S70462).';

export const MATRIC_TEAM_FOUND_MESSAGE = 'CampusLink+ account found.';

export function useMatricLookup(matric, { enabled = true, debounceMs = 350, teamInvite = false, programmeId = null } = {}) {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [student, setStudent] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      setMessage('');
      setStudent(null);
      return undefined;
    }

    const trimmed = (matric || '').trim();
    if (!trimmed) {
      setStatus('idle');
      setMessage('');
      setStudent(null);
      return undefined;
    }

    const normalized = trimmed.toUpperCase();
    if (!MATRIC_PATTERN.test(normalized)) {
      setStatus('invalid');
      setMessage(MATRIC_INVALID_MESSAGE);
      setStudent(null);
      return undefined;
    }

    let cancelled = false;
    setStatus('checking');
    setMessage('Checking matric number...');

    const timer = window.setTimeout(async () => {
      try {
        const response = await lookupStudentByMatric(normalized, { teamInvite, programmeId });
        if (cancelled) return;
        setStudent(response.data);
        setStatus('found');
        const foundLabel = teamInvite ? MATRIC_TEAM_FOUND_MESSAGE : MATRIC_FOUND_MESSAGE;
        setMessage(`${foundLabel} ${response.data.fullName} (${response.data.faculty || 'Faculty N/A'})${response.data.phoneNumber ? ` · ${response.data.phoneNumber}` : ''}.`);
      } catch (err) {
        if (cancelled) return;
        setStudent(null);
        setStatus('not_found');
        setMessage(err.response?.data?.message || MATRIC_NOT_FOUND_MESSAGE);
      }
    }, debounceMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [matric, enabled, debounceMs, teamInvite, programmeId]);

  return { status, message, student };
}

export function getMatricFieldSx(status, hasValue) {
  const palette = {
    idle: {
      border: hasValue ? 'rgba(37, 99, 235, 0.4)' : 'rgba(148, 163, 184, 0.45)',
      bg: hasValue ? '#f8fafc' : '#fff',
    },
    checking: {
      border: 'rgba(37, 99, 235, 0.55)',
      bg: '#f8fafc',
    },
    found: {
      border: '#16a34a',
      bg: '#f0fdf4',
    },
    not_found: {
      border: '#dc2626',
      bg: '#fef2f2',
    },
    invalid: {
      border: '#f59e0b',
      bg: '#fffbeb',
    },
  };
  const colors = palette[status] || palette.idle;
  return {
    borderRadius: 3,
    bgcolor: colors.bg,
    '& fieldset': { borderColor: colors.border },
    '&:hover fieldset': { borderColor: colors.border },
    '&.Mui-focused fieldset': { borderColor: colors.border },
  };
}
