import React from 'react';
import { Alert, Box, Button, Chip, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import OrganizerLayout from './OrganizerLayout';
import PortalHero from './Student/ui/PortalHero';
import DashboardCard from './Student/ui/DashboardCard';
import SectionCard from './Student/ui/SectionCard';
import EmptyState from './Student/ui/EmptyState';
import useOrganizerDashboard from '../hooks/useOrganizerDashboard';
import { formatProgrammeDate, getProgrammeStatusLabel, getProgrammeStatusStyle } from '../utils/organizerProgrammeStatus';

const ProgrammeStatusChip = ({ status }) => {
  const style = getProgrammeStatusStyle(status);
  return (
    <Chip
      label={getProgrammeStatusLabel(status)}
      size="small"
      sx={{
        bgcolor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontWeight: 700,
      }}
    />
  );
};

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const { data, loading, error, user } = useOrganizerDashboard();
  const firstName = (data.fullName || user.fullName || 'Organizer').split(' ')[0];
  const clubLabel = data.clubName || user.clubName;

  const quickActions = [
    { label: 'Create Programme', icon: AddCircleOutlineOutlinedIcon, path: '/organizer/create-programme' },
    { label: 'My Programmes', icon: ListAltOutlinedIcon, path: '/organizer/programmes' },
    { label: 'View Registrations', icon: HowToRegOutlinedIcon, path: '/organizer/registrations' },
  ];

  return (
    <OrganizerLayout>
      <PortalHero
        eyebrow="Organizer Portal"
        title={`Welcome back, ${firstName}`}
        subtitle={
          clubLabel
            ? `Managing programmes for ${clubLabel}. Track approvals, registrations, and participant activity.`
            : 'Manage your club programmes, track pending approvals, and review participant activity.'
        }
      />

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && data.draftProgrammes > 0 && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: '10px' }}>
          You have {data.draftProgrammes} draft programme{data.draftProgrammes === 1 ? '' : 's'}. Drafts are removed after 14 days without updates (with a 7-day warning).{' '}
          <Button
            size="small"
            variant="text"
            sx={{ fontWeight: 700, ml: 0.5 }}
            onClick={() => navigate('/organizer/programmes')}
          >
            Go to My Programmes
          </Button>
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box className="portal-grid portal-grid--stats" sx={{ mb: 3 }}>
            <DashboardCard
              label="Total Programmes"
              value={data.totalProgrammes}
              subtitle="Created by your club"
              icon={EventNoteOutlinedIcon}
              variant="blue"
              onClick={() => navigate('/organizer/programmes')}
            />
            <DashboardCard
              label="Pending Approval"
              value={data.pendingApproval}
              subtitle="Awaiting MPP or HEPA review"
              icon={PendingActionsOutlinedIcon}
              variant="amber"
              onClick={() => navigate('/organizer/programmes')}
            />
            <DashboardCard
              label="Approved Programmes"
              value={data.approvedProgrammes}
              subtitle="Open for student registration"
              icon={TaskAltOutlinedIcon}
              variant="green"
              onClick={() => navigate('/organizer/programmes')}
            />
            <DashboardCard
              label="Total Participants"
              value={data.totalParticipants}
              subtitle={`${data.activeRegistrations} confirmed active`}
              icon={GroupsOutlinedIcon}
              variant="purple"
              onClick={() => navigate('/organizer/registrations')}
            />
          </Box>

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

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '2fr 1fr' }, gap: 3 }}>
            <SectionCard
              title="Your Programmes"
              subtitle={clubLabel ? `Programmes organised by ${clubLabel}` : 'Recent programmes you manage'}
            >
              {data.recentProgrammes.length === 0 ? (
                <EmptyState
                  title="No programmes yet"
                  description="Create your first club programme to get started."
                  actionLabel="Create Programme"
                  onAction={() => navigate('/organizer/create-programme')}
                />
              ) : (
                <Box className="portal-table-wrap">
                  <Table className="portal-table" size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Programme</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Participants</TableCell>
                        <TableCell sx={{ width: 150 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.recentProgrammes.map((programme) => (
                        <TableRow key={programme.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{programme.title}</TableCell>
                          <TableCell>{programme.category || '—'}</TableCell>
                          <TableCell><ProgrammeStatusChip status={programme.status} /></TableCell>
                          <TableCell>{formatProgrammeDate(programme.startDate)}</TableCell>
                          <TableCell align="right">{programme.participantCount ?? 0}</TableCell>
                          <TableCell>
                            {programme.status === 'DRAFT' ? (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<EditOutlinedIcon />}
                                onClick={() => navigate(`/organizer/create-programme/${programme.id}`)}
                              >
                                Continue
                              </Button>
                            ) : (
                              '—'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </SectionCard>

            <SectionCard title="Club Insights" subtitle="Live metrics from your programmes">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Box sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>Avg. participants / programme</Box>
                    <Box sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {data.averageParticipantsPerProgramme.toFixed(1)}
                    </Box>
                  </Box>
                  <Chip label="Live" size="small" color="primary" variant="outlined" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Box sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>Draft programmes</Box>
                    <Box sx={{ color: '#64748b', fontSize: '0.85rem' }}>{data.draftProgrammes}</Box>
                  </Box>
                  <Chip label={data.draftProgrammes > 0 ? 'Action needed' : 'Clear'} size="small" color={data.draftProgrammes > 0 ? 'warning' : 'success'} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Box sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>Active registrations</Box>
                    <Box sx={{ color: '#64748b', fontSize: '0.85rem' }}>{data.activeRegistrations} confirmed students</Box>
                  </Box>
                  <Chip label="Updated" size="small" color="success" variant="outlined" />
                </Box>
              </Box>
            </SectionCard>
          </Box>
        </>
      )}
    </OrganizerLayout>
  );
};

export default OrganizerDashboard;
