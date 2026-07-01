import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import HepaLayout from './HepaLayout';
import PortalHero from './Student/ui/PortalHero';
import SectionCard from './Student/ui/SectionCard';
import EmptyState from './Student/ui/EmptyState';
import ProgrammeReviewDialog from './review/ProgrammeReviewDialog';
import { useStoredUser } from '../hooks/useStoredUser';
import {
  approveHepaProgramme,
  fetchHepaPendingProgrammes,
  rejectHepaProgramme,
} from '../services/hepaApi';
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

function HEPAProgrammeApprovals() {
  const { user } = useStoredUser();
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadProgrammes = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await fetchHepaPendingProgrammes(user.id);
      setProgrammes(data);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to load programmes pending HEPA approval.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadProgrammes();
  }, [loadProgrammes]);

  const handleReviewAction = async (action) => {
    if (!selectedProgramme) return;
    try {
      setActionLoading(true);
      if (action === 'approve') {
        await approveHepaProgramme(selectedProgramme.id, remarks.trim());
        setSnackbar({
          open: true,
          message: `"${selectedProgramme.title}" approved and published for student registration.`,
          severity: 'success',
        });
      } else {
        await rejectHepaProgramme(selectedProgramme.id, remarks.trim());
        setSnackbar({
          open: true,
          message: `"${selectedProgramme.title}" rejected.`,
          severity: 'success',
        });
      }
      setSelectedProgramme(null);
      setRemarks('');
      await loadProgrammes();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || `Failed to ${action} programme.`,
        severity: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <HepaLayout>
      <PortalHero
        eyebrow="HEPA Portal"
        title="Programme Approvals"
        subtitle="Final approval for programmes reviewed by MPP. Approved programmes become visible to students for registration."
      />

      <SectionCard
        title={`Pending HEPA Approval (${programmes.length})`}
        action={(
          <Button variant="outlined" size="small" onClick={loadProgrammes} disabled={loading}>
            Refresh
          </Button>
        )}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : programmes.length === 0 ? (
          <EmptyState message="No programmes are currently awaiting HEPA approval." />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Organizer</TableCell>
                  <TableCell>Club</TableCell>
                  <TableCell>MPP Status</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {programmes.map((programme) => (
                  <TableRow key={programme.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{programme.title}</TableCell>
                    <TableCell>{programme.organizerName || '—'}</TableCell>
                    <TableCell>{programme.organizerClub || '—'}</TableCell>
                    <TableCell>{programme.mppStatus || '—'}</TableCell>
                    <TableCell><ProgrammeStatusChip status={programme.status} /></TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          setSelectedProgramme(programme);
                          setRemarks('');
                        }}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionCard>

      <ProgrammeReviewDialog
        open={Boolean(selectedProgramme)}
        programme={selectedProgramme}
        reviewMode="hepa"
        remarks={remarks}
        onRemarksChange={setRemarks}
        onClose={() => {
          if (!actionLoading) {
            setSelectedProgramme(null);
            setRemarks('');
          }
        }}
        onApprove={() => handleReviewAction('approve')}
        onReject={() => handleReviewAction('reject')}
        actionLoading={actionLoading}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar((p) => ({ ...p, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </HepaLayout>
  );
}

export default HEPAProgrammeApprovals;
