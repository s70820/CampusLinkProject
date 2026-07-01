import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Html5Qrcode } from 'html5-qrcode';
import QrCodeScannerOutlinedIcon from '@mui/icons-material/QrCodeScannerOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import StudentLayout from './Student/layout/StudentLayout';
import PageHeader from './Student/ui/PageHeader';
import SectionCard from './Student/ui/SectionCard';
import DashboardCard from './Student/ui/DashboardCard';
import EmptyState from './Student/ui/EmptyState';
import StatusBadge from './Student/ui/StatusBadge';
import useStudentStats from '../hooks/useStudentStats';
import useStudentAttendance from '../hooks/useStudentAttendance';
import { readStoredUser } from '../hooks/useStoredUser';
import { checkInWithQr, fetchActiveAttendanceSessions } from '../services/studentPortalApi';

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Attendance = () => {
  const user = readStoredUser();
  const stats = useStudentStats();
  const { records, loading, reload } = useStudentAttendance();
  const [activeSessions, setActiveSessions] = useState([]);
  const [scanResult, setScanResult] = useState('No QR code scanned yet.');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(false);
  const html5QrCode = useRef(null);

  const loadActiveSessions = useCallback(() => {
    if (!user?.id) {
      setActiveSessions([]);
      return;
    }
    fetchActiveAttendanceSessions(user.id)
      .then((data) => setActiveSessions(data || []))
      .catch(() => setActiveSessions([]));
  }, [user?.id]);

  useEffect(() => {
    loadActiveSessions();
    const interval = window.setInterval(loadActiveSessions, 5000);
    return () => window.clearInterval(interval);
  }, [loadActiveSessions]);

  useEffect(() => () => {
    if (html5QrCode.current) html5QrCode.current.stop().catch(() => {});
  }, []);

  const processCheckIn = async (qrPayload) => {
    if (!user?.id) return;
    setCheckInLoading(true);
    setError('');
    setSuccess('');
    setScanResult(qrPayload);
    try {
      const result = await checkInWithQr(user.id, qrPayload);
      if (result?.success) {
        setSuccess(result.message || 'Check-in successful.');
        await reload();
        loadActiveSessions();
        window.dispatchEvent(new Event('campuslink:notifications-updated'));
      } else {
        setError(result?.message || 'Check-in failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed. Please try again.');
    } finally {
      setCheckInLoading(false);
    }
  };

  const stopScan = async () => {
    if (html5QrCode.current) {
      try {
        await html5QrCode.current.stop();
        await html5QrCode.current.clear();
      } catch (err) {
        console.warn(err);
      }
    }
    setScanning(false);
  };

  const startScan = async () => {
    setError('');
    setSuccess('');
    try {
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras?.length) {
        setError('No camera found on this device.');
        return;
      }
      html5QrCode.current = new Html5Qrcode('qr-reader');
      await html5QrCode.current.start(
        { deviceId: { exact: cameras[0].id } },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          stopScan();
          processCheckIn(decodedText);
        },
        () => {}
      );
      setScanning(true);
    } catch {
      setError('Unable to start camera. Please allow access and try again.');
    }
  };

  return (
    <StudentLayout>
      <PageHeader
        title="Attendance"
        subtitle="Scan QR codes to check in and view your attendance history."
      />

      <Box className="portal-grid portal-grid--stats" sx={{ mb: 3, gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <DashboardCard
          label="Sessions Attended"
          value={stats.sessionsAttended}
          subtitle="Total check-ins"
          icon={CheckCircleOutlinedIcon}
          variant="green"
        />
        <DashboardCard
          label="Attendance Rate"
          value={stats.attendanceRate}
          subtitle="Across all programmes"
          icon={QrCodeScannerOutlinedIcon}
          variant="blue"
        />
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard title="Active Attendance Sessions">
            {activeSessions.length === 0 ? (
              <EmptyState
                title="No active sessions"
                description="Active attendance sessions will appear here when organisers open check-in for your registered programmes."
                icon={EventAvailableOutlinedIcon}
              />
            ) : (
              <Stack spacing={1.5}>
                {activeSessions.map((session) => (
                  <Box
                    key={session.sessionId}
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      border: '1px solid rgba(34, 197, 94, 0.25)',
                      bgcolor: 'rgba(240, 253, 244, 0.85)',
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, mb: 0.5 }}>{session.programmeTitle}</Typography>
                    <Typography sx={{ color: '#475569', fontSize: '0.85rem' }}>
                      {session.sessionLabel} · Live now
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard title="QR Scanner" subtitle="Point your camera at the session QR code">
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Button variant="contained" fullWidth onClick={startScan} disabled={scanning || checkInLoading}>
                Start Scanner
              </Button>
              <Button variant="outlined" fullWidth onClick={stopScan} disabled={!scanning}>
                Stop
              </Button>
            </Stack>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {checkInLoading && (
              <Typography sx={{ color: '#64748b', fontSize: '0.85rem', mb: 2 }}>
                Verifying check-in...
              </Typography>
            )}
            <Box
              sx={{
                minHeight: 240,
                bgcolor: '#0f172a',
                borderRadius: '12px',
                p: 1,
                mb: 2,
                border: '2px dashed rgba(37,99,235,0.4)',
                overflow: 'hidden',
              }}
            >
              <div id="qr-reader" style={{ width: '100%' }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#64748b', mb: 0.5 }}>
              Last Scan
            </Typography>
            <Box
              sx={{
                p: 1.5,
                bgcolor: 'rgba(239, 246, 255, 0.85)',
                borderRadius: '8px',
                border: '1px solid rgba(37, 99, 235, 0.12)',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                color: '#475569',
                wordBreak: 'break-all',
              }}
            >
              {scanResult}
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      <SectionCard title="Attendance History" subtitle={loading ? 'Loading records...' : `${records.length} session${records.length === 1 ? '' : 's'}`}>
        {records.length === 0 && !loading ? (
          <EmptyState
            title="No attendance records available"
            description="Your attendance history will appear here after you check in to programme sessions."
            icon={EventAvailableOutlinedIcon}
          />
        ) : (
          <TableContainer className="portal-table">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Programme</TableCell>
                  <TableCell>Session</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Checked In</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{row.programmeTitle}</TableCell>
                    <TableCell>{row.sessionLabel}</TableCell>
                    <TableCell>
                      <StatusBadge status={row.attendanceStatus === 'PRESENT' ? 'Completed' : 'Pending'} />
                    </TableCell>
                    <TableCell sx={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                      {formatDateTime(row.checkedInAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionCard>
    </StudentLayout>
  );
};

export default Attendance;
