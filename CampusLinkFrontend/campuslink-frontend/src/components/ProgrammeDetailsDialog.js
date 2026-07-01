import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { buildProgrammeTerms } from '../utils/registrationWindow';
import {
  portalBodyTextSx,
  portalDialogPaperSx,
  portalFieldLabelSx,
  portalFieldValueSx,
  portalInfoBoxSx,
} from './Student/ui/portalFilterStyles';

const ProgrammeDetailsDialog = ({ open, onClose, programme, onRegister }) => {
  if (!programme) return null;

  const canRegister = programme.canRegister !== false;
  const alreadyRegistered = Boolean(programme.alreadyRegistered);
  const restrictionReason = programme.registrationRestrictionReason;
  const termsSections = buildProgrammeTerms(programme);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: portalDialogPaperSx, className: 'portal-light-surface' }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>{programme.title}</DialogTitle>
      <DialogContent sx={{ pt: 2, color: '#0f172a' }}>
        <Stack spacing={2}>
          {programme.image && (
            <Box
              sx={{
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                bgcolor: '#f8fafc',
                p: 1.5,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Box
                component="img"
                src={programme.image}
                alt={`${programme.title} poster`}
                sx={{
                  width: '100%',
                  maxHeight: 520,
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </Box>
          )}

          <Box>
            <Chip label={programme.category} sx={{ mb: 2, bgcolor: '#f1f5f9', color: '#0f172a', fontWeight: 700 }} />
            <Typography variant="body2" sx={{ ...portalFieldLabelSx, mb: 1 }}>Organizer</Typography>
            <Typography sx={{ ...portalFieldValueSx, mb: 1.5 }}>{programme.organizerClub || '—'}</Typography>
            <Typography variant="body2" sx={{ ...portalFieldLabelSx, mb: 1 }}>Level</Typography>
            <Typography sx={portalFieldValueSx}>{programme.level}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ ...portalFieldLabelSx, mb: 1 }}>Programme Date & Time</Typography>
            <Typography sx={portalFieldValueSx}>{programme.date} · {programme.time}</Typography>
          </Box>

          <Box sx={portalInfoBoxSx}>
            <Typography variant="body2" sx={{ ...portalFieldLabelSx, mb: 0.5 }}>Registration Period</Typography>
            <Typography sx={portalFieldValueSx}>{programme.registrationDateRange || 'TBA'}</Typography>
            <Typography sx={{ fontSize: '0.85rem', color: canRegister ? '#15803d' : '#b45309', fontWeight: 700, mt: 0.5 }}>
              {programme.registrationWindow?.detail || programme.registrationStatusLabel}
            </Typography>
          </Box>

          {!canRegister && (
            <Alert severity="warning">
              {restrictionReason || 'Registration is currently unavailable. Please check the registration period above.'}
            </Alert>
          )}

          <Box>
            <Typography variant="body2" sx={{ ...portalFieldLabelSx, mb: 1 }}>Venue</Typography>
            <Typography sx={portalFieldValueSx}>{programme.location}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ ...portalFieldLabelSx, mb: 1 }}>Description</Typography>
            <Typography sx={{ ...portalFieldValueSx, fontWeight: 500, lineHeight: 1.6 }}>{programme.description}</Typography>
          </Box>

          {programme.objectives && (
            <Box>
              <Typography variant="body2" sx={{ ...portalFieldLabelSx, mb: 1 }}>Objectives</Typography>
              <Typography sx={{ ...portalBodyTextSx, lineHeight: 1.6 }}>{programme.objectives}</Typography>
            </Box>
          )}

          {programme.expectedOutcomes && (
            <Box>
              <Typography variant="body2" sx={{ ...portalFieldLabelSx, mb: 1 }}>Expected Outcomes</Typography>
              <Typography sx={{ ...portalBodyTextSx, lineHeight: 1.6 }}>{programme.expectedOutcomes}</Typography>
            </Box>
          )}

          <Box sx={{ p: 2, bgcolor: '#eff6ff', borderRadius: 2 }}>
            <Typography variant="body2" sx={{ color: '#1d4ed8', mb: 1, fontWeight: 700 }}>
              Terms & Conditions
            </Typography>
            <Stack spacing={1.5}>
              {termsSections.map((section) => (
                <Box key={section.title}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', mb: 0.5, color: '#0f172a' }}>{section.title}</Typography>
                  <Typography sx={{ ...portalBodyTextSx, fontSize: '0.82rem', whiteSpace: 'pre-line' }}>
                    {section.body}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ ...portalFieldLabelSx, mb: 1 }}>Merit</Typography>
            <Typography sx={portalFieldValueSx}>{programme.merit} points</Typography>
          </Box>

          {programme.requiresPayment && (
            <Box sx={{ p: 2, backgroundColor: '#eff6ff', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: '#1d4ed8', mb: 1, fontWeight: 700 }}>Payment required</Typography>
              {programme.registrationFee != null && (
                <Typography sx={{ mb: 1, color: '#0f172a', fontWeight: 600 }}>
                  Registration fee: RM {Number(programme.registrationFee).toFixed(2)}
                </Typography>
              )}
              {programme.bankQrCode && (
                <Box
                  component="img"
                  src={programme.bankQrCode}
                  alt="Payment QR Code"
                  sx={{ width: '100%', maxWidth: 220, borderRadius: 2, border: '1px solid #cbd5e1' }}
                />
              )}
            </Box>
          )}

          {programme.isTeamEvent && (
            <Box sx={portalInfoBoxSx}>
              <Typography variant="body2" sx={{ color: '#1d4ed8', mb: 1, fontWeight: 700 }}>Team programme</Typography>
              <Typography sx={{ ...portalFieldValueSx, mb: 0.5 }}>
                Register as team leader and invite teammates by matric number and phone.
              </Typography>
              <Typography sx={portalBodyTextSx}>
                {programme.minTeamSize && programme.maxTeamSize
                  ? `Team size: minimum ${programme.minTeamSize}, maximum ${programme.maxTeamSize} members (including you).`
                  : programme.minTeamSize
                    ? `Minimum team size: ${programme.minTeamSize} members (including you).`
                    : programme.maxTeamSize
                      ? `Maximum team size: ${programme.maxTeamSize} members (including you).`
                      : 'Team size requirements apply.'}
                {' '}You cannot register until all required teammates are added.
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">Close</Button>
        <Button onClick={() => onRegister(programme)} variant="contained" disabled={!canRegister}>
          {alreadyRegistered ? 'Registered' : canRegister ? 'Register' : 'Registration Unavailable'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProgrammeDetailsDialog;
