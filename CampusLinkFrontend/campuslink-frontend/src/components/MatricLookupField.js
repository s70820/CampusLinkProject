import React from 'react';
import { Box, CircularProgress, TextField, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { getMatricFieldSx, useMatricLookup } from '../hooks/useMatricLookup';

function MatricLookupField({
  value,
  onChange,
  label,
  placeholder = 'e.g. S70462',
  required = false,
  size = 'small',
  fullWidth = true,
  disabled = false,
  onStatusChange,
  onStudentResolved,
  teamInvite = false,
  programmeId = null,
}) {
  const { status, message, student } = useMatricLookup(value, {
    enabled: !disabled,
    teamInvite,
    programmeId,
  });

  React.useEffect(() => {
    if (onStatusChange) onStatusChange(status);
  }, [status, onStatusChange]);

  React.useEffect(() => {
    if (status === 'found' && student && onStudentResolved) {
      onStudentResolved(student);
    }
  }, [status, student, onStudentResolved]);

  const isError = status === 'not_found' || status === 'invalid';

  return (
    <Box>
      <TextField
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        size={size}
        fullWidth={fullWidth}
        disabled={disabled}
        error={isError}
        InputProps={{
          endAdornment: status === 'checking' ? <CircularProgress size={16} /> : null,
        }}
        sx={{ '& .MuiOutlinedInput-root': getMatricFieldSx(status, Boolean(value)) }}
      />
      {message && (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mt: 0.5 }}>
          {status === 'found' ? (
            <CheckCircleOutlineIcon sx={{ fontSize: 15, color: '#16a34a', mt: 0.1 }} />
          ) : isError ? (
            <ErrorOutlineIcon sx={{ fontSize: 15, color: '#dc2626', mt: 0.1 }} />
          ) : null}
          <Typography
            sx={{
              fontSize: '0.72rem',
              lineHeight: 1.35,
              color: status === 'found' ? '#15803d' : status === 'checking' ? '#475569' : '#dc2626',
              fontWeight: status === 'found' ? 600 : 500,
            }}
          >
            {message}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default MatricLookupField;
