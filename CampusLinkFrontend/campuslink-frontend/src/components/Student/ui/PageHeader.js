import React from 'react';
import { Box, Typography } from '@mui/material';

const PageHeader = ({ title, subtitle, action }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 2,
      mb: 3,
      flexWrap: 'wrap',
    }}
  >
    <Box>
      <Typography
        variant="h5"
        sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', mb: 0.5 }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ color: '#475569', fontSize: '0.9rem', maxWidth: 560, fontWeight: 500 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
  </Box>
);

export default PageHeader;
