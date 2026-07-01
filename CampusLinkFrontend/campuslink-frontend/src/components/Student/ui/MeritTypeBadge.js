import React from 'react';
import { Chip } from '@mui/material';

const MERIT_TYPE_STYLES = {
  participant: { label: 'Participant', bg: '#dbeafe', color: '#1d4ed8' },
  committee: { label: 'Committee', bg: '#ede9fe', color: '#6d28d9' },
  special: { label: 'Special', bg: '#fef3c7', color: '#b45309' },
};

const MeritTypeBadge = ({ meritType }) => {
  const style = MERIT_TYPE_STYLES[meritType] || MERIT_TYPE_STYLES.participant;
  return (
    <Chip
      label={style.label}
      size="small"
      sx={{
        bgcolor: style.bg,
        color: style.color,
        fontWeight: 700,
        fontSize: '0.7rem',
        height: 22,
      }}
    />
  );
};

export default MeritTypeBadge;
