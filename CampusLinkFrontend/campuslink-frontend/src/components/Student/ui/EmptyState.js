import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

const EmptyState = ({
  title = 'Nothing here yet',
  description = 'There are no items to display.',
  actionLabel,
  onAction,
  icon: Icon = InboxOutlinedIcon,
}) => (
  <Box
    className="portal-card"
    sx={{
      p: 5,
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
    }}
  >
    <Box
      sx={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        bgcolor: '#eff6ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon sx={{ fontSize: 36, color: '#2563eb' }} />
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
      {title}
    </Typography>
    <Typography sx={{ color: '#64748b', maxWidth: 360, fontSize: '0.9rem' }}>
      {description}
    </Typography>
    {actionLabel && onAction && (
      <Button variant="contained" onClick={onAction} sx={{ mt: 1 }}>
        {actionLabel}
      </Button>
    )}
  </Box>
);

export default EmptyState;
