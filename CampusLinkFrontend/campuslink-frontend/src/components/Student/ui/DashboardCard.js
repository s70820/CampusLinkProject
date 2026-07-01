import React from 'react';
import { Box, Typography } from '@mui/material';

const VARIANT_COLORS = {
  blue: {
    bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    icon: '#2563eb',
    accent: '#1d4ed8',
    className: 'portal-stat-card--blue',
  },
  green: {
    bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
    icon: '#059669',
    accent: '#047857',
    className: 'portal-stat-card--green',
  },
  purple: {
    bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
    icon: '#7c3aed',
    accent: '#6d28d9',
    className: 'portal-stat-card--purple',
  },
  amber: {
    bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    icon: '#d97706',
    accent: '#b45309',
    className: 'portal-stat-card--amber',
  },
};

const DashboardCard = ({ label, value, subtitle, icon: Icon, variant = 'blue', onClick, valueVariant = 'auto' }) => {
  const colors = VARIANT_COLORS[variant] || VARIANT_COLORS.blue;

  const isTextValue = valueVariant === 'text'
    || (valueVariant === 'auto'
      && typeof value === 'string'
      && value !== '—'
      && Number.isNaN(Number(String(value).replace(/[%+,]/g, ''))));

  return (
    <Box
      className={`portal-card portal-card--interactive portal-stat-card ${colors.className}`}
      onClick={onClick}
      sx={{
        p: 2.75,
        pl: 3,
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        overflow: 'visible',
      }}
    >
      {Icon && (
        <Box
          className="portal-stat-card__icon"
          sx={{
            background: colors.bg,
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.1)',
            flexShrink: 0,
          }}
        >
          <Icon sx={{ color: colors.icon, fontSize: 28 }} />
        </Box>
      )}
      <Box sx={{ minWidth: 0, flex: 1, pt: 0.25 }}>
        <Typography sx={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 700, mb: 0.75, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
          {label}
        </Typography>
        <Typography
          sx={isTextValue ? {
            fontWeight: 800,
            fontSize: { xs: '1.05rem', sm: '1.15rem', md: '1.2rem' },
            color: colors.accent,
            lineHeight: 1.25,
            letterSpacing: '-0.01em',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          } : {
            fontWeight: 800,
            fontSize: '2rem',
            color: colors.accent,
            lineHeight: 1,
            letterSpacing: '-0.03em',
          }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography sx={{ color: '#64748b', fontSize: '0.78rem', mt: 0.75, fontWeight: 500 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default DashboardCard;
