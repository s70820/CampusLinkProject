import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import StatusBadge from './StatusBadge';
import { getCategoryColor } from '../../../utils/categoryColors';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80';

const ProgrammeCard = ({
  programme,
  onViewDetails,
  onRegister,
}) => {
  const canRegister = programme.canRegister !== false;
  const alreadyRegistered = Boolean(programme.alreadyRegistered);
  const registrationLabel = programme.registrationStatusLabel || programme.registrationWindow?.label;
  const restrictionReason = programme.registrationRestrictionReason;

  return (
    <Box
      className="portal-card portal-card--interactive programme-card-portal"
      sx={{ transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}
    >
      <Box
        component="img"
        src={programme.image || FALLBACK_POSTER}
        alt={programme.title}
        className="programme-card-portal__image"
        onError={(event) => {
          event.currentTarget.onerror = null;
          const fallback = programme.posterFallback || FALLBACK_POSTER;
          if (event.currentTarget.src !== fallback) {
            event.currentTarget.src = fallback;
          }
        }}
      />
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1, gap: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: getCategoryColor(programme.category),
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {programme.category}
          </Typography>
          {registrationLabel && (
            <StatusBadge
              status={canRegister ? 'Registration Open' : registrationLabel}
            />
          )}
        </Box>

      <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', lineHeight: 1.3 }}>
        {programme.title}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {programme.organizerClub && (
          <Typography sx={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
            by {programme.organizerClub}
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#64748b', fontSize: '0.8rem' }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 15 }} />
            {programme.date} · {programme.time || 'TBA'}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#64748b', fontSize: '0.8rem' }}>
            <PlaceOutlinedIcon sx={{ fontSize: 15 }} />
            {programme.location}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, color: '#64748b', fontSize: '0.78rem' }}>
            <EventAvailableOutlinedIcon sx={{ fontSize: 15, mt: 0.1 }} />
            <Box>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                Registration: {programme.registrationDateRange || 'TBA'}
              </Typography>
              {programme.registrationWindow?.detail && (
                <Typography sx={{ fontSize: '0.72rem', color: canRegister ? '#15803d' : '#b45309', fontWeight: 700 }}>
                  {canRegister ? programme.registrationWindow.detail : (restrictionReason || programme.registrationWindow.detail)}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Box
            sx={{
              px: 1.25,
              py: 0.5,
              borderRadius: '6px',
            bgcolor: '#eff6ff',
            color: '#1d4ed8',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {programme.programmeLevel || programme.level || 'University'}
          </Box>
          <Box
            sx={{
              px: 1.25,
              py: 0.5,
              borderRadius: '6px',
            bgcolor: '#ecfdf5',
            color: '#047857',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {programme.merit} Merit
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mt: 'auto', pt: 1 }}>
          <Button variant="outlined" size="small" fullWidth onClick={() => onViewDetails(programme)}>
            Details
          </Button>
          <Button
            variant="contained"
            size="small"
            fullWidth
            disabled={!canRegister}
            onClick={() => canRegister && onRegister(programme)}
          >
            {alreadyRegistered ? 'Registered' : canRegister ? 'Register' : 'Unavailable'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ProgrammeCard;
