import React from 'react';
import { Alert, Box, Button, Chip, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import HepaLayout from './HepaLayout';
import PortalHero from './Student/ui/PortalHero';
import DashboardCard from './Student/ui/DashboardCard';
import SectionCard from './Student/ui/SectionCard';
import EmptyState from './Student/ui/EmptyState';
import useHepaDashboard from '../hooks/useHepaDashboard';
import { formatProgrammeDate, getProgrammeStatusLabel, getProgrammeStatusStyle } from '../utils/organizerProgrammeStatus';

const ProgrammeStatusChip = ({ status }) => {
  const style = getProgrammeStatusStyle(status);
  return (
    <Chip
      label={getProgrammeStatusLabel(status)}
      size="small"
      sx={{ bgcolor: style.bg, color: style.color, border: `1px solid ${style.border}`, fontWeight: 700 }}
    />
  );
};

function formatRoleLabel(role) {
  if (!role) return '—';
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function HEPADashboard() {
  const navigate = useNavigate();
  const { data, loading, error, user } = useHepaDashboard();
  const firstName = (data.fullName || user.fullName || 'HEPA').split(' ')[0];

  return (
    <HepaLayout>
      <PortalHero
        eyebrow="HEPA Portal"
        title={`Welcome, ${firstName}`}
        subtitle="Final programme approval, role upgrade reviews, and campus-wide co-curricular oversight."
      />

      {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box className="portal-grid portal-grid--stats" sx={{ mb: 3 }}>
            <DashboardCard
              label="Pending Programmes"
              value={data.pendingProgrammeApproval}
              subtitle="Awaiting HEPA approval"
              icon={FactCheckOutlinedIcon}
              variant="amber"
              onClick={() => navigate('/admin/approvals')}
            />
            <DashboardCard
              label="Pending Role Requests"
              value={data.pendingRoleRequests}
              subtitle="Organizer / MPP upgrades"
              icon={HowToRegOutlinedIcon}
              variant="blue"
              onClick={() => navigate('/admin/requests')}
            />
            <DashboardCard
              label="Approved Programmes"
              value={data.approvedProgrammes}
              subtitle="Published for registration"
              icon={TaskAltOutlinedIcon}
              variant="green"
              onClick={() => navigate('/admin/reports')}
            />
            <DashboardCard
              label="Campus Users"
              value={data.totalStudents + data.totalOrganizers}
              subtitle={`${data.totalStudents} students · ${data.totalOrganizers} organizers`}
              icon={GroupsOutlinedIcon}
              variant="purple"
              onClick={() => navigate('/admin/users')}
            />
          </Box>

          <Box className="portal-grid portal-grid--2" sx={{ mb: 3 }}>
            <SectionCard
              title="Programmes Pending HEPA Approval"
              action={(
                <Button size="small" variant="contained" onClick={() => navigate('/admin/approvals')}>
                  Review
                </Button>
              )}
            >
              {data.recentPendingProgrammes.length === 0 ? (
                <EmptyState message="No programmes awaiting HEPA approval." />
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Programme</TableCell>
                        <TableCell>Club</TableCell>
                        <TableCell>MPP Remarks</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.recentPendingProgrammes.map((p) => (
                        <TableRow key={p.id} hover>
                          <TableCell sx={{ fontWeight: 700 }}>{p.title}</TableCell>
                          <TableCell>{p.organizerClub || '—'}</TableCell>
                          <TableCell>{p.mppRemarks || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </SectionCard>

            <SectionCard
              title="Recent Role Requests"
              action={(
                <Button size="small" variant="contained" onClick={() => navigate('/admin/requests')}>
                  Manage
                </Button>
              )}
            >
              {data.recentRoleRequests.length === 0 ? (
                <EmptyState message="No pending role requests." />
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Requested Role</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.recentRoleRequests.map((r) => (
                        <TableRow key={r.id} hover>
                          <TableCell sx={{ fontWeight: 700 }}>{r.requesterName}</TableCell>
                          <TableCell>{formatRoleLabel(r.requestedRole)}</TableCell>
                          <TableCell><ProgrammeStatusChip status={r.status} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </SectionCard>
          </Box>
        </>
      )}
    </HepaLayout>
  );
}

export default HEPADashboard;
