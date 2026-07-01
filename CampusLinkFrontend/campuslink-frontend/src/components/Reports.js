import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import TableViewOutlinedIcon from '@mui/icons-material/TableViewOutlined';
import OrganizerLayout from './OrganizerLayout';
import PortalHero from './Student/ui/PortalHero';
import SectionCard from './Student/ui/SectionCard';
import DashboardCard from './Student/ui/DashboardCard';
import EmptyState from './Student/ui/EmptyState';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import { useStoredUser } from '../hooks/useStoredUser';
import useOrganizerProgrammes from '../hooks/useOrganizerProgrammes';
import { fetchProgrammeRegistrations } from '../services/registrationApi';
import { fetchProgrammeAttendance } from '../services/organizerApi';
import { exportReportCsv, exportReportPdf } from '../utils/exportProgrammeReport';
import { formatProgrammeDate } from '../utils/organizerProgrammeStatus';

const REPORT_TYPES = ['Registration Report', 'Attendance Summary', 'Merit Summary'];

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

const Reports = () => {
  const { user } = useStoredUser();
  const { programmes, loading, error: programmesError } = useOrganizerProgrammes({ operationalOnly: true });
  const [programmeId, setProgrammeId] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedReport, setSelectedReport] = useState(REPORT_TYPES[0]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [exporting, setExporting] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!programmeId && programmes.length > 0) {
      setProgrammeId(String(programmes[0].id));
    }
  }, [programmes, programmeId]);

  useEffect(() => {
    if (!programmeId || !user?.id) return;
    setLoadingRegs(true);
    Promise.all([
      fetchProgrammeRegistrations(programmeId),
      fetchProgrammeAttendance(user.id, programmeId).catch(() => []),
    ])
      .then(([regs, attendanceRows]) => {
        setRegistrations(regs || []);
        setAttendance(attendanceRows || []);
      })
      .catch(() => {
        setRegistrations([]);
        setAttendance([]);
      })
      .finally(() => setLoadingRegs(false));
  }, [programmeId, user?.id]);

  const selectedProgramme = programmes.find((p) => String(p.id) === String(programmeId));

  const summary = useMemo(() => {
    const total = registrations.length;
    const active = registrations.filter((r) => r.status === 'ACTIVE').length;
    const pending = registrations.filter((r) =>
      ['PENDING_PAYMENT_VERIFICATION', 'PENDING_TEAM'].includes(r.status)
    ).length;
    const meritPoints = selectedProgramme?.meritPoints || 0;
    const estimatedMerit = active * meritPoints;
    return { total, active, pending, estimatedMerit, meritPoints };
  }, [registrations, selectedProgramme]);

  const reportData = useMemo(() => {
    if (selectedReport === 'Attendance Summary') {
      const headers = ['Name', 'Matric', 'Faculty', 'Session', 'Status', 'Checked In'];
      const rows = attendance.map((row) => [
        row.studentFullName,
        row.matricNumber,
        row.faculty || '—',
        row.sessionLabel || '—',
        row.attendanceStatus || '—',
        formatDateTime(row.checkedInAt),
      ]);
      return { headers, rows };
    }

    if (selectedReport === 'Merit Summary') {
      const headers = ['Name', 'Matric', 'Faculty', 'Reg. Status', 'Merit Pts'];
      const rows = registrations.map((row) => [
        row.studentFullName,
        row.matricNumber,
        row.faculty || '—',
        row.status,
        row.status === 'ACTIVE' ? summary.meritPoints : 0,
      ]);
      return { headers, rows };
    }

    const headers = ['Name', 'Matric', 'Faculty', 'Status', 'Registered At'];
    const rows = registrations.map((row) => [
      row.studentFullName,
      row.matricNumber,
      row.faculty || '—',
      row.status,
      formatDateTime(row.registeredAt),
    ]);
    return { headers, rows };
  }, [selectedReport, attendance, registrations, summary.meritPoints]);

  const summaryLines = [
    `Total registrations: ${summary.total}`,
    `Active participants: ${summary.active}`,
    `Pending approvals: ${summary.pending}`,
  ];
  if (selectedReport === 'Merit Summary') {
    summaryLines.push(`Merit per active participant: ${summary.meritPoints}`);
    summaryLines.push(`Estimated merit issued: ${summary.estimatedMerit}`);
  }
  if (selectedReport === 'Attendance Summary') {
    summaryLines.push(`Attendance records: ${attendance.length}`);
  }

  const handleExportPdf = async () => {
    setExporting('pdf');
    try {
      exportReportPdf({
        programmeTitle: selectedProgramme?.title,
        organizerClub: user.clubName || selectedProgramme?.organizerClub,
        reportType: selectedReport,
        headers: reportData.headers,
        rows: reportData.rows,
        summaryLines,
        venue: selectedProgramme?.venue,
        startDate: selectedProgramme?.startDate,
        endDate: selectedProgramme?.endDate,
        generatedBy: user.fullName || 'CampusLink+ System',
        programmeId: selectedProgramme?.id,
      });
      setSnackbar({ open: true, message: 'PDF report downloaded.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to export PDF report.', severity: 'error' });
    } finally {
      setExporting('');
    }
  };

  const handleExportExcel = async () => {
    setExporting('excel');
    try {
      exportReportCsv({
        programmeTitle: selectedProgramme?.title,
        reportType: selectedReport,
        headers: reportData.headers,
        rows: reportData.rows,
      });
      setSnackbar({ open: true, message: 'Excel-compatible CSV downloaded.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to export Excel file.', severity: 'error' });
    } finally {
      setExporting('');
    }
  };

  return (
    <OrganizerLayout>
      <PortalHero
        eyebrow="Organizer Portal"
        title="Reports"
        subtitle={user.clubName
          ? `Export registration, attendance, and merit reports for ${user.clubName}.`
          : 'Generate programme reports from live registration data.'}
      />

      {programmesError && (
        <Alert severity="warning" sx={{ mb: 3 }}>{programmesError}</Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : programmes.length === 0 ? (
        <EmptyState title="No programmes to report on" description="Approved programmes will appear here for reporting." />
      ) : (
        <>
          <SectionCard title="Report Settings" sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField select label="Programme" size="small" value={programmeId} onChange={(e) => setProgrammeId(e.target.value)} sx={{ minWidth: 280 }}>
                {programmes.map((p) => (
                  <MenuItem key={p.id} value={String(p.id)}>{p.title}</MenuItem>
                ))}
              </TextField>
              <TextField select label="Report type" size="small" value={selectedReport} onChange={(e) => setSelectedReport(e.target.value)} sx={{ minWidth: 220 }}>
                {REPORT_TYPES.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                startIcon={<PictureAsPdfOutlinedIcon />}
                onClick={handleExportPdf}
                disabled={Boolean(exporting)}
              >
                {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<TableViewOutlinedIcon />}
                onClick={handleExportExcel}
                disabled={Boolean(exporting)}
              >
                {exporting === 'excel' ? 'Exporting...' : 'Export Excel'}
              </Button>
            </Box>
            {selectedProgramme && (
              <Typography sx={{ mt: 2, color: '#475569', fontSize: '0.85rem' }}>
                Programme dates: {formatProgrammeDate(selectedProgramme.startDate)}
                {selectedProgramme.endDate ? ` – ${formatProgrammeDate(selectedProgramme.endDate)}` : ''}
                {selectedProgramme.venue ? ` · Venue: ${selectedProgramme.venue}` : ''}
              </Typography>
            )}
          </SectionCard>

          <Box className="portal-grid portal-grid--stats" sx={{ mb: 3 }}>
            <DashboardCard label="Total Registrations" value={summary.total} subtitle="All statuses" icon={GroupsOutlinedIcon} variant="blue" />
            <DashboardCard label="Active" value={summary.active} subtitle="Confirmed participants" icon={TaskAltOutlinedIcon} variant="green" />
            <DashboardCard label="Pending" value={summary.pending} subtitle="Payment or team pending" icon={PendingActionsOutlinedIcon} variant="amber" />
          </Box>

          <SectionCard title={selectedReport} subtitle={selectedProgramme?.title}>
            {loadingRegs ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={28} /></Box>
            ) : reportData.rows.length === 0 ? (
              <Alert severity="info">
                {selectedReport === 'Attendance Summary'
                  ? 'No attendance check-ins recorded for this programme yet.'
                  : 'No registrations recorded for this programme yet.'}
              </Alert>
            ) : (
              <Box className="portal-table-wrap" sx={{ overflowX: 'auto' }}>
                <Table className="portal-table" size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {reportData.headers.map((header) => (
                        <TableCell key={header}>{header}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.rows.map((row, index) => (
                      <TableRow key={`${row[1] || 'row'}-${index}`} hover>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={`${index}-${cellIndex}`} sx={{ color: cellIndex === 0 ? '#0f172a' : '#334155', fontWeight: cellIndex === 0 ? 700 : 400 }}>
                            {cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </SectionCard>
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </OrganizerLayout>
  );
};

export default Reports;
