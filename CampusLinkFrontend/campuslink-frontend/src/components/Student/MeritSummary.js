import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Rating,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import StudentLayout from './layout/StudentLayout';
import PageHeader from './ui/PageHeader';
import DashboardCard from './ui/DashboardCard';
import SectionCard from './ui/SectionCard';
import StatusBadge from './ui/StatusBadge';
import MeritTypeBadge from './ui/MeritTypeBadge';
import PortalSearchField from './ui/PortalSearchField';
import PortalFilterSelect from './ui/PortalFilterSelect';
import MeritStarJustification from './ui/MeritStarJustification';
import { useStoredUser } from '../../hooks/useStoredUser';
import useStudentStats from '../../hooks/useStudentStats';
import useStudentMeritRecords from '../../hooks/useStudentMeritRecords';
import { generateMeritTranscriptPdf } from '../../utils/generateMeritTranscriptPdf';
import { calculateMeritStars, isMeritRecordCompleted } from '../../utils/meritStars';

const ACADEMIC_YEARS = ['All', '2023', '2024', '2025', '2026'];
const SEMESTERS = ['All', 'Semester 1', 'Semester 2'];
const LEVELS = ['All', 'University', 'National', 'International'];
const ROLES = ['All', 'Participant', 'Programme Director', 'Secretary', 'Special Contributor'];

const glassCardSx = {
  background: 'rgba(255, 255, 255, 0.94)',
  border: '1px solid rgba(37, 99, 235, 0.1)',
  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(37, 99, 235, 0.06)',
  borderRadius: '12px',
};

const printButtonSx = {
  fontWeight: 700,
  borderRadius: '10px',
  fontSize: '0.8125rem',
  px: 2,
  py: 0.875,
  whiteSpace: 'nowrap',
  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  boxShadow: '0 4px 12px rgba(37,99,235,0.28)',
  '&:hover': {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  },
};

const computeTotals = (records) => {
  const completed = records.filter((r) => isMeritRecordCompleted(r.status));
  return {
    total: completed.reduce((sum, r) => sum + (Number(r.meritAwarded) || 0), 0),
    participant: completed.filter((r) => r.meritType === 'participant').reduce((s, r) => s + (Number(r.meritAwarded) || 0), 0),
    committee: completed.filter((r) => r.meritType === 'committee').reduce((s, r) => s + (Number(r.meritAwarded) || 0), 0),
    special: completed.filter((r) => r.meritType === 'special').reduce((s, r) => s + (Number(r.meritAwarded) || 0), 0),
  };
};

