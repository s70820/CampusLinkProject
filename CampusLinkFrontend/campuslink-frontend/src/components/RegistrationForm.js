import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Link,
  Typography,
} from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { readStoredUser } from '../hooks/useStoredUser';
import {
  fetchProgrammeAvailability,
  fetchStudentProfile,
  fileUrl,
  registerIndividual,
  registerTeam,
} from '../services/registrationApi';
import { buildProgrammeTerms, getRegistrationWindow } from '../utils/registrationWindow';
import { phoneValidationHelperText } from '../utils/phoneValidation';
import {
  buildInitialTeammates,
  countCompleteTeammates,
  getMaxTeamSize,
  getMaxTeammateSlots,
  getMinTeamSize,
  getRequiredTeammateSlots,
  getTeamSizeSummary,
  isRegistrationFormComplete,
  validatePaymentSection,
  validateTeamSection,
} from '../utils/registrationFormUtils';
import MatricLookupField from './MatricLookupField';
import { MATRIC_PATTERN } from '../hooks/useMatricLookup';
import { portalDialogPaperSx, portalInfoBoxSx } from './Student/ui/portalFilterStyles';

const readOnlySx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'rgba(239, 246, 255, 0.85)',
    borderRadius: '10px',
  },
  '& .MuiInputLabel-root': {
    fontWeight: 600,
  },
  '& .MuiOutlinedInput-input': {
    fontWeight: 600,
    color: '#0f172a',
  },
};

const sectionTitleSx = {
  fontWeight: 800,
  color: '#1e40af',
  fontSize: '0.85rem',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  mb: 1,
};

