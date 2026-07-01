import React, { useState } from 'react';
import { Alert, Box, Button, CircularProgress, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import CardMembershipOutlinedIcon from '@mui/icons-material/CardMembershipOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import QrCodeScannerOutlinedIcon from '@mui/icons-material/QrCodeScannerOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import StudentLayout from './Student/layout/StudentLayout';
import PortalHero from './Student/ui/PortalHero';
import DashboardCard from './Student/ui/DashboardCard';
import SectionCard from './Student/ui/SectionCard';
import ProgrammeCard from './Student/ui/ProgrammeCard';
import EmptyState from './Student/ui/EmptyState';
import RegistrationForm from './RegistrationForm';
import ProgrammeDetailsDialog from './ProgrammeDetailsDialog';
import { useStoredUser } from '../hooks/useStoredUser';
import useStudentStats from '../hooks/useStudentStats';
import useApprovedProgrammes from '../hooks/useApprovedProgrammes';
import { getFeaturedProgrammes } from '../utils/programmeMapper';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useStoredUser();
  const stats = useStudentStats();
  const { programmes, loading, error, reloadProgrammes } = useApprovedProgrammes();
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedProgramme, setSelectedProgramme] = useState(null);

  const { programsJoined: registeredCount, sessionsAttended: attendedCount, certificatesReady: certificateCount } = stats;
  const featuredProgrammes = getFeaturedProgrammes(programmes, 3);

  const quickActions = [
    { label: 'Browse Programmes', icon: SearchOutlinedIcon, path: '/browse' },
    { label: 'View Attendance', icon: QrCodeScannerOutlinedIcon, path: '/attendance' },
    { label: 'Request Role', icon: HowToRegOutlinedIcon, path: '/student/request-role' },
    { label: 'View Certificates', icon: CardMembershipOutlinedIcon, path: '/student/certificates' },
  ];

  return (
    <StudentLayout>
      <PortalHero
        title={`Welcome back, ${user.fullName?.split(' ')[0] || 'Student'}`}
        subtitle="Your summary hub for programmes, quick actions, and featured activities."
      />

      <Box className="portal-grid portal-grid--stats" sx={{ mb: 3 }}>
        <DashboardCard
          label="Merit Points"
          value={stats.meritPoints}
          subtitle="Current total"
          icon={EmojiEventsOutlinedIcon}
          variant="amber"
          onClick={() => navigate('/student/merit-summary')}
        />
        <DashboardCard
          label="Programmes Joined"
          value={registeredCount}
          subtitle="Total registrations"
          icon={GroupsOutlinedIcon}
          variant="blue"
          onClick={() => navigate('/registrations')}
        />
        <DashboardCard
          label="Sessions Attended"
          value={attendedCount}
          subtitle="From attendance history"
          icon={EventAvailableOutlinedIcon}
          variant="green"
          onClick={() => navigate('/attendance')}
        />
        <DashboardCard
          label="Certificates"
          value={certificateCount}
          subtitle="Ready to download"
          icon={CardMembershipOutlinedIcon}
          variant="purple"
          onClick={() => navigate('/student/certificates')}
        />
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <SectionCard title="Quick Actions" sx={{ mb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
          {quickActions.map(({ label, icon: Icon, path }) => (
            <Button
              key={label}
              variant="outlined"
              startIcon={<Icon />}
              onClick={() => navigate(path)}
              sx={{
                py: 1.5,
                justifyContent: 'flex-start',
                borderRadius: '10px',
                borderColor: 'rgba(37, 99, 235, 0.25)',
                color: '#1d4ed8',
                fontWeight: 600,
                '&:hover': { bgcolor: '#eff6ff', borderColor: '#2563eb' },
              }}
            >
              {label}
            </Button>
          ))}
        </Box>
      </SectionCard>

      <SectionCard
        title="Featured Programmes"
        subtitle="Register for upcoming co-curricular activities"
        action={<Button size="small" onClick={() => navigate('/browse')}>Browse all</Button>}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : featuredProgrammes.length === 0 ? (
          <EmptyState
            title="No programmes available"
            description="Approved programmes will appear here once they are published."
            actionLabel="Browse Programmes"
            onAction={() => navigate('/browse')}
          />
        ) : (
          <Grid container spacing={2}>
            {featuredProgrammes.map((programme) => (
              <Grid key={programme.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <ProgrammeCard
                  programme={programme}
                  onViewDetails={(p) => { setSelectedProgramme(p); setDetailsOpen(true); }}
                  onRegister={(p) => { if (p.canRegister !== false) { setSelectedProgramme(p); setRegistrationOpen(true); } }}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </SectionCard>

      <ProgrammeDetailsDialog
        open={detailsOpen}
        onClose={() => { setDetailsOpen(false); setSelectedProgramme(null); }}
        programme={selectedProgramme}
        onRegister={(p) => { if (p.canRegister !== false) { setSelectedProgramme(p); setRegistrationOpen(true); } }}
      />
      <RegistrationForm
        open={registrationOpen}
        onClose={() => { setRegistrationOpen(false); setSelectedProgramme(null); }}
        programme={selectedProgramme}
        onRegistered={reloadProgrammes}
      />
    </StudentLayout>
  );
};

export default Dashboard;
