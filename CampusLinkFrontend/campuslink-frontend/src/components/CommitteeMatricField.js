import React, { useEffect, useRef } from 'react';
import { Box, CircularProgress, TextField, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { getMatricFieldSx, useMatricLookup } from '../hooks/useMatricLookup';

function CommitteeMatricField({ value, onResolved, error, helperText, placeholder }) {
  const { status, message, student } = useMatricLookup(value);
  const onResolvedRef = useRef(onResolved);
  const lastResolvedKey = useRef('');

  useEffect(() => {
    onResolvedRef.current = onResolved;
  }, [onResolved]);

  useEffect(() => {
    const normalized = (value || '').trim().toUpperCase();
    if (status === 'found' && student) {
      const key = `found:${student.matricNumber}`;
      if (lastResolvedKey.current === key) return;
      lastResolvedKey.current = key;
      onResolvedRef.current({
        matricNumber: student.matricNumber,
        fullName: student.fullName,
        faculty: student.faculty,
        hasCampusLinkAccount: true,
      });
      return;
    }

    if (status === 'not_found' && normalized) {
      const key = `missing:${normalized}`;
      if (lastResolvedKey.current === key) return;
      lastResolvedKey.current = key;
      onResolvedRef.current({
        matricNumber: normalized,
        fullName: '',
        faculty: '',
        invalid: true,
      });
      return;
    }

    if (status === 'idle') {
      lastResolvedKey.current = '';
    }
  }, [status, student, value]);

  const showHelper = Boolean(helperText && !message);
  const isError = Boolean(error || status === 'not_found' || status === 'invalid');

  return (
    <Box>
      <TextField
        hiddenLabel
        variant="outlined"
        fullWidth
        placeholder={placeholder || 'e.g. S70462'}
        value={value}
        onChange={(e) => onResolved({ matricNumber: e.target.value, reset: true })}
        error={isError}
        InputProps={{
          endAdornment: status === 'checking' ? <CircularProgress size={18} /> : null,
        }}
        sx={{ '& .MuiOutlinedInput-root': getMatricFieldSx(status, Boolean(value)) }}
      />
      {message && (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mt: 0.75 }}>
          {status === 'found' ? (
            <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#16a34a', mt: 0.15 }} />
          ) : status === 'not_found' || status === 'invalid' ? (
            <ErrorOutlineIcon sx={{ fontSize: 16, color: '#dc2626', mt: 0.15 }} />
          ) : null}
          <Typography
            sx={{
              fontSize: '0.75rem',
              lineHeight: 1.4,
              color: status === 'found' ? '#15803d' : status === 'checking' ? '#475569' : '#dc2626',
              fontWeight: status === 'found' ? 600 : 500,
            }}
          >
            {message}
          </Typography>
        </Box>
      )}
      {showHelper && (
        <Typography sx={{ mt: 0.75, fontSize: '0.75rem', color: error ? 'error.main' : '#475569' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
}

export default CommitteeMatricField;