const RegistrationForm = ({ open, onClose, programme, onRegistered }) => {
  const navigate = useNavigate();
  const storedUser = readStoredUser();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teammates, setTeammates] = useState([{ matricNumber: '', phoneNumber: '' }]);
  const [teammateMatricStatuses, setTeammateMatricStatuses] = useState({});
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentFile, setPaymentFile] = useState(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);
  const [customResponses, setCustomResponses] = useState({});
  const [availability, setAvailability] = useState(null);

  const isPaid = Boolean(programme?.requiresPayment || programme?.isPaid);
  const isTeam = Boolean(programme?.isTeamEvent || programme?.isTeamProgramme);
  const minTeamSize = programme ? getMinTeamSize(programme) : null;
  const maxTeamSize = programme ? getMaxTeamSize(programme) : null;
  const requiredTeammateSlots = programme ? getRequiredTeammateSlots(programme) : 0;
  const maxTeammateSlots = programme ? getMaxTeammateSlots(programme) : null;
  const completeTeammateCount = countCompleteTeammates(teammates);
  const registrationWindow = useMemo(
    () => (programme ? getRegistrationWindow(programme) : null),
    [programme]
  );
  const termsSections = useMemo(
    () => (programme ? buildProgrammeTerms(programme) : []),
    [programme]
  );
  const slotsFull = availability?.full || programme?.registrationFull;
  const alreadyRegistered = Boolean(programme?.alreadyRegistered || availability?.alreadyRegistered);
  const eligibleToRegister = programme?.eligibleToRegister !== false
    && availability?.eligibleToRegister !== false
    && !alreadyRegistered;
  const registrationRestrictionReason = programme?.registrationRestrictionReason
    || availability?.registrationRestrictionReason
    || null;
  const canRegister = programme?.canRegister !== false
    && registrationWindow?.canRegister !== false
    && !slotsFull
    && eligibleToRegister
    && !alreadyRegistered;
  const customFields = programme?.customRegistrationFields || [];
  const isConfirmedRegistration = registrationResult?.status === 'ACTIVE';

  const suggestedReference = useMemo(() => {
    if (!programme?.paymentReferenceFormat || !profile?.matricNumber) return '';
    return programme.paymentReferenceFormat.replace('MatricNumber', profile.matricNumber);
  }, [programme, profile]);

  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  useEffect(() => {
    if (!open || !storedUser?.id) return;
    setLoadingProfile(true);
    fetchStudentProfile(storedUser.id)
      .then(setProfile)
      .catch(() => setProfile({ ...storedUser }))
      .finally(() => setLoadingProfile(false));
  }, [open, storedUser?.id]);

  useEffect(() => {
    if (!open) return;
    setTeamName('');
    setTeammates(programme ? buildInitialTeammates(programme) : [{ matricNumber: '', phoneNumber: '' }]);
    setTeammateMatricStatuses({});
    setPaymentReference('');
    setPaymentFile(null);
    setAgreeTerms(false);
    setConfirmOpen(false);
    setSuccessOpen(false);
    setRegistrationResult(null);
    setCustomResponses({});
    setAvailability(null);
    setSnackbar({ open: false, message: '', severity: 'info' });
  }, [open, programme?.id]);

  useEffect(() => {
    if (!open || !programme?.id) return undefined;
    const loadAvailability = () => {
      fetchProgrammeAvailability(programme.id, storedUser?.id)
        .then(setAvailability)
        .catch(() => setAvailability(null));
    };
    loadAvailability();
    const timer = setInterval(loadAvailability, 8000);
    return () => clearInterval(timer);
  }, [open, programme?.id, storedUser?.id]);

  useEffect(() => {
    if (suggestedReference && !paymentReference) {
      setPaymentReference(suggestedReference);
    }
  }, [suggestedReference, paymentReference]);

  const formComplete = useMemo(
    () => isRegistrationFormComplete({
      programme,
      profile,
      agreeTerms,
      canRegister,
      isPaid,
      isTeam,
      teamName,
      teammates,
      paymentReference,
      paymentFile,
    }),
    [programme, profile, agreeTerms, canRegister, isPaid, isTeam, teamName, teammates, paymentReference, paymentFile]
  );

  const validateForm = () => {
    if (!canRegister) {
      if (alreadyRegistered) {
        showSnackbar('You are already registered for this programme.', 'error');
        return false;
      }
      if (!eligibleToRegister && registrationRestrictionReason) {
        showSnackbar(registrationRestrictionReason, 'error');
        return false;
      }
      showSnackbar(
        registrationWindow?.status === 'NOT_OPEN'
          ? `Registration opens on ${registrationWindow.openLabel}.`
          : 'Registration has closed for this programme.',
        'error'
      );
      return false;
    }
    if (!profile?.fullName || !profile?.matricNumber) {
      showSnackbar('Your profile is incomplete. Please update your profile before registering.', 'error');
      return false;
    }
    if (!agreeTerms) {
      showSnackbar('Please agree to the programme terms and conditions.', 'error');
      return false;
    }
    const payment = validatePaymentSection(isPaid, paymentReference, paymentFile);
    if (!payment.valid) {
      showSnackbar(payment.error, 'error');
      return false;
    }
    if (isTeam && !teamName.trim()) {
      showSnackbar('Please enter a team name.', 'error');
      return false;
    }
    if (isTeam) {
      const team = validateTeamSection(programme, teammates, profile.matricNumber);
      if (!team.valid) {
        showSnackbar(team.error, 'error');
        return false;
      }
      const invalidTeammate = teammates.find((mate, index) => {
        const matric = mate.matricNumber?.trim().toUpperCase();
        if (!matric) return false;
        const status = teammateMatricStatuses[index];
        if (status === 'checking') return true;
        if (!MATRIC_PATTERN.test(matric)) return true;
        return status === 'not_found' || status === 'invalid';
      });
      if (invalidTeammate) {
        const idx = teammates.findIndex((mate) => mate === invalidTeammate);
        const status = teammateMatricStatuses[idx];
        if (status === 'checking') {
          showSnackbar('Please wait until teammate matric numbers finish verifying.', 'error');
        } else {
          showSnackbar('One or more teammate matric numbers are not registered on CampusLink+. Please ask them to register first.', 'error');
        }
        return false;
      }
    }
    for (const field of customFields) {
      const value = (customResponses[field.id] || '').trim();
      if (field.required && !value) {
        showSnackbar(`Please complete the required field: ${field.label}`, 'error');
        return false;
      }
    }
    if (slotsFull) {
      showSnackbar('Registration is full. All participant slots have been taken.', 'error');
      return false;
    }
    return true;
  };

  const handlePrepareSubmit = () => {
    if (!validateForm()) return;
    setConfirmOpen(true);
  };

  const handleConfirmRegistration = async () => {
    setSubmitting(true);
    try {
      const payload = {
        userId: storedUser.id,
        programmeId: programme.id,
        paymentReference: isPaid ? paymentReference.trim() : undefined,
        receipt: isPaid ? paymentFile : undefined,
        customResponses,
      };
      let result;
      if (isTeam) {
        const team = validateTeamSection(programme, teammates, profile.matricNumber);
        result = await registerTeam({
          ...payload,
          teamName: teamName.trim(),
          teammates: team.completeTeammates,
        });
      } else {
        result = await registerIndividual(payload);
      }
      setRegistrationResult(result);
      setConfirmOpen(false);
      setSuccessOpen(true);
      if (result?.status === 'ACTIVE') {
        showSnackbar('Registration successful! You are now registered for this programme.', 'success');
      } else if (result?.status === 'PENDING_PAYMENT_VERIFICATION') {
        showSnackbar('Registration submitted. Your payment is pending organizer verification.', 'success');
      } else if (result?.status === 'PENDING_TEAM') {
        showSnackbar('Registration submitted. Teammates will receive invitations to accept.', 'success');
      } else {
        showSnackbar('Registration submitted successfully.', 'success');
      }
      onRegistered?.();
    } catch (err) {
      const message = err.response?.data?.message
        || err.response?.data?.error
        || 'Registration failed. Please try again.';
      showSnackbar(message, 'error');
      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseAll = () => {
    setSuccessOpen(false);
    onClose();
  };

  const addTeammate = () => {
    if (maxTeammateSlots != null && teammates.length >= maxTeammateSlots) return;
    setTeammates((prev) => [...prev, { matricNumber: '', phoneNumber: '' }]);
  };

  const updateTeammate = (index, field, value) => {
    setTeammates((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  };

  const handleTeammateResolved = useCallback((index, student) => {
    if (!student?.phoneNumber) return;
    setTeammates((prev) => prev.map((t, i) => (
      i === index ? { ...t, phoneNumber: student.phoneNumber } : t
    )));
  }, []);

  const removeTeammate = (index) => {
    if (index < requiredTeammateSlots) return;
    setTeammates((prev) => prev.filter((_, i) => i !== index));
    setTeammateMatricStatuses((prev) => {
      const next = {};
      Object.entries(prev).forEach(([key, value]) => {
        const i = Number(key);
        if (i < index) next[i] = value;
        else if (i > index) next[i - 1] = value;
      });
      return next;
    });
  };

  if (!programme) return null;

  return (
    <>
      <Dialog open={open && !successOpen} onClose={onClose} maxWidth="md" fullWidth
        PaperProps={{ sx: portalDialogPaperSx, className: 'portal-light-surface' }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1, color: '#0f172a' }}>
          Register for {programme.title}
        </DialogTitle>
        <DialogContent sx={{ pt: 1, color: '#0f172a' }}>
          <Stack spacing={2.5}>
            {slotsFull && (
              <Alert severity="warning">
                Registration is full. All participant slots have been taken.
              </Alert>
            )}
            {!slotsFull && availability?.slotsRemaining != null && (
              <Alert severity="info">
                {availability.slotsRemaining} slot{availability.slotsRemaining === 1 ? '' : 's'} remaining — availability updates live while you complete this form.
              </Alert>
            )}

            <Box>
              <Typography sx={sectionTitleSx}>Student Information</Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mb: 1.5 }}>
                Auto-loaded from your CampusLink+ profile
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Full Name" value={profile?.fullName || ''} fullWidth size="small"
                    InputProps={{ readOnly: true }} sx={readOnlySx} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Matric Number" value={profile?.matricNumber || ''} fullWidth size="small"
                    InputProps={{ readOnly: true }} sx={readOnlySx} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Phone Number" value={profile?.phoneNumber || '—'} fullWidth size="small"
                    InputProps={{ readOnly: true }} sx={readOnlySx} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Faculty" value={profile?.faculty || '—'} fullWidth size="small"
                    InputProps={{ readOnly: true }} sx={readOnlySx} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Study Level" value={profile?.studyLevel || '—'} fullWidth size="small"
                    InputProps={{ readOnly: true }} sx={readOnlySx} />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            <Box>
              <Typography sx={sectionTitleSx}>Programme</Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <TextField label="Programme Title" value={programme.title} fullWidth size="small"
                    InputProps={{ readOnly: true }} sx={readOnlySx} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField label="Organizer Club" value={programme.organizerClub || '—'} fullWidth size="small"
                    InputProps={{ readOnly: true }} sx={readOnlySx} />
                </Grid>
              </Grid>
              <Box sx={{ ...portalInfoBoxSx, p: 1.5 }}>
                <Typography sx={{ fontSize: '0.78rem', color: '#64748b', mb: 0.5 }}>Registration Period</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  {programme.registrationDateRange || `${registrationWindow?.openLabel || 'TBA'} – ${registrationWindow?.closeLabel || 'TBA'}`}
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: canRegister ? '#15803d' : '#b45309', fontWeight: 700, mt: 0.5 }}>
                  {registrationWindow?.detail}
                </Typography>
              </Box>
              {!canRegister && (
                <Alert severity="warning" sx={{ mt: 1.5 }}>
                  {alreadyRegistered
                    ? 'You are already registered for this programme.'
                    : !eligibleToRegister && registrationRestrictionReason
                      ? registrationRestrictionReason
                      : registrationWindow?.status === 'FULL' || slotsFull
                        ? 'Registration is full. All participant slots have been taken.'
                        : registrationWindow?.status === 'NOT_OPEN'
                          ? `Registration has not opened yet. It opens on ${registrationWindow.openLabel}.`
                          : `Registration has closed. It closed on ${registrationWindow?.closeLabel || 'the deadline'}.`}
                </Alert>
              )}
            </Box>

            {customFields.length > 0 && (
              <Box>
                <Typography sx={sectionTitleSx}>Additional Information</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mb: 1.5 }}>
                  The organizer requires the following details for this programme.
                </Typography>
                <Stack spacing={1.5}>
                  {customFields.map((field) => (
                    <TextField
                      key={field.id}
                      label={field.label}
                      required={Boolean(field.required)}
                      value={customResponses[field.id] || ''}
                      onChange={(e) => setCustomResponses((prev) => ({
                        ...prev,
                        [field.id]: e.target.value,
                      }))}
                      fullWidth
                      size="small"
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {isTeam && (
              <Box>
                <Typography sx={sectionTitleSx}>Team Registration</Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  You are the team leader. {getTeamSizeSummary(programme)}.
                  {minTeamSize
                    ? ` You must add ${requiredTeammateSlots} teammate(s) with matric number and phone before you can register.`
                    : ' Add teammates by matric number and phone.'}
                  {' '}Teammates must accept their invitation after you submit.
                </Alert>
                {minTeamSize && (
                  <Typography sx={{ fontSize: '0.82rem', color: completeTeammateCount >= requiredTeammateSlots ? '#15803d' : '#b45309', fontWeight: 700, mb: 1.5 }}>
                    Teammates added: {completeTeammateCount} / {requiredTeammateSlots} required
                    {' · '}Team size: {1 + completeTeammateCount} / {minTeamSize} minimum
                  </Typography>
                )}
                <TextField
                  label="Team Name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  fullWidth
                  size="small"
                  required
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                />
                <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', mb: 1 }}>
                  Teammates {maxTeamSize ? `(max ${maxTeamSize} including you)` : ''}
                </Typography>
                <Stack spacing={1.5}>
                  {teammates.map((mate, index) => {
                    const isRequired = index < requiredTeammateSlots;
                    const canRemove = teammates.length > requiredTeammateSlots && index >= requiredTeammateSlots;
                    return (
                      <Grid container spacing={1} key={index} alignItems="center">
                        <Grid size={{ xs: 12, sm: 5 }}>
                          <MatricLookupField
                            label={isRequired ? `Teammate ${index + 1} Matric *` : `Teammate ${index + 1} Matric`}
                            value={mate.matricNumber}
                            onChange={(value) => updateTeammate(index, 'matricNumber', value)}
                            required={isRequired}
                            onStatusChange={(status) => {
                              setTeammateMatricStatuses((prev) => ({ ...prev, [index]: status }));
                            }}
                            onStudentResolved={(student) => handleTeammateResolved(index, student)}
                            teamInvite
                            programmeId={programme?.id}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 5 }}>
                          <TextField
                            label={isRequired ? `Teammate ${index + 1} Phone *` : `Teammate ${index + 1} Phone`}
                            value={mate.phoneNumber}
                            onChange={(e) => updateTeammate(index, 'phoneNumber', e.target.value)}
                            fullWidth
                            size="small"
                            required={isRequired}
                            helperText={isRequired ? phoneValidationHelperText : 'Auto-filled from profile when matric is verified; you may edit.'}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 2 }}>
                          {canRemove && (
                            <IconButton onClick={() => removeTeammate(index)} color="error" size="small">
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Grid>
                      </Grid>
                    );
                  })}
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addTeammate}
                    size="small"
                    sx={{ alignSelf: 'flex-start' }}
                    disabled={maxTeammateSlots != null && teammates.length >= maxTeammateSlots}
                  >
                    Add Teammate
                  </Button>
                </Stack>
              </Box>
            )}

            {isPaid && (
              <Box sx={portalInfoBoxSx}>
                <Typography sx={sectionTitleSx}>Payment Required</Typography>
                <Alert severity="warning" sx={{ mb: 1.5, fontSize: '0.85rem' }}>
                  Registration cannot be submitted without a payment reference and uploaded receipt.
                </Alert>
                {programme.registrationFee != null && (
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>
                    Registration Fee: RM {Number(programme.registrationFee).toFixed(2)}
                  </Typography>
                )}
                {programme.paymentInstructions && (
                  <Typography sx={{ color: '#475569', fontSize: '0.85rem', mb: 1.5, whiteSpace: 'pre-line' }}>
                    {programme.paymentInstructions}
                  </Typography>
                )}
                {programme.paymentReferenceFormat && (
                  <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mb: 1 }}>
                    Required reference format: <strong>{programme.paymentReferenceFormat}</strong>
                  </Typography>
                )}
                {programme.bankQrCode && (
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mb: 1 }}>Payment QR Code</Typography>
                    <Box component="img" src={fileUrl(programme.bankQrCode)} alt="Payment QR"
                      sx={{ maxWidth: 200, borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </Box>
                )}
                <TextField
                  label="Payment Reference"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  fullWidth size="small" required
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff' } }}
                />
                <input type="file" accept=".pdf,.png,.jpg,.jpeg,image/*,application/pdf"
                  onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                  style={{ display: 'none' }} id="payment-receipt-input" />
                <label htmlFor="payment-receipt-input">
                  <Button
                    variant={paymentFile ? 'contained' : 'outlined'}
                    color={paymentFile ? 'success' : 'primary'}
                    component="span"
                    fullWidth
                    startIcon={<CloudUploadIcon />}
                  >
                    {paymentFile ? `Receipt: ${paymentFile.name}` : 'Upload Payment Receipt (required)'}
                  </Button>
                </label>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 1 }}>
                  Status will remain Pending Approval until the organizer verifies your payment receipt.
                </Typography>
              </Box>
            )}

            <Box sx={portalInfoBoxSx}>
              <Typography sx={sectionTitleSx}>Terms & Conditions</Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mb: 1.5 }}>
                Please read the programme terms below before agreeing.
              </Typography>
              <Stack spacing={1.5} sx={{ maxHeight: 220, overflowY: 'auto', mb: 2 }}>
                {termsSections.map((section) => (
                  <Box key={section.title}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', mb: 0.5 }}>{section.title}</Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#475569', whiteSpace: 'pre-line', lineHeight: 1.55 }}>
                      {section.body}
                    </Typography>
                  </Box>
                ))}
              </Stack>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    disabled={!canRegister}
                  />
                }
                label="I have read and agree to the programme terms and conditions"
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={onClose} variant="outlined" disabled={submitting || loadingProfile}>Cancel</Button>
          <Button
            onClick={handlePrepareSubmit}
            variant="contained"
            disabled={submitting || loadingProfile || !canRegister || !formComplete}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => !submitting && setConfirmOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: portalDialogPaperSx, className: 'portal-light-surface' }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>Confirm Registration</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1.5 }}>
            You are about to register for:
          </Typography>
          <Typography sx={{ fontWeight: 800, color: '#1d4ed8', mb: 2 }}>{programme.title}</Typography>
          <Typography sx={{ color: '#64748b', fontSize: '0.9rem', mb: 1 }}>
            Please ensure all information is correct.
          </Typography>
          <Alert severity="warning" sx={{ mt: 1 }}>
            Registration cannot be cancelled once submitted.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} variant="outlined" disabled={submitting}>Cancel</Button>
          <Button onClick={handleConfirmRegistration} variant="contained" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Confirm Registration'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={successOpen} onClose={handleCloseAll} maxWidth="sm" fullWidth
        PaperProps={{ sx: portalDialogPaperSx, className: 'portal-light-surface' }}>
        <DialogTitle sx={{ fontWeight: 800, color: isConfirmedRegistration ? '#16a34a' : '#b45309' }}>
          {isConfirmedRegistration ? 'Registration Successful' : 'Registration Submitted'}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            {isConfirmedRegistration
              ? 'You have successfully registered for:'
              : 'Your application has been submitted for:'}
          </Typography>
          <Typography sx={{ fontWeight: 800, color: '#1d4ed8', mb: 2 }}>{programme.title}</Typography>
          {registrationResult?.status === 'PENDING_PAYMENT_VERIFICATION' && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: '10px' }}>
              Your registration is pending approval. The organizer will verify your payment receipt first.
              The participant group link will appear in My Registrations after approval.
            </Alert>
          )}
          {registrationResult?.status === 'PENDING_TEAM' && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: '10px' }}>
              Teammates will receive invitations and must accept before the team is fully registered.
              {minTeamSize ? ` Minimum team size: ${minTeamSize} members.` : ''}
              {' '}The participant group link will be available once your registration is confirmed.
            </Alert>
          )}
          {isConfirmedRegistration && registrationResult?.communicationLink && (
            <Alert
              severity="info"
              icon={<TelegramIcon />}
              sx={{ borderRadius: '10px', mb: 2 }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 0.5 }}>
                Join the participant group
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#475569', mb: 1 }}>
                Connect with other participants and receive instructions from the organizer.
              </Typography>
              <Link href={registrationResult.communicationLink} target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 700 }}>
                Open group link
              </Link>
            </Alert>
          )}
          <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>
            You can track your status under My Registrations.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleCloseAll} variant="outlined">Close</Button>
          {isConfirmedRegistration && registrationResult?.communicationLink && (
            <Button
              variant="outlined"
              component="a"
              href={registrationResult.communicationLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Group
            </Button>
          )}
          <Button variant="contained" onClick={() => { handleCloseAll(); navigate('/registrations'); }}>
            View Registration
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RegistrationForm;
