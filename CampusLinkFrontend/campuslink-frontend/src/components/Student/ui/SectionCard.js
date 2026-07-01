import React from 'react';
import { Box, Typography } from '@mui/material';

const SectionCard = ({
  title,
  subtitle,
  action,
  children,
  noPadding = false,
  className = '',
}) => (
  <Box className={`portal-card ${className}`} sx={{ overflow: 'hidden' }}>
    {(title || action) && (
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 2,
          borderBottom: '1px solid rgba(37, 99, 235, 0.1)',
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          background: 'linear-gradient(90deg, rgba(239, 246, 255, 0.9) 0%, rgba(245, 249, 255, 0.7) 100%)',
        }}
      >
        <Box>
          {title && (
            <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography sx={{ color: '#475569', fontSize: '0.8rem', mt: 0.25, fontWeight: 500 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Box>
    )}
    <Box sx={{ p: noPadding ? 0 : 2.5 }}>{children}</Box>
  </Box>
);

export default SectionCard;
