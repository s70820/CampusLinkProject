import React from 'react';
import { Box, Typography } from '@mui/material';

const PortalHero = ({ eyebrow = 'Student Portal', title, subtitle, action }) => (
  <Box className="portal-card portal-card--hero portal-hero" sx={{ p: { xs: 2.5, sm: 3.5 }, mb: 3 }}>
    <Box className="portal-hero__orb portal-hero__orb--1" aria-hidden />
    <Box className="portal-hero__orb portal-hero__orb--2" aria-hidden />
    <Box className="portal-hero__orb portal-hero__orb--3" aria-hidden />
    <Box className="portal-hero__content" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
      <Box>
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.88)',
            fontSize: '0.75rem',
            fontWeight: 700,
            mb: 1,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            fontSize: { xs: '1.5rem', sm: '1.85rem' },
            textShadow: '0 2px 16px rgba(15, 23, 42, 0.18)',
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.95rem',
              mt: 1.25,
              maxWidth: 540,
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Box>
  </Box>
);

export default PortalHero;
