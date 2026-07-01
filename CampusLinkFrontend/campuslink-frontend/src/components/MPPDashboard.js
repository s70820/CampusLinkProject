import React from 'react';
import { Alert, Box, Button, Chip, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ForwardToInboxOutlinedIcon from '@mui/icons-material/ForwardToInboxOutlined';
import MppLayout from './MppLayout';
import PortalHero from './Student/ui/PortalHero';
import DashboardCard from './Student/ui/DashboardCard';
import SectionCard from './Student/ui/SectionCard';
import EmptyState from './Student/ui/EmptyState';
import useMppDashboard from '../hooks/useMppDashboard';
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

function MPPDashboard() {
  const navigate = useNavigate();
  const { data, loading, error, user } = useMppDashboard();
  const firstName = (data.fullName || user.fullName || 'MPP').split(' ')[0];

  return (
    <MppLayout>
      <PortalHero
        eyebrow="MPP Portal"
        title={`Welcome, ${firstName}`}
        subtitle="Review submitted programmes, track MPP approval progress, and forward qualified programmes to HEPA."
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
              label="Pending Review"
              value={data.pendingReview}
              subtitle="Awaiting MPP decision"
              icon={RateReviewOutlinedIcon}
              variant="amber"
              onClick={() => navigate('/mpp/reviews')}
            />
            <DashboardCard
              label="MPP Approved"
              value={data.mppApproved}
              subtitle="Forwarded or published"
              icon={TaskAltOutlinedIcon}
              variant="green"
              onClick={() => navigate('/mpp/reviews')}
            />
            <DashboardCard
              label="MPP Rejected"
              value={data.mppRejected}
              subtitle="Returned to organizers"
              icon={CancelOutlinedIcon}
              variant="amber"
              onClick={() => navigate('/mpp/reviews')}
            />
            <DashboardCard
              label="Forwarded to HEPA"
              value={data.forwardedToHepa}
              subtitle="Pending final approval"
              icon={ForwardToInboxOutlinedIcon}
              variant="blue"
              onClick={() => navigate('/mpp/reviews')}
            />
          </Box>

          <SectionCard
            title="Programmes Awaiting MPP Review"
            action={(
              <Button variant="contained" size="small" onClick={() => navigate('/mpp/reviews')}>
                Open Reviews
              </Button>
            )}
          >
            {data.recentPending.length === 0 ? (
              <EmptyState message="No programmes are currently awaiting MPP review." />
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Programme</TableCell>
                      <TableCell>Club</TableCell>
                      <TableCell>Organizer</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.recentPending.map((programme) => (
                      <TableRow key={programme.id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>{programme.title}</TableCell>
                        <TableCell>{programme.organizerClub || '—'}</TableCell>
                        <TableCell>{programme.organizerName || '—'}</TableCell>
                        <TableCell>{formatProgrammeDate(programme.startDate, programme.endDate)}</TableCell>
                        <TableCell><ProgrammeStatusChip status={programme.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </SectionCard>
        </>
      )}
    </MppLayout>
  );
}

export default MPPDashboard;