const MeritSummary = () => {
  const { user } = useStoredUser();
  const stats = useStudentStats();
  const { records: meritTranscriptRecords, loading } = useStudentMeritRecords();
  const [year, setYear] = useState('All');
  const [semester, setSemester] = useState('All');
  const [level, setLevel] = useState('All');
  const [role, setRole] = useState('All');
  const [search, setSearch] = useState('');

  const filteredRecords = useMemo(() => meritTranscriptRecords.filter((record) => {
    if (year !== 'All' && record.academicYear !== year) return false;
    if (semester !== 'All' && record.semester !== semester) return false;
    if (level !== 'All' && record.programmeLevel !== level) return false;
    if (role !== 'All' && record.role !== role) return false;
    if (search && !record.programmeTitle.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [year, semester, level, role, search, meritTranscriptRecords]);

  const totals = useMemo(() => computeTotals(filteredRecords), [filteredRecords]);
  const starLevel = calculateMeritStars(stats.meritPoints, totals.committee);

  const handlePrint = () => {
    if (filteredRecords.length === 0) return;
    generateMeritTranscriptPdf({ user, records: filteredRecords, totals });
  };

  const meritStatItems = [
    { label: 'Total Merit Points', value: totals.total, color: '#1d4ed8', bg: '#eff6ff' },
    { label: 'Participant Merit', value: totals.participant, color: '#2563eb', bg: '#dbeafe' },
    { label: 'Committee Merit', value: totals.committee, color: '#6d28d9', bg: '#ede9fe' },
    { label: 'Special Contribution', value: totals.special, color: '#b45309', bg: '#fef3c7' },
  ];

  return (
    <StudentLayout>
      <PageHeader
        title="Merit Summary"
        subtitle="Merit points are awarded at least 2 weeks after a programme ends. View your points, achievement level, and co-curricular transcript here."
      />

      <Box className="portal-grid portal-grid--stats" sx={{ mb: 3 }}>
        <DashboardCard
          label="Total Merit Points"
          value={stats.meritPoints}
          subtitle={`${starLevel} star level`}
          icon={EmojiEventsOutlinedIcon}
          variant="amber"
        />
        <DashboardCard
          label="Programmes Joined"
          value={stats.programsJoined}
          subtitle="Active registrations"
          icon={GroupsOutlinedIcon}
          variant="blue"
        />
        <DashboardCard
          label="Completed"
          value={stats.completedPrograms}
          subtitle="Approved programmes"
          variant="green"
        />
        <DashboardCard
          label="Attendance Rate"
          value={stats.attendanceRate}
          subtitle="From attendance history"
          icon={EventAvailableOutlinedIcon}
          variant="purple"
        />
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ ...glassCardSx, height: '100%' }}>
            <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid rgba(37,99,235,0.08)' }}>
              <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>Achievement Level</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', py: 3, px: 2 }}>
              <Rating value={starLevel} readOnly size="large" sx={{ mb: 1.5, '& .MuiRating-iconFilled': { color: '#2563eb' } }} />
              <Typography sx={{ fontWeight: 800, fontSize: '2.25rem', color: '#1d4ed8' }}>{stats.meritPoints}</Typography>
              <Typography sx={{ color: '#475569', fontSize: '0.85rem' }}>Total merit points</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ ...glassCardSx, p: 2.5, height: '100%' }}>
            <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem', mb: 2 }}>Transcript Merit Breakdown</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 1.5 }}>
              {meritStatItems.map((item) => (
                <Box key={item.label} sx={{ p: 1.5, borderRadius: '10px', bgcolor: item.bg, border: '1px solid rgba(37,99,235,0.1)' }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600, mb: 0.5 }}>{item.label}</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color: item.color }}>{item.value}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ ...glassCardSx, p: 2.5, mb: 3 }}>
        <MeritStarJustification />
      </Box>

      <SectionCard
        title="Merit Transcript"
        subtitle={loading ? 'Loading records...' : `${filteredRecords.length} programme${filteredRecords.length === 1 ? '' : 's'}`}
        noPadding
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<PrintOutlinedIcon />}
            onClick={handlePrint}
            disabled={filteredRecords.length === 0}
            sx={printButtonSx}
          >
            Print Transcript
          </Button>
        }
      >
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 2,
            bgcolor: 'rgba(239, 246, 255, 0.55)',
            borderBottom: '1px solid rgba(37,99,235,0.1)',
          }}
        >
          <Grid container spacing={1.5} alignItems="flex-end">
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <PortalSearchField
                label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Programme name..."
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3, lg: 2.25 }}>
              <PortalFilterSelect label="Academic Year" value={year} onChange={(e) => setYear(e.target.value)} options={ACADEMIC_YEARS} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3, lg: 2.25 }}>
              <PortalFilterSelect label="Semester" value={semester} onChange={(e) => setSemester(e.target.value)} options={SEMESTERS} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3, lg: 2.25 }}>
              <PortalFilterSelect label="Programme Level" value={level} onChange={(e) => setLevel(e.target.value)} options={LEVELS} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3, lg: 2.25 }}>
              <PortalFilterSelect label="Role" value={role} onChange={(e) => setRole(e.target.value)} options={ROLES} />
            </Grid>
          </Grid>
        </Box>

        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 1.5,
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: 1.5, sm: 2 },
            bgcolor: 'rgba(239, 246, 255, 0.45)',
            borderBottom: '1px solid rgba(37, 99, 235, 0.08)',
          }}
        >
          {meritStatItems.map((item) => (
            <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.8rem', color: '#475569' }}>{item.label}:</Typography>
              <Typography sx={{ fontWeight: 800, color: item.color, fontSize: '0.875rem' }}>{item.value}</Typography>
            </Box>
          ))}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, overflowX: 'auto' }}>
              <TableContainer className="portal-table">
                <Table stickyHeader size="small" sx={{ minWidth: 900 }}>
                  <TableHead>
                    <TableRow>
                      {['Programme Title', 'Category', 'Level', 'Start Date', 'End Date', 'Role / Position', 'Merit', 'Type', 'Status'].map((header) => (
                        <TableCell key={header}>{header}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4, color: '#475569' }}>No merit records available.</TableCell>
                      </TableRow>
                    ) : (
                      filteredRecords.map((record) => (
                        <TableRow key={record.id} hover>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', minWidth: 160, color: '#0f172a' }}>{record.programmeTitle}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: '#334155', whiteSpace: 'nowrap' }}>{record.category}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}><LevelChip level={record.programmeLevel} /></TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: '#475569', whiteSpace: 'nowrap' }}>{record.startDate}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: '#475569', whiteSpace: 'nowrap' }}>{record.endDate}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>{record.role}</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#1d4ed8', fontSize: '0.85rem' }}>{record.meritAwarded}</TableCell>
                          <TableCell><MeritTypeBadge meritType={record.meritType} /></TableCell>
                          <TableCell><StatusBadge status={isMeritRecordCompleted(record.status) ? 'Completed' : 'Pending'} /></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box sx={{ display: { xs: 'block', sm: 'none' }, p: 2 }}>
              {filteredRecords.length === 0 ? (
                <Typography sx={{ textAlign: 'center', color: '#475569', py: 3 }}>No merit records available.</Typography>
              ) : (
                filteredRecords.map((record) => (
                  <Box key={record.id} sx={{ p: 2, mb: 1.5, borderRadius: '12px', bgcolor: '#fff', border: '1px solid rgba(37,99,235,0.12)' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', mb: 0.5, color: '#0f172a' }}>{record.programmeTitle}</Typography>
                    <Typography sx={{ color: '#475569', fontSize: '0.75rem', mb: 1 }}>{record.category} · {record.programmeLevel}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#334155', mb: 1 }}>{record.startDate} – {record.endDate}</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>{record.role}</Typography>
                      <Typography sx={{ fontWeight: 800, color: '#1d4ed8' }}>{record.meritAwarded} pts</Typography>
                      <MeritTypeBadge meritType={record.meritType} />
                      <StatusBadge status={isMeritRecordCompleted(record.status) ? 'Completed' : 'Pending'} />
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </>
        )}
      </SectionCard>
    </StudentLayout>
  );
};

function LevelChip({ level }) {
  const colors = {
    University: { bg: '#dbeafe', color: '#1d4ed8' },
    National: { bg: '#ede9fe', color: '#6d28d9' },
    International: { bg: '#fef3c7', color: '#b45309' },
  };
  const style = colors[level] || colors.University;
  return (
    <Box component="span" sx={{ px: 1, py: 0.25, borderRadius: '6px', bgcolor: style.bg, color: style.color, fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
      {level}
    </Box>
  );
}

export default MeritSummary;
