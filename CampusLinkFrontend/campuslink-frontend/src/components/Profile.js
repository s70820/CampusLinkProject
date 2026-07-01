import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import StudentLayout from './Student/layout/StudentLayout';
import PageHeader from './Student/ui/PageHeader';
import DashboardCard from './Student/ui/DashboardCard';
import SectionCard from './Student/ui/SectionCard';
import UserAvatar from './Student/ui/UserAvatar';
import AvatarPickerDialog from './Student/ui/AvatarPickerDialog';
import { useStoredUser, saveStoredUser } from '../hooks/useStoredUser';
import useStudentStats from '../hooks/useStudentStats';
import { fetchStudentProfile } from '../services/registrationApi';
import {
  normalizePhoneNumber,
  phoneValidationHelperText,
  validatePhoneNumber,
} from '../utils/phoneValidation';
import { portalFieldLabelSx, portalFieldValueSx } from './Student/ui/portalFilterStyles';

const Profile = () => {
  const { user, setUser } = useStoredUser();
  const stats = useStudentStats();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [editPhoneOpen, setEditPhoneOpen] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState(user.phoneNumber || '');
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (!user?.id) {
      setProfile(null);
      setLoadingProfile(false);
      return undefined;
    }
    let cancelled = false;
    setLoadingProfile(true);
    fetchStudentProfile(user.id)
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        const merged = { ...user, ...data };
        setUser(merged);
        saveStoredUser(merged);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingProfile(false);
      });
    return () => { cancelled = true; };
  }, [user?.id]);

  const display = profile || user;

  const handlePhoneChange = (event) => {
    setPhoneDraft(event.target.value);
    setPhoneError('');
  };

  const handleSavePhone = () => {
    if (!validatePhoneNumber(phoneDraft)) {
      setPhoneError('Enter a valid Malaysian or international number (8-15 digits).');
      return;
    }
    const updatedUser = { ...user, phoneNumber: normalizePhoneNumber(phoneDraft) };
    setUser(updatedUser);
    saveStoredUser(updatedUser);
    setProfile((prev) => (prev ? { ...prev, phoneNumber: updatedUser.phoneNumber } : prev));
    setEditPhoneOpen(false);
  };

  const handleAvatarSave = (index) => {
    const updatedUser = { ...user, avatarIndex: index };
    setUser(updatedUser);
    saveStoredUser(updatedUser);
  };

  return (
    <StudentLayout>
      <PageHeader title="My Profile" subtitle="Manage your account details and view your activity summary." />

      <Box
        className="portal-card"
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(239,246,255,0.85) 100%)',
          border: '1px solid rgba(37, 99, 235, 0.14)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                p: 0.5,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb22, #8b5cf622)',
              }}
            >
              <UserAvatar avatarIndex={user.avatarIndex} size={88} />
            </Box>
            <Button
              size="small"
              onClick={() => setAvatarDialogOpen(true)}
              startIcon={<PhotoCameraOutlinedIcon sx={{ fontSize: '14px !important' }} />}
              sx={{
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                minWidth: 'auto',
                px: 1.5,
                py: 0.5,
                bgcolor: '#2563eb',
                color: '#fff',
                borderRadius: '20px',
                fontSize: '0.7rem',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(37,99,235,0.35)',
                '&:hover': { bgcolor: '#1d4ed8' },
              }}
            >
              Change
            </Button>
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>{display.fullName}</Typography>
            <Typography sx={{ color: '#475569', fontSize: '0.9rem' }}>{display.email}</Typography>
            <Chip label={display.role} size="small" sx={{ mt: 1, bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 700 }} />
          </Box>
        </Box>
      </Box>

      <Box className="portal-grid portal-grid--stats" sx={{ mb: 3 }}>
        <DashboardCard label="Merit Points" value={stats.meritPoints} variant="amber" icon={EmojiEventsIcon} />
        <DashboardCard label="Programmes Joined" value={stats.programsJoined} variant="blue" icon={SchoolIcon} />
        <DashboardCard label="Attendance Rate" value={stats.attendanceRate} variant="green" icon={PersonIcon} />
      </Box>

      <SectionCard title="Profile Details">
        {loadingProfile ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ ...portalFieldLabelSx, mb: 0.5 }}>Matric Number</Typography>
              <Typography sx={portalFieldValueSx}>{display.matricNumber || '—'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ ...portalFieldLabelSx, mb: 0.5 }}>Phone Number</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography sx={portalFieldValueSx}>{display.phoneNumber || '—'}</Typography>
                <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => {
                  setPhoneDraft(display.phoneNumber || '');
                  setEditPhoneOpen(true);
                }}>
                  Edit
                </Button>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ ...portalFieldLabelSx, mb: 0.5 }}>Faculty</Typography>
              <Typography sx={portalFieldValueSx}>{display.faculty || '—'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ ...portalFieldLabelSx, mb: 0.5 }}>Study Level</Typography>
              <Typography sx={portalFieldValueSx}>{display.studyLevel || '—'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ ...portalFieldLabelSx, mb: 0.5 }}>Role</Typography>
              <Typography sx={portalFieldValueSx}>{display.role}</Typography>
            </Grid>
          </Grid>
        )}
      </SectionCard>

      <AvatarPickerDialog
        open={avatarDialogOpen}
        onClose={() => setAvatarDialogOpen(false)}
        currentIndex={user.avatarIndex || 0}
        onSave={handleAvatarSave}
      />

      <Dialog open={editPhoneOpen} onClose={() => setEditPhoneOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '12px', color: '#0f172a' }, className: 'portal-light-surface' }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>Edit Phone Number</DialogTitle>
        <DialogContent>
          <TextField
            label="Phone Number"
            value={phoneDraft}
            onChange={handlePhoneChange}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
            error={Boolean(phoneError)}
            helperText={phoneError || phoneValidationHelperText}
            placeholder="e.g. 0123456789, +60123456789"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditPhoneOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSavePhone}>Save</Button>
        </DialogActions>
      </Dialog>
    </StudentLayout>
  );
};

export default Profile;
