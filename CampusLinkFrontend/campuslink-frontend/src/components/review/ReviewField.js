import React from 'react';
import { Box, Grid, Typography } from '@mui/material';

export function ReviewField({ label, value, xs = 12, sm = 6 }) {
  const isEmpty = value === null || value === undefined || value === '';
  const display = isEmpty ? '—' : value;
  return (
    <Grid item xs={xs} sm={sm}>
      <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mb: 0.5, fontWeight: 600 }}>{label}</Typography>
      {React.isValidElement(display) ? (
        <Box>{display}</Box>
      ) : (
        <Typography sx={{ fontWeight: 600, color: '#0f172a', whiteSpace: 'pre-wrap' }}>{display}</Typography>
      )}
    </Grid>
  );
}

export function ReviewSection({ title, children }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: '0.9rem',
          color: '#1e3a8a',
          mb: 1.5,
          pb: 0.75,
          borderBottom: '2px solid rgba(37, 99, 235, 0.15)',
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export default ReviewField;
