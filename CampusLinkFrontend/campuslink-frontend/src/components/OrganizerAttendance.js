import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import OrganizerLayout from './OrganizerLayout';
import PortalHero from './Student/ui/PortalHero';
import SectionCard from './Student/ui/SectionCard';
import DashboardCard from './Student/ui/DashboardCard';
import EmptyState from './Student/ui/EmptyState';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import QrCodeScannerOutlinedIcon from '@mui/icons-material/QrCodeScannerOutlined';
import FullscreenOutlinedIcon from '@mui/icons-material/FullscreenOutlined';
import CloseIcon from '@mui/icons-material/Close';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import { useStoredUser } from '../hooks/useStoredUser';
import useOrganizerProgrammes from '../hooks/useOrganizerProgrammes';
import { fetchProgrammeRegistrations } from '../services/registrationApi';
import {
  endAttendanceSession,
  fetchCurrentAttendanceSession,
  fetchProgrammeAttendance,
  pauseAttendanceSession,
  resumeAttendanceSession,
  startAttendanceSession,
} from '../services/organizerApi';
import { formatProgrammeDate } from '../utils/organizerProgrammeStatus';

const OrganizerAttendance = () => {
  const { user } = useStoredUser();
  const { programmes, loading, error: programmesError } = useOrganizerProgrammes({ operationalOnly: true });
  const [selectedProgrammeId, setSelectedProgrammeId] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [session, setSession] = useState(null);
  const [sessionError, setSessionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [qrFullscreenOpen, setQrFullscreenOpen] = useState(false);

  const qrImageUrl = useMemo(() => {
    if (!session?.qrPayload) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(session.qrPayload)}`;
  }, [session?.qrPayload]);

  useEffect(() => {
    if (!selectedProgrammeId && programmes.length > 0) {
      setSelectedProgrammeId(String(programmes[0].id));
    }
  }, [programmes, selectedProgrammeId]);

  const loadRegistrations = useCallback(async (programmeId) => {
    if (!programmeId) {
      setRegistrations([]);
      return;
    }
    setLoadingRegs(true);
    try {
      const data = await fetchProgrammeRegistrations(programmeId);
      setRegistrations(data.filter((r) => r.status === 'ACTIVE'));
    } catch {
      setRegistrations([]);
    } finally {
      setLoadingRegs(false);
    }
  }, []);

  const loadAttendanceRows = useCallback(async (programmeId) => {
    if (!user?.id || !programmeId) {
      setAttendanceRows([]);
      return;
    }
    try {
      const data = await fetchProgrammeAttendance(user.id, programmeId);
      setAttendanceRows(data || []);
    } catch {
      setAttendanceRows([]);
    }
  }, [user?.id]);

  const refreshSession = useCallback(async () => {
    if (!user?.id || !selectedProgrammeId) {
      setSession(null);
      return;
    }
    try {
      const data = await fetchCurrentAttendanceSession(user.id, selectedProgrammeId);
      setSession(data || null);
      setSessionError('');
    } catch (err) {
      setSession(null);
      setSessionError(err.response?.data?.message || 'Unable to load attendance session.');
    }
  }, [selectedProgrammeId, user?.id]);

  useEffect(() => {
    if (selectedProgrammeId) {
      loadRegistrations(selectedProgrammeId);
      refreshSession();
    }
  }, [selectedProgrammeId, loadRegistrations, refreshSession]);

  useEffect(() => {
    if (!session || !['ACTIVE', 'PAUSED'].includes(session.status)) {
      return undefined;
    }
    const interval = window.setInterval(() => {
      refreshSession();
      loadAttendanceRows(selectedProgrammeId);
    }, 2000);
    return () => window.clearInterval(interval);
  }, [session, selectedProgrammeId, refreshSession, loadAttendanceRows]);

  useEffect(() => {
    if (session?.sessionId) {
      loadAttendanceRows(selectedProgrammeId);
    }
  }, [session?.sessionId, selectedProgrammeId, loadAttendanceRows]);

  const selectedProgramme = programmes.find((p) => String(p.id) === String(selectedProgrammeId));
  const sessionStatus = session?.status || 'IDLE';
  const isLive = sessionStatus === 'ACTIVE';
  const isPaused = sessionStatus === 'PAUSED';

  const checkedInForSession = useMemo(() => {
    if (!session?.sessionLabel) return new Set();
    return new Set(
      attendanceRows
        .filter((row) => row.sessionLabel === session.sessionLabel && row.attendanceStatus === 'PRESENT')
        .map((row) => (row.matricNumber || '').toUpperCase())
        .filter(Boolean)
    );
  }, [attendanceRows, session?.sessionLabel]);

  const filteredAttendees = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return registrations.filter((item) =>
      (item.studentFullName || '').toLowerCase().includes(query)
      || (item.matricNumber || '').toLowerCase().includes(query)
      || (item.faculty || '').toLowerCase().includes(query)
    );
  }, [registrations, searchTerm]);

  const runSessionAction = async (action) => {
    if (!user?.id || !selectedProgrammeId) return;
    setActionLoading(true);
    setSessionError('');
    try {
      const data = await action(user.id, selectedProgrammeId);
      setSession(data || null);
      await loadAttendanceRows(selectedProgrammeId);
    } catch (err) {
      setSessionError(err.response?.data?.message || 'Unable to update attendance session.');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (!isLive) {
      setQrFullscreenOpen(false);
    }
  }, [isLive]);

  const sessionLabelDisplay = isLive ? 'Live' : isPaused ? 'Paused' : 'Idle';

  return (
    <OrganizerLayout>
      <PortalHero
        eyebrow="Organizer Portal"
        title="Live Attendance"
        subtitle={
          user.clubName
            ? `Run attendance sessions for ${user.clubName} programmes using dynamic QR codes.`
            : 'Start attendance sessions and monitor registered participants.'
        }
      />

      {programmesError && (
        <Alert severity="warning" sx={{ mb: 3 }}>{programmesError}</Alert>
      )}
      {sessionError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSessionError('')}>{sessionError}</Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : programmes.length === 0 ? (
        <EmptyState title="No programmes available" description="Create and approve a programme before running attendance." />
      ) : (
        <>
          <SectionCard title="Select Programme" sx={{ mb: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              value={selectedProgrammeId}
              onChange={(e) => setSelectedProgrammeId(e.target.value)}
              sx={{ maxWidth: 480 }}
            >
              {programmes.map((programme) => (
                <MenuItem key={programme.id} value={String(programme.id)}>
                  {programme.title}
                </MenuItem>
              ))}
            </TextField>
          </SectionCard>

          <Box className="portal-grid portal-grid--stats" sx={{ mb: 3 }}>
            <DashboardCard label="Registered" value={registrations.length} subtitle="Active participants" icon={GroupsOutlinedIcon} variant="blue" />
            <DashboardCard label="Checked in" value={session?.checkedInCount ?? 0} subtitle="This session" icon={EventAvailableOutlinedIcon} variant="green" />
            <DashboardCard label="Session" value={sessionLabelDisplay} subtitle={selectedProgramme ? formatProgrammeDate(selectedProgramme.startDate) : '—'} icon={QrCodeScannerOutlinedIcon} variant="purple" />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1.2fr' }, gap: 3 }}>
            <SectionCard title="Attendance Session">
              <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{selectedProgramme?.title}</Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.9rem', mb: 2 }}>
                Students scan the QR code from the student Attendance page when the session is live.
              </Typography>
              <Box sx={{ bgcolor: '#f8fafc', borderRadius: '12px', p: 2, mb: 2, minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {isLive && session?.qrPayload ? (
                  <>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(session.qrPayload)}`}
                      alt="Attendance QR"
                      style={{ maxWidth: 260 }}
                    />
                    <IconButton
                      aria-label="Open QR code fullscreen"
                      onClick={() => setQrFullscreenOpen(true)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: '#fff',
                        border: '1px solid rgba(148, 163, 184, 0.35)',
                        '&:hover': { bgcolor: '#f1f5f9' },
                      }}
                    >
                      <FullscreenOutlinedIcon />
                    </IconButton>
                  </>
                ) : isPaused ? (
                  <Typography color="text.secondary">Session paused. Resume to display the QR code again.</Typography>
                ) : (
                  <Typography color="text.secondary">Start the session to display the live QR code.</Typography>
                )}
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {isLive && session?.qrPayload && (
                  <Button
                    variant="outlined"
                    startIcon={<FullscreenOutlinedIcon />}
                    onClick={() => setQrFullscreenOpen(true)}
                  >
                    Fullscreen QR
                  </Button>
                )}
                <Button
                  variant="contained"
                  disabled={actionLoading || isLive || isPaused}
                  onClick={() => runSessionAction(startAttendanceSession)}
                >
                  Start Session
                </Button>
                {isLive && (
                  <Button variant="outlined" disabled={actionLoading} onClick={() => runSessionAction(pauseAttendanceSession)}>
                    Pause
                  </Button>
                )}
                {isPaused && (
                  <Button variant="outlined" disabled={actionLoading} onClick={() => runSessionAction(resumeAttendanceSession)}>
                    Resume
                  </Button>
                )}
                <Button
                  variant="outlined"
                  color="error"
                  disabled={actionLoading || (!isLive && !isPaused)}
                  onClick={() => runSessionAction(endAttendanceSession)}
                >
                  End Session
                </Button>
              </Stack>
              {isLive && session && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  {session.sessionLabel} · token refreshes in {session.countdownSeconds}s
                </Alert>
              )}
            </SectionCard>

            <SectionCard
              title="Registered Participants"
              subtitle="Active registrations eligible for check-in"
              action={(
                <TextField
                  size="small"
                  placeholder="Search name or matric"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              )}
            >
              {loadingRegs ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={28} /></Box>
              ) : filteredAttendees.length === 0 ? (
                <EmptyState title="No active registrations" description="Participants will appear here once their registration is confirmed." />
              ) : (
                <Box className="portal-table-wrap">
                  <Table className="portal-table" size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Matric</TableCell>
                        <TableCell>Faculty</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredAttendees.map((row) => {
                        const checkedIn = checkedInForSession.has((row.matricNumber || '').toUpperCase());
                        return (
                          <TableRow key={row.id}>
                            <TableCell>{row.studentFullName}</TableCell>
                            <TableCell>{row.matricNumber}</TableCell>
                            <TableCell>{row.faculty || '—'}</TableCell>
                            <TableCell>
                              <Chip
                                label={checkedIn ? 'Checked in' : 'Registered'}
                                size="small"
                                color={checkedIn ? 'success' : 'default'}
                                variant={checkedIn ? 'filled' : 'outlined'}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </SectionCard>
          </Box>

          <Dialog
            fullScreen
            className="attendance-qr-fullscreen"
            open={qrFullscreenOpen && isLive && Boolean(session?.qrPayload)}
            onClose={() => setQrFullscreenOpen(false)}
            sx={{
              '& .MuiDialog-paper': {
                bgcolor: '#0f172a !important',
                color: '#f8fafc !important',
                display: 'flex !important',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                maxWidth: '100%',
                height: '100%',
                m: 0,
                p: { xs: 2, md: 4 },
              },
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: 720,
                mx: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <IconButton
                aria-label="Close fullscreen QR"
                onClick={() => setQrFullscreenOpen(false)}
                sx={{
                  position: 'absolute',
                  top: { xs: -8, md: -16 },
                  right: { xs: 0, md: -8 },
                  color: '#0f172a',
                  bgcolor: '#fff',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  '&:hover': { bgcolor: '#f1f5f9' },
                }}
              >
                <CloseIcon />
              </IconButton>

              <Typography
                sx={{
                  color: '#f8fafc !important',
                  fontWeight: 800,
                  fontSize: { xs: '1.25rem', md: '1.75rem' },
                  mb: 1,
                  px: 2,
                }}
              >
                {selectedProgramme?.title}
              </Typography>
              <Typography
                sx={{
                  color: '#e2e8f0 !important',
                  mb: 3,
                  fontSize: { xs: '0.95rem', md: '1.05rem' },
                  px: 2,
                }}
              >
                Scan to check in · {session?.sessionLabel}
              </Typography>

              <Box
                sx={{
                  bgcolor: '#ffffff',
                  borderRadius: 4,
                  p: { xs: 2.5, md: 3 },
                  boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                }}
              >
                {qrImageUrl && (
                  <Box
                    component="img"
                    src={qrImageUrl}
                    alt="Attendance QR fullscreen"
                    sx={{
                      width: { xs: 'min(68vw, 68vh)', sm: 'min(56vw, 56vh)' },
                      height: { xs: 'min(68vw, 68vh)', sm: 'min(56vw, 56vh)' },
                      maxWidth: 480,
                      maxHeight: 480,
                      objectFit: 'contain',
                      display: 'block',
                      mx: 'auto',
                    }}
                  />
                )}
              </Box>

              {session && (
                <Typography
                  sx={{
                    color: '#cbd5e1 !important',
                    mt: 3,
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  Token refreshes in {session.countdownSeconds}s
                </Typography>
              )}

              <Button
                variant="contained"
                onClick={() => setQrFullscreenOpen(false)}
                sx={{
                  mt: 3,
                  bgcolor: '#fff',
                  color: '#0f172a',
                  fontWeight: 700,
                  px: 3,
                  '&:hover': { bgcolor: '#e2e8f0' },
                }}
              >
                Exit Fullscreen
              </Button>
            </Box>
          </Dialog>
        </>
      )}
    </OrganizerLayout>
  );
};

export default OrganizerAttendance;
